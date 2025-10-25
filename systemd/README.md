# Systemd Service Files

Systemd adalah system and service manager untuk Linux yang paling production-ready.

## Installation

1. **Edit service files** - Ganti `YOUR_USERNAME` dan `YOUR_GROUP` dengan user Anda:
   ```bash
   sed -i "s/YOUR_USERNAME/$USER/g" systemd/*.service
   sed -i "s/YOUR_GROUP/$(id -gn)/g" systemd/*.service
   ```

2. **Copy service files ke systemd directory**:
   ```bash
   sudo cp systemd/turnitin-api.service /etc/systemd/system/
   sudo cp systemd/turnitin-celery.service /etc/systemd/system/
   ```

3. **Reload systemd daemon**:
   ```bash
   sudo systemctl daemon-reload
   ```

4. **Enable services** (auto-start on boot):
   ```bash
   sudo systemctl enable turnitin-api.service
   sudo systemctl enable turnitin-celery.service
   ```

## Usage

### Start services
```bash
sudo systemctl start turnitin-api
sudo systemctl start turnitin-celery
```

### Stop services
```bash
sudo systemctl stop turnitin-api
sudo systemctl stop turnitin-celery
```

### Restart services
```bash
sudo systemctl restart turnitin-api
sudo systemctl restart turnitin-celery
```

### Check status
```bash
sudo systemctl status turnitin-api
sudo systemctl status turnitin-celery
```

### View logs
```bash
# Real-time logs
sudo journalctl -u turnitin-api -f
sudo journalctl -u turnitin-celery -f

# Last 100 lines
sudo journalctl -u turnitin-api -n 100
sudo journalctl -u turnitin-celery -n 100
```

### Manage both services together
```bash
# Start both
sudo systemctl start turnitin-api turnitin-celery

# Stop both
sudo systemctl stop turnitin-api turnitin-celery

# Restart both
sudo systemctl restart turnitin-api turnitin-celery

# Status both
sudo systemctl status turnitin-api turnitin-celery
```

## Notes

- Redis harus sudah terinstall dan running
- Pastikan semua dependencies sudah terinstall
- Log files akan ada di `/workspaces/vision-computer/logs/`
- Services akan auto-restart jika crash
- Services akan auto-start saat boot (jika sudah enable)
