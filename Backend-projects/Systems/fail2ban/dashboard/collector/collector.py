#!/usr/bin/env python3
"""
Remote collector: SSH to multiple servers using a private key and POST reports to the dashboard.

Usage:
  python3 collector.py --dashboard http://dashboard:8000 --key-path ../sshkey --servers-file ../servers.json
"""
import argparse
import json
import os
import re
import time
import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

import paramiko
import requests


def load_servers(path):
    with open(path, 'r') as f:
        return json.load(f)


def run_ssh_command(host, user, key_path, port, cmd, timeout=15):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    kwargs = {"hostname": host, "username": user, "port": port}
    if key_path:
        kwargs["key_filename"] = key_path
    try:
        client.connect(**kwargs, timeout=10)
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode(errors='ignore')
        err = stderr.read().decode(errors='ignore')
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


def parse_jail_list(output: str):
    m = re.search(r"Jail list:\s*(.*)", output)
    if m:
        items = m.group(1).strip()
        return [i.strip() for i in re.split(r",|\s+", items) if i.strip()]
    jails = set(re.findall(r"Status for the jail:\s*(\S+)", output))
    return list(jails)


def parse_banned_list(output: str):
    m = re.search(r"Banned IP list:\s*(.*)", output, re.S)
    if m:
        items = m.group(1).strip()
        return [i.strip() for i in re.split(r"\s+", items) if i.strip()]
    m2 = re.search(r"Banned:\s*(.*)", output)
    if m2:
        return [i.strip() for i in re.split(r",|\s+", m2.group(1)) if i.strip()]
    return []


def collect_one(srv, key_path):
    host = srv.get('host')
    user = srv.get('user')
    port = srv.get('port', 22)
    name = srv.get('name') or host
    payload = {"host": host, "name": name, "jails": [], "collected_at": time.time()}
    try:
        status = run_ssh_command(host, user, key_path, port, 'fail2ban-client status')
    except Exception as e:
        payload['error'] = str(e)
        return payload

    jails = parse_jail_list(status)
    try:
        tail = run_ssh_command(host, user, key_path, port, 'tail -n 2000 /var/log/fail2ban.log')
    except Exception:
        tail = ''

    # simple ban log parse: look for Ban <ip> entries with timestamps
    ban_log = []
    regex = re.compile(r"(?P<date>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})(?:,\d+)? .*?\[?(?P<jail>[^\]]+)\]?.*?Ban (?P<ip>\d+\.\d+\.\d+\.\d+)")
    for line in tail.splitlines():
        m = regex.search(line)
        if m:
            dt = m.group('date')
            try:
                ts = datetime.datetime.strptime(dt, "%Y-%m-%d %H:%M:%S").replace(tzinfo=datetime.timezone.utc).timestamp()
            except Exception:
                ts = time.time()
            ban_log.append({'jail': m.group('jail'), 'ip': m.group('ip'), 'ts': ts})

    for jail in jails:
        try:
            s = run_ssh_command(host, user, key_path, port, f'fail2ban-client status {jail}')
        except Exception:
            s = ''
        banned = parse_banned_list(s)
        try:
            bantime_raw = run_ssh_command(host, user, key_path, port, f'fail2ban-client get {jail} bantime')
            bantime = int(float(bantime_raw.strip())) if bantime_raw.strip() else 0
        except Exception:
            bantime = 0

        ip_infos = []
        now = time.time()
        for ip in banned:
            related = [e for e in ban_log if e['ip'] == ip and e['jail'] == jail]
            if related:
                latest = max(related, key=lambda x: x['ts'])
                expiry = latest['ts'] + bantime
                remaining = max(0, int(expiry - now))
                banned_at = datetime.datetime.fromtimestamp(latest['ts'], tz=datetime.timezone.utc).isoformat()
            else:
                remaining = None
                banned_at = None
            ip_infos.append({'ip': ip, 'remaining_seconds': remaining, 'banned_at': banned_at})

        payload['jails'].append({'jail': jail, 'bantime_seconds': bantime, 'banned': ip_infos})

    payload['log_tail'] = tail
    return payload


def post_report(dashboard, payload, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    try:
        r = requests.post(dashboard.rstrip('/') + '/api/report', json=payload, headers=headers, timeout=10)
        return r.status_code == 200
    except Exception as e:
        print('Post failed', e)
        return False


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--dashboard', required=True, help='Dashboard base URL')
    p.add_argument('--servers-file', default=os.path.join(os.path.dirname(__file__), '..', 'servers.json'), help='Path to servers.json')
    p.add_argument('--key-path', default=os.path.join(os.path.dirname(__file__), '..', '..', 'sshkey'), help='Path to private key file')
    p.add_argument('--token', help='Optional bearer token')
    p.add_argument('--workers', type=int, default=8, help='Parallel SSH workers')
    args = p.parse_args()

    servers = load_servers(args.servers_file)
    key_path = args.key_path
    if not os.path.exists(key_path):
        print('Key file not found:', key_path)
        return

    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = {ex.submit(collect_one, srv, key_path): srv for srv in servers}
        for fut in as_completed(futures):
            srv = futures[fut]
            try:
                payload = fut.result()
            except Exception as e:
                payload = {'host': srv.get('host'), 'error': str(e)}
            ok = post_report(args.dashboard, payload, token=args.token)
            print('Reported', payload.get('host'), 'ok' if ok else 'failed')
            results.append((payload.get('host'), ok))

    # summary
    for host, ok in results:
        print(host, '->', 'OK' if ok else 'FAILED')


if __name__ == '__main__':
    main()
