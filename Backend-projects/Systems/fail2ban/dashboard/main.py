import os
import json
import re
import time
import datetime
from typing import Optional, Dict, Any, List

import paramiko
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

ROOT = os.path.dirname(__file__)
SERVERS_FILE = os.path.join(ROOT, "servers.json")
REPORTS_FILE = os.path.join(ROOT, "reports.json")

app = FastAPI()
app.mount("/static", StaticFiles(directory=os.path.join(ROOT, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(ROOT, "templates"))


def load_servers() -> List[Dict[str, Any]]:
    if not os.path.exists(SERVERS_FILE):
        return []
    with open(SERVERS_FILE, "r") as f:
        return json.load(f)


def save_servers(servers: List[Dict[str, Any]]):
    with open(SERVERS_FILE, "w") as f:
        json.dump(servers, f, indent=2)


def load_reports() -> List[Dict[str, Any]]:
    if not os.path.exists(REPORTS_FILE):
        return []
    with open(REPORTS_FILE, "r") as f:
        return json.load(f)


def save_reports(reports: List[Dict[str, Any]]):
    with open(REPORTS_FILE, "w") as f:
        json.dump(reports, f, indent=2)


def run_ssh_command(srv: Dict[str, Any], cmd: str, timeout: int = 10) -> str:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    kwargs = {"hostname": srv["host"], "port": srv.get("port", 22), "username": srv.get("user")}
    if srv.get("key_path"):
        kwargs["key_filename"] = srv.get("key_path")
    elif srv.get("password"):
        kwargs["password"] = srv.get("password")
    try:
        client.connect(**kwargs, timeout=10)
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode(errors="ignore")
        err = stderr.read().decode(errors="ignore")
        client.close()
        if err and not out:
            return err
        return out
    except Exception as e:
        try:
            client.close()
        except Exception:
            pass
        raise


def parse_jail_list(output: str) -> List[str]:
    # Attempt to find a line like 'Jail list: a, b, c' or 'Jail list\n  - a\n  - b'
    m = re.search(r"Jail list:\s*(.*)", output)
    if m:
        items = m.group(1).strip()
        return [i.strip() for i in re.split(r",|\s+", items) if i.strip()]
    # fallback: look for 'Status for the jail:' sections to find names
    jails = set(re.findall(r"Status for the jail:\s*(\S+)", output))
    return list(jails)


def parse_banned_list(output: str) -> List[str]:
    # lines like 'Banned IP list:\n   1.2.3.4 5.6.7.8'
    m = re.search(r"Banned IP list:\s*(.*)", output, re.S)
    if m:
        items = m.group(1).strip()
        return [i.strip() for i in re.split(r"\s+", items) if i.strip()]
    # sometimes 'Banned:'
    m2 = re.search(r"Banned:\s*(.*)", output)
    if m2:
        return [i.strip() for i in re.split(r",|\s+", m2.group(1)) if i.strip()]
    return []


def parse_ban_log(tail_output: str) -> List[Dict[str, Any]]:
    # parse lines with 'Ban <ip>' and capture timestamp and jail
    entries = []
    regex = re.compile(r"(?P<date>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})(?:,\d+)? .*?\[?(?P<jail>[^\]]+)\]?.*?Ban (?P<ip>\d+\.\d+\.\d+\.\d+)")
    for line in tail_output.splitlines():
        m = regex.search(line)
        if m:
            dt = m.group("date")
            try:
                ts = datetime.datetime.strptime(dt, "%Y-%m-%d %H:%M:%S")
                ts = ts.replace(tzinfo=datetime.timezone.utc).timestamp()
            except Exception:
                try:
                    ts = datetime.datetime.strptime(dt, "%Y-%m-%d %H:%M:%S,%f").replace(tzinfo=datetime.timezone.utc).timestamp()
                except Exception:
                    ts = time.time()
            entries.append({"jail": m.group("jail"), "ip": m.group("ip"), "ts": ts})
    return entries


def parse_bantime(value: str) -> int:
    # attempts to parse bantime like '600' or '10m' or '1h'
    if not value:
        return 0
    v = value.strip()
    m = re.match(r"^(\d+)$", v)
    if m:
        return int(m.group(1))
    m = re.match(r"^(\d+)([smhd])$", v)
    if m:
        val = int(m.group(1))
        unit = m.group(2)
        if unit == "s":
            return val
        if unit == "m":
            return val * 60
        if unit == "h":
            return val * 3600
        if unit == "d":
            return val * 86400
    # fallback
    try:
        return int(float(v))
    except Exception:
        return 0


def collect_server(srv: Dict[str, Any]) -> Dict[str, Any]:
    out = {"name": srv.get("name") or srv.get("host"), "host": srv.get("host"), "jails": []}
    try:
        status = run_ssh_command(srv, "fail2ban-client status")
    except Exception as e:
        out["error"] = str(e)
        return out

    jails = parse_jail_list(status)
    # also prepare log tail
    try:
        tail = run_ssh_command(srv, "tail -n 2000 /var/log/fail2ban.log")
    except Exception:
        tail = ""

    ban_log_entries = parse_ban_log(tail)
    now = time.time()

    for jail in jails:
        try:
            s = run_ssh_command(srv, f"fail2ban-client status {jail}")
        except Exception:
            s = ""
        banned = parse_banned_list(s)
        bantime_raw = ""
        try:
            bantime_raw = run_ssh_command(srv, f"fail2ban-client get {jail} bantime")
        except Exception:
            bantime_raw = ""
        bantime = parse_bantime(bantime_raw)

        ip_infos = []
        for ip in banned:
            # find latest ban log entry for this ip and jail
            related = [e for e in ban_log_entries if e["ip"] == ip and e["jail"] == jail]
            if related:
                latest = max(related, key=lambda x: x["ts"])
                expiry = latest["ts"] + bantime
                remaining = max(0, int(expiry - now))
                banned_at = datetime.datetime.fromtimestamp(latest["ts"], tz=datetime.timezone.utc).isoformat()
            else:
                remaining = None
                banned_at = None
            ip_infos.append({"ip": ip, "remaining_seconds": remaining, "banned_at": banned_at})

        out["jails"].append({"jail": jail, "bantime_seconds": bantime, "banned": ip_infos})

    return out


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/servers")
def api_get_servers():
    return load_servers()


@app.post("/api/servers")
def api_add_server(payload: Dict[str, Any]):
    required = ["host", "user"]
    for r in required:
        if r not in payload:
            raise HTTPException(status_code=400, detail=f"Missing {r}")
    servers = load_servers()
    servers.append(payload)
    save_servers(servers)
    return {"ok": True}


@app.post("/api/report")
def api_report(payload: Dict[str, Any]):
    # payload should include: host, name (optional), jails (structured)
    if "host" not in payload:
        raise HTTPException(status_code=400, detail="Missing host in report")
    reports = load_reports()
    # replace existing report for same host
    reports = [r for r in reports if r.get("host") != payload.get("host")]
    payload["received_at"] = time.time()
    reports.append(payload)
    save_reports(reports)
    return {"ok": True}


@app.get("/api/status")
def api_status():
    # Prefer push-based reports (agent) when available. Fallback to active SSH collection for servers with no reports.
    reports = load_reports()
    reports_by_host = {r.get("host"): r for r in reports}

    servers = load_servers()
    results = []
    for srv in servers:
        host = srv.get("host")
        if host in reports_by_host:
            results.append(reports_by_host[host])
        else:
            try:
                results.append(collect_server(srv))
            except Exception as e:
                results.append({"name": srv.get("name") or srv.get("host"), "host": srv.get("host"), "error": str(e)})

    # also include reports for hosts not in servers.json (ad-hoc agents)
    for host, rep in reports_by_host.items():
        if not any(s.get("host") == host for s in servers):
            results.append(rep)

    return JSONResponse(results)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
