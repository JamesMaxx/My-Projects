# fail2ban-dashboard

Minimal FastAPI dashboard that collects Fail2Ban status from multiple servers over SSH and displays enabled jails and banned IPs with remaining ban time.

Quick start

1. Create a virtualenv and install requirements:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the app:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. Open http://localhost:8000 and add servers (SSH) to query (active mode), or run the agent on each server to push reports (recommended).

Collector mode (central SSH using private key)

If you prefer one central collector to SSH into multiple servers (instead of running an agent on each host), use `collector/collector.py`. Place your SSH private key at `sshkey` (or point `--key-path` to it). Example:

```bash
python3 collector/collector.py --dashboard http://dashboard.example.com:8000 --key-path /path/to/sshkey --servers-file /opt/fail2ban-dashboard/servers.json
```

Notes:
- Ensure the private key file is readable by the collector process and has restrictive permissions: `chmod 600 sshkey`.
- `servers.json` should contain entries like:

```json
[
	{"host": "10.0.0.4", "user": "ubuntu", "name": "web-1"},
	{"host": "10.0.0.5", "user": "ubuntu", "name": "web-2"}
]
```

Agent mode (recommended - dashboard does not need to SSH to each host)

- Copy `agent/agent.py` to each server (or use the packaged script) and run it as a daemon or systemd service. Example:

```bash
python3 agent.py --server http://dashboard.example.com:8000 --interval 60
```

- The agent will POST to `/api/report` with the host's current fail2ban status. The dashboard will display these push-based reports without having to SSH to every server.

Systemd unit example (create `/etc/systemd/system/fail2ban-reporter.service`):

```ini
[Unit]
Description=Fail2Ban Reporter
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /opt/fail2ban-reporter/agent.py --server http://dashboard.example.com:8000 --interval 60
Restart=always

[Install]
WantedBy=multi-user.target
```


Notes

- This basic implementation uses SSH to run `fail2ban-client` and to tail `/var/log/fail2ban.log` on remote hosts. Ensure the user you connect with can run `fail2ban-client` (may require sudo configuration) and read the log file.
- For simplicity servers are stored in `servers.json` in this folder.
