#!/usr/bin/env python3
"""
Simple fail2ban reporter agent.
Run on remote server; it collects fail2ban status and recent log lines and POSTs to central dashboard.

Usage:
  python3 agent.py --server http://dashboard:8000 --interval 30 --key /path/to/key
"""
import argparse
import json
import subprocess
import time
import os
import datetime
import requests


def run_cmd(cmd):
    try:
        out = subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL, timeout=10)
        return out.decode(errors='ignore')
    except Exception:
        return ""


def parse_jail_list(output: str):
    import re
    m = re.search(r"Jail list:\s*(.*)", output)
    if m:
        items = m.group(1).strip()
        return [i.strip() for i in re.split(r",|\s+", items) if i.strip()]
    jails = set(re.findall(r"Status for the jail:\s*(\S+)", output))
    return list(jails)


def parse_banned_list(output: str):
    import re
    m = re.search(r"Banned IP list:\s*(.*)", output, re.S)
    if m:
        items = m.group(1).strip()
        return [i.strip() for i in re.split(r"\s+", items) if i.strip()]
    m2 = re.search(r"Banned:\s*(.*)", output)
    if m2:
        return [i.strip() for i in re.split(r",|\s+", m2.group(1)) if i.strip()]
    return []


def collect_local():
    status = run_cmd('fail2ban-client status')
    jails = parse_jail_list(status)
    bantime_cache = {}
    jails_info = []
    tail = run_cmd('tail -n 2000 /var/log/fail2ban.log')

    for jail in jails:
        s = run_cmd(f'fail2ban-client status {jail}')
        banned = parse_banned_list(s)
        if jail not in bantime_cache:
            b = run_cmd(f'fail2ban-client get {jail} bantime')
            try:
                bantime_cache[jail] = int(float(b.strip()))
            except Exception:
                bantime_cache[jail] = 0
        ip_infos = []
        for ip in banned:
            ip_infos.append({"ip": ip})
        jails_info.append({"jail": jail, "bantime_seconds": bantime_cache[jail], "banned": ip_infos})

    payload = {"host": os.uname()[1], "name": os.uname()[1], "jails": jails_info, "log_tail": tail, "collected_at": time.time()}
    return payload


def post_report(url, payload, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    try:
        r = requests.post(url.rstrip('/') + '/api/report', json=payload, headers=headers, timeout=10)
        return r.status_code == 200
    except Exception:
        return False


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--server', required=True, help='Dashboard base URL, e.g. http://dashboard:8000')
    p.add_argument('--interval', type=int, default=30, help='Seconds between reports')
    p.add_argument('--token', help='Optional bearer token')
    args = p.parse_args()

    while True:
        payload = collect_local()
        ok = post_report(args.server, payload, token=args.token)
        if not ok:
            print('Failed to post report to', args.server)
        else:
            print('Reported at', datetime.datetime.utcnow().isoformat())
        time.sleep(args.interval)


if __name__ == '__main__':
    main()
