# Instalasi Dependencies 📦

Panduan lengkap instalasi semua dependencies yang diperlukan.

---

## 1️⃣ Install Redis

### Otomatis (Recommended)

```bash
./install-redis.sh
```

Script ini akan:
- ✅ Install Redis server
- ✅ Enable auto-start on boot
- ✅ Start Redis service
- ✅ Test connection

### Manual

```bash
# Update package list
sudo apt update

# Install Redis
sudo apt install -y redis-server

# Start Redis
sudo systemctl start redis

# Enable auto-start
sudo systemctl enable redis

# Test connection
redis-cli ping  # Should return: PONG
```

---

## 2️⃣ Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Enable auto-start
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE rumahplagiasi;
CREATE USER rumahuser WITH PASSWORD 'your-password-here';
GRANT ALL PRIVILEGES ON DATABASE rumahplagiasi TO rumahuser;
ALTER USER rumahuser WITH SUPERUSER;
\q
EOF

# Test connection
psql -U rumahuser -d rumahplagiasi -h localhost
```

---

## 3️⃣ Install Python Dependencies

```bash
# Install Python and pip
sudo apt install -y python3 python3-venv python3-pip

# Verify installation
python3 --version
pip3 --version
```

---

## 4️⃣ Install Node.js & npm

### Ubuntu/Debian (via apt)

```bash
sudo apt install -y nodejs npm

# Verify
node --version
npm --version
```

### Or use NodeSource (Latest Version)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be 20.x
npm --version
```

---

## 5️⃣ Install OCR Dependencies (Optional)

```bash
# Install OCR tools
sudo apt install -y ocrmypdf tesseract-ocr tesseract-ocr-eng ghostscript poppler-utils

# Install additional language packs (optional)
sudo apt install -y tesseract-ocr-ind  # Indonesian

# Verify
ocrmypdf --version
tesseract --version
```

---

## 6️⃣ Verify All Installations

```bash
# Check all services
echo "=== System Dependencies ==="
python3 --version
node --version
npm --version
psql --version

echo ""
echo "=== Services Status ==="
# Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Running"
else
    echo "❌ Redis: Not running"
fi

# PostgreSQL
if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not running"
fi

echo ""
echo "=== OCR Tools (Optional) ==="
which ocrmypdf > /dev/null && echo "✅ ocrmypdf: Installed" || echo "⚠️  ocrmypdf: Not installed"
which tesseract > /dev/null && echo "✅ tesseract: Installed" || echo "⚠️  tesseract: Not installed"
```

---

## 🐧 Platform-Specific Instructions

### Ubuntu/Debian

```bash
# All-in-one installation
sudo apt update
sudo apt install -y \
  python3 python3-venv python3-pip \
  nodejs npm \
  postgresql postgresql-contrib \
  redis-server \
  ocrmypdf tesseract-ocr tesseract-ocr-eng \
  ghostscript poppler-utils \
  git curl wget

# Start services
sudo systemctl start redis postgresql
sudo systemctl enable redis postgresql
```

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python3 node postgresql redis ocrmypdf tesseract

# Start services
brew services start redis
brew services start postgresql
```

### Windows (WSL2)

```bash
# Run in WSL2 terminal
# Follow Ubuntu/Debian instructions above

# For Redis in WSL2
sudo service redis-server start

# For PostgreSQL in WSL2
sudo service postgresql start
```

---

## 🔧 Configuration

### Redis Configuration

Default Redis config is usually fine. If needed:

```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Important settings:
# bind 127.0.0.1
# port 6379
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Restart after changes
sudo systemctl restart redis
```

### PostgreSQL Configuration

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/*/main/postgresql.conf

# Allow local connections
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Add: local   all   rumahuser   md5

# Restart after changes
sudo systemctl restart postgresql
```

---

## 🧪 Test All Services

### Test Redis

```bash
# Ping test
redis-cli ping
# Expected: PONG

# Set/Get test
redis-cli SET test "Hello Redis"
redis-cli GET test
# Expected: "Hello Redis"

# Clear test
redis-cli DEL test
```

### Test PostgreSQL

```bash
# Connect to database
psql -U rumahuser -d rumahplagiasi -h localhost

# Run test query
SELECT version();

# Exit
\q
```

### Test Python

```bash
# Create test venv
python3 -m venv test_venv
source test_venv/bin/activate

# Test pip
pip install requests

# Cleanup
deactivate
rm -rf test_venv
```

### Test Node.js

```bash
# Check versions
node --version
npm --version

# Test npm install
mkdir test_npm && cd test_npm
npm init -y
npm install axios
cd .. && rm -rf test_npm
```

---

## 🔍 Troubleshooting

### Redis Won't Start

```bash
# Check logs
sudo journalctl -u redis -n 50

# Check if port is in use
sudo lsof -i :6379

# Try running directly
redis-server /etc/redis/redis.conf
```

### PostgreSQL Connection Failed

```bash
# Check status
sudo systemctl status postgresql

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Reset password
sudo -u postgres psql
ALTER USER rumahuser WITH PASSWORD 'newpassword';
\q
```

### Permission Denied

```bash
# Fix PostgreSQL permissions
sudo chmod 755 /var/run/postgresql
sudo chown postgres:postgres /var/run/postgresql

# Fix Redis permissions
sudo chown redis:redis /var/run/redis
sudo chmod 755 /var/run/redis
```

---

## 📋 Checklist

Before proceeding with application setup, verify:

- [ ] Redis installed and running (`redis-cli ping` → PONG)
- [ ] PostgreSQL installed and running
- [ ] Database `rumahplagiasi` created
- [ ] User `rumahuser` created with correct password
- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] OCR tools installed (optional but recommended)

---

## Next Steps

After installing all dependencies:

1. ✅ **Backend Setup**: See [QUICK_START.md](QUICK_START.md#backend-setup)
2. ✅ **Frontend Setup**: See [QUICK_START.md](QUICK_START.md#frontend-setup)
3. ✅ **Run Application**: See [QUICK_START.md](QUICK_START.md#running-the-application)

---

**Need Help?** Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting.
