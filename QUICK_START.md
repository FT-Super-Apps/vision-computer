# Quick Start Guide 🚀

Panduan cepat untuk menjalankan aplikasi Rumah Plagiasi.

---

## Prerequisites ✅

### Quick Install All (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install all dependencies
sudo apt install -y python3 python3-venv python3-pip nodejs npm postgresql postgresql-contrib redis-server ocrmypdf tesseract-ocr
```

### Or Use Helper Script for Redis

```bash
# Run the installer script (recommended)
./install-redis.sh

# This will:
# - Install Redis server
# - Start Redis service
# - Enable auto-start on boot
# - Test connection
```

### macOS

```bash
brew install python3 node postgresql redis ocrmypdf tesseract
brew services start redis
brew services start postgresql
```

### Verify Installation

```bash
# Check Redis
redis-cli ping  # Should return: PONG

# Check PostgreSQL
psql --version

# Check Python
python3 --version

# Check Node
node --version
```

---

## First Time Setup

### 1️⃣ Backend Setup (5 menit)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p uploads outputs temp
```

### 2️⃣ Frontend Setup (5 menit)

```bash
cd frontend

# Install dependencies
npm install

# Setup database
createdb rumahplagiasi  # or use PostgreSQL GUI

# Configure environment
cp .env.example .env
nano .env  # Edit database URL and secrets

# Setup database schema
npx prisma db push
npx prisma generate

# Seed sample data (optional)
npm run db:seed

# Create directories
mkdir -p uploads/documents uploads/payments
```

---

## Running the Application

### Start Backend (3 terminals needed)

#### Terminal 1: Redis
```bash
redis-server
# or: sudo systemctl start redis
```

#### Terminal 2: FastAPI
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 3: Celery Worker
```bash
cd backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

#### Terminal 4 (Optional): Flower
```bash
cd backend
source venv/bin/activate
celery -A app.celery_app flower --port=5555
```

### Start Frontend (1 terminal)

#### Terminal 5: Next.js
```bash
cd frontend
npm run dev
```

---

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:8000 | API documentation |
| **Flower** | http://localhost:5555 | Celery monitoring |
| **Prisma Studio** | http://localhost:5555 | Database GUI |

---

## Default Login (After Seeding)

### Admin Account
```
Email: admin@rumahplagiasi.com
Password: admin123
```

### Test User (Active)
```
Email: budi.pratama@student.itb.ac.id
Password: password123
```

---

## Quick Commands

### Backend

```bash
# Check API
curl http://localhost:8000

# Check Celery workers
celery -A app.celery_app inspect active

# Clear all tasks
celery -A app.celery_app purge
```

### Frontend

```bash
# Database GUI
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma db push --force-reset && npm run db:seed

# Generate Prisma client
npx prisma generate

# View logs
npm run dev  # logs show in terminal
```

### Database

```bash
# PostgreSQL CLI
psql -U rumahuser -d rumahplagiasi

# Check connection
psql postgres://rumahuser:password@localhost:5432/rumahplagiasi
```

---

## Common Issues & Quick Fixes

### ❌ "Redis connection refused" or "Command 'redis-server' not found"

**First, install Redis:**
```bash
# Option 1: Use helper script (recommended)
./install-redis.sh

# Option 2: Manual install
sudo apt update
sudo apt install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis  # Auto-start on boot
```

**Then start Redis:**
```bash
# As system service (recommended)
sudo systemctl start redis

# Or run directly in terminal
redis-server
```

**Test connection:**
```bash
redis-cli ping  # Should return: PONG
```

### ❌ "Port 8000 already in use"
```bash
# Kill process
kill -9 $(lsof -ti:8000)
```

### ❌ "Can't reach database"
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Check status
sudo systemctl status postgresql
```

### ❌ "Module not found"
```bash
# Backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Prisma schema mismatch"
```bash
npx prisma db push
npx prisma generate
```

---

## Environment Variables Quick Setup

### Backend `.env`
```env
PYTHON_API_KEY=your-secret-key-here
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend `.env`
```env
DATABASE_URL="postgresql://rumahuser:password@localhost:5432/rumahplagiasi"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
PYTHON_API_URL="http://localhost:8000"
PYTHON_API_KEY="same-as-backend-key"
```

**Generate Secrets:**
```bash
# NextAuth secret
openssl rand -base64 32

# API key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Architecture Diagram

```
Browser (3000)
    ↓
Next.js Frontend ←→ PostgreSQL (5432)
    ↓
FastAPI Backend (8000)
    ↓
Redis (6379) ←→ Celery Worker
```

---

## Testing Flow

1. **Login** → http://localhost:3000/auth/login
2. **Upload Document** → Dashboard → Upload
3. **Monitor Progress** → Real-time progress bar
4. **Download Result** → When complete
5. **Admin Monitor** → http://localhost:3000/admin/jobs

---

## Stop Services

```bash
# Press Ctrl+C in each terminal running:
# - redis-server
# - uvicorn
# - celery worker
# - celery flower
# - npm run dev
```

Or stop system services:
```bash
sudo systemctl stop redis
sudo systemctl stop postgresql
```

---

## Next Steps

For detailed documentation:
- **Full Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Performance Optimization**: [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)
- **API Documentation**: http://localhost:8000/docs (when backend running)

---

**Happy Coding! 🎉**
