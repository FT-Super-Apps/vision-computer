# Production Deployment Guide

Panduan lengkap untuk menjalankan Turnitin Bypass API di production secara kontinyu (seperti PM2).

## 📋 Daftar Isi

1. [Metode Deployment](#metode-deployment)
2. [Metode 1: Nohup Scripts (Paling Mudah)](#metode-1-nohup-scripts)
3. [Metode 2: Supervisor (Recommended)](#metode-2-supervisor)
4. [Metode 3: Systemd (Production-Ready)](#metode-3-systemd)
5. [Perbandingan Metode](#perbandingan-metode)

---

## Metode Deployment

Ada 3 metode untuk menjalankan aplikasi di production:

| Metode | Kesulitan | Auto-Restart | Auto-Start Boot | Best For |
|--------|-----------|--------------|-----------------|----------|
| **Nohup Scripts** | ⭐ Easy | ✅ Yes | ❌ No | Development/Testing |
| **Supervisor** | ⭐⭐ Medium | ✅ Yes | ✅ Yes | Production |
| **Systemd** | ⭐⭐⭐ Advanced | ✅ Yes | ✅ Yes | Enterprise |

---

## Metode 1: Nohup Scripts

Paling mudah, mirip dengan PM2, menggunakan nohup untuk background process.

### Prerequisites

```bash
# Install Redis
sudo apt-get update
sudo apt-get install redis-server

# Install Gunicorn
pip install gunicorn
```

### Installation

1. **Make scripts executable**:
   ```bash
   chmod +x start_production.sh
   chmod +x stop_production.sh
   chmod +x restart_production.sh
   chmod +x status_production.sh
   ```

### Usage

```bash
# Start all services
./start_production.sh

# Check status
./status_production.sh

# Stop all services
./stop_production.sh

# Restart all services
./restart_production.sh

# Monitor logs
tail -f logs/*.log
```

### File Structure

```
/workspaces/vision-computer/
├── start_production.sh      # Start semua services
├── stop_production.sh       # Stop semua services
├── restart_production.sh    # Restart semua services
├── status_production.sh     # Check status services
├── logs/                    # Log files
│   ├── api.log
│   ├── celery_worker.log
│   └── redis.log
└── pids/                    # PID files
    ├── api.pid
    ├── celery_worker.pid
    └── redis.pid
```

### Pros & Cons

✅ **Pros:**
- Sangat mudah digunakan
- Tidak perlu install tools tambahan
- Mirip dengan PM2

❌ **Cons:**
- Tidak auto-start saat boot
- Manual restart jika server restart
- Less robust daripada supervisor/systemd

---

## Metode 2: Supervisor

Process manager yang powerful dan mudah dikonfigurasi. **RECOMMENDED untuk production**.

### Installation

```bash
# Install Supervisor
pip install supervisor

# Create directories
mkdir -p logs pids
```

### Configuration

File konfigurasi sudah tersedia di `supervisord.conf`.

### Usage

```bash
# Start Supervisor
supervisord -c supervisord.conf

# Check status semua services
supervisorctl -c supervisord.conf status

# Start/Stop individual service
supervisorctl -c supervisord.conf start fastapi
supervisorctl -c supervisord.conf stop celery_worker

# Start/Stop semua services
supervisorctl -c supervisord.conf start all
supervisorctl -c supervisord.conf stop all

# Restart services
supervisorctl -c supervisord.conf restart all

# Monitor logs
supervisorctl -c supervisord.conf tail -f fastapi
supervisorctl -c supervisord.conf tail -f celery_worker

# Interactive shell
supervisorctl -c supervisord.conf
```

### Auto-start on Boot

Tambahkan ke crontab:

```bash
crontab -e

# Add this line:
@reboot cd /workspaces/vision-computer && supervisord -c supervisord.conf
```

### Pros & Cons

✅ **Pros:**
- Easy to configure
- Great web UI (optional)
- Good logging
- Auto-restart on crash
- Process grouping

❌ **Cons:**
- Perlu install dependency tambahan
- Tidak native ke sistem

---

## Metode 3: Systemd

Native Linux service manager. Paling production-ready.

### Installation

1. **Edit service files**:
   ```bash
   # Ganti YOUR_USERNAME dan YOUR_GROUP dengan user Anda
   cd systemd
   sed -i "s/YOUR_USERNAME/$USER/g" *.service
   sed -i "s/YOUR_GROUP/$(id -gn)/g" *.service
   ```

2. **Copy service files**:
   ```bash
   sudo cp systemd/turnitin-api.service /etc/systemd/system/
   sudo cp systemd/turnitin-celery.service /etc/systemd/system/
   ```

3. **Reload systemd**:
   ```bash
   sudo systemctl daemon-reload
   ```

4. **Enable auto-start**:
   ```bash
   sudo systemctl enable turnitin-api
   sudo systemctl enable turnitin-celery
   ```

### Usage

```bash
# Start services
sudo systemctl start turnitin-api
sudo systemctl start turnitin-celery

# Stop services
sudo systemctl stop turnitin-api
sudo systemctl stop turnitin-celery

# Restart services
sudo systemctl restart turnitin-api
sudo systemctl restart turnitin-celery

# Check status
sudo systemctl status turnitin-api
sudo systemctl status turnitin-celery

# View logs
sudo journalctl -u turnitin-api -f
sudo journalctl -u turnitin-celery -f

# Manage both services
sudo systemctl start turnitin-api turnitin-celery
sudo systemctl restart turnitin-api turnitin-celery
```

### Pros & Cons

✅ **Pros:**
- Native to Linux
- Most production-ready
- Best logging with journalctl
- Auto-start on boot
- Integration with system monitoring

❌ **Cons:**
- Lebih kompleks
- Requires root/sudo
- Linux-only

---

## Perbandingan Metode

### Quick Start (Development)
```bash
./start_production.sh
```

### Production (Recommended)
```bash
supervisord -c supervisord.conf
```

### Enterprise (Maximum Reliability)
```bash
sudo systemctl start turnitin-api turnitin-celery
```

---

## Common Tasks

### Check if services are running

**Nohup:**
```bash
./status_production.sh
```

**Supervisor:**
```bash
supervisorctl -c supervisord.conf status
```

**Systemd:**
```bash
sudo systemctl status turnitin-api turnitin-celery
```

### View Logs

**Nohup:**
```bash
tail -f logs/api.log
tail -f logs/celery_worker.log
```

**Supervisor:**
```bash
supervisorctl -c supervisord.conf tail -f fastapi
supervisorctl -c supervisord.conf tail -f celery_worker
```

**Systemd:**
```bash
sudo journalctl -u turnitin-api -f
sudo journalctl -u turnitin-celery -f
```

### Test API

```bash
# Health check
curl http://localhost:8000/health

# Full test
curl http://localhost:8000/
```

---

## Troubleshooting

### Port already in use
```bash
# Find process using port 8000
lsof -ti:8000

# Kill process
lsof -ti:8000 | xargs kill -9
```

### Redis not running
```bash
# Check Redis
redis-cli ping

# Start Redis
redis-server &
```

### Celery workers not processing
```bash
# Check worker status
celery -A app.celery_app inspect active

# Purge all tasks
celery -A app.celery_app purge
```

### View all running processes
```bash
ps aux | grep -E "gunicorn|celery|redis"
```

---

## Monitoring

### CPU & Memory Usage

**Nohup:**
```bash
ps aux | grep -E "gunicorn|celery|redis"
```

**Supervisor:**
```bash
supervisorctl -c supervisord.conf status
```

**Systemd:**
```bash
systemctl status turnitin-api turnitin-celery
```

### Log Rotation

Logs akan otomatis di-rotate oleh:
- **Supervisor**: Built-in log rotation
- **Systemd**: journalctl automatic rotation
- **Nohup**: Manual dengan logrotate (recommended)

---

## Security Checklist

- [ ] Change Redis password (edit Redis config)
- [ ] Enable firewall (ufw/iptables)
- [ ] Use HTTPS (nginx/traefik reverse proxy)
- [ ] Limit file upload size
- [ ] Enable rate limiting
- [ ] Regular security updates

---

## Recommendations

### Development
→ Use **Nohup Scripts** (./start_production.sh)

### Staging/Production
→ Use **Supervisor** (supervisord)

### Enterprise
→ Use **Systemd** (systemctl)

---

## Support

Jika ada masalah:
1. Check logs di `logs/` directory
2. Check service status
3. Restart services
4. Check Redis connection
5. Verify port availability

Happy deploying! 🚀
