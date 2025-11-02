# Setup Guide - Rumah Plagiasi

Panduan lengkap untuk menjalankan **Backend** dan **Frontend** secara terpisah.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)
6. [Environment Variables](#environment-variables)

---

## Prerequisites

### System Requirements

- **OS**: Linux, macOS, or Windows (WSL2 recommended)
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 6.x or higher (for background jobs)

### Install System Dependencies

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib redis-server
sudo apt install -y ocrmypdf tesseract-ocr ghostscript poppler-utils  # For OCR
```

#### macOS:
```bash
brew install python3 node postgresql redis
brew install ocrmypdf tesseract poppler  # For OCR
```

#### Windows (WSL2):
```bash
# Follow Ubuntu/Debian instructions in WSL2
```

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment

**Linux/macOS:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 4. Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Create Required Directories
```bash
mkdir -p uploads outputs temp
```

### 6. Configure Environment (Optional)

Create `.env` file in backend directory:
```bash
# API Configuration
PYTHON_API_KEY=your-generated-api-key-here

# Redis Configuration (for Celery)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 7. Start Redis Server

**Linux/macOS:**
```bash
# In a new terminal
redis-server
```

**Or run as service:**
```bash
sudo systemctl start redis
```

### 8. Verify Installation
```bash
python -c "import fastapi; import celery; import docx; print('✅ All dependencies installed!')"
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Node Dependencies
```bash
npm install
# or
yarn install
```

### 3. Setup PostgreSQL Database

**Create Database:**
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE rumahplagiasi;
CREATE USER rumahuser WITH PASSWORD 'your-password-here';
GRANT ALL PRIVILEGES ON DATABASE rumahplagiasi TO rumahuser;
\q
```

### 4. Configure Environment Variables

Copy example environment file:
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Database
DATABASE_URL="postgresql://rumahuser:your-password-here@localhost:5432/rumahplagiasi?schema=public"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Python Backend API
PYTHON_API_URL="http://localhost:8000"
PYTHON_API_KEY="your-generated-api-key-here"
PYTHON_API_TIMEOUT="300000"

# Upload Configuration
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="./uploads"
OUTPUT_DIR="./outputs"

# Feature Flags
ENABLE_OCR="true"
ENABLE_ANALYTICS="true"
ENABLE_EMAIL_NOTIFICATIONS="false"
```

**Generate Secrets:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate PYTHON_API_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Setup Database Schema

Push Prisma schema to database:
```bash
npx prisma db push
```

Generate Prisma Client:
```bash
npx prisma generate
```

### 6. Seed Database (Optional)

Populate database with sample data:
```bash
npm run db:seed
```

This will create:
- 1 Admin account: `admin@rumahplagiasi.com` / `admin123`
- 4 Test user accounts with various statuses
- 3 Packages (Proposal, Hasil, Tutup)
- Sample documents and bypass history

### 7. Create Required Directories
```bash
mkdir -p uploads/documents uploads/payments public/uploads
```

---

## Running the Application

### Backend Services

You need to run **3 backend services** in separate terminals:

#### Terminal 1: FastAPI Server
```bash
cd backend
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test Backend:**
```bash
curl http://localhost:8000
# Should return: {"status":"online","service":"Turnitin Bypass API",...}
```

#### Terminal 2: Celery Worker
```bash
cd backend
source venv/bin/activate

celery -A app.celery_app worker --loglevel=info
```

**Expected Output:**
```
-------------- celery@hostname v5.3.4 (emerald-rush)
--- ***** -----
-- ******* ---- Linux-5.15.0-...
- *** --- * ---
- ** ---------- [config]
- ** ---------- .> app:         app.celery_app:0x...
...
[tasks]
  . app.tasks.analyze_detect_flags_task
  . app.tasks.bypass_matched_flags_task
  . app.tasks.match_flags_task
  . app.tasks.process_document_unified_task

[2025-01-01 10:00:00,000: INFO/MainProcess] Connected to redis://localhost:6379/0
[2025-01-01 10:00:00,001: INFO/MainProcess] celery@hostname ready.
```

#### Terminal 3: Flower (Optional - Celery Monitoring)
```bash
cd backend
source venv/bin/activate

celery -A app.celery_app flower --port=5555
```

**Access Flower Dashboard:**
```
http://localhost:5555
```

### Frontend Service

#### Terminal 4: Next.js Development Server
```bash
cd frontend

npm run dev
# or
yarn dev
```

**Expected Output:**
```
> rumah-plagiasi-frontend@1.0.0 dev
> next dev

   ▲ Next.js 14.2.0
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Ready in 2.5s
```

**Access Application:**
```
http://localhost:3000
```

---

## Quick Start Commands

### Start All Services (Recommended)

**Option 1: Using separate terminals**

```bash
# Terminal 1 - Redis (if not running as service)
redis-server

# Terminal 2 - Backend API
cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 3 - Celery Worker
cd backend && source venv/bin/activate && celery -A app.celery_app worker --loglevel=info

# Terminal 4 - Flower (optional)
cd backend && source venv/bin/activate && celery -A app.celery_app flower --port=5555

# Terminal 5 - Frontend
cd frontend && npm run dev
```

**Option 2: Using the setup scripts**

```bash
# Backend
./setup_backend.sh  # One-time setup
./activate_backend.sh  # Start all backend services

# Frontend
cd frontend
./setup.sh  # One-time setup
npm run dev  # Start dev server
```

---

## Environment Variables

### Backend Environment Variables

Create `backend/.env`:

```env
# API Security
PYTHON_API_KEY=your-api-key-here

# Redis (Celery)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# File Processing
MAX_UPLOAD_SIZE=10485760
UPLOAD_FOLDER=uploads
OUTPUT_FOLDER=outputs
TEMP_FOLDER=temp

# OCR Settings (optional)
ENABLE_OCR=true
TESSERACT_PATH=/usr/bin/tesseract
```

### Frontend Environment Variables

See `frontend/.env.example` for all available options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL
- `PYTHON_API_URL` - Backend API URL
- `PYTHON_API_KEY` - Backend API key

---

## Troubleshooting

### Backend Issues

#### 1. **Redis Connection Error**
```
Error: Error 111 connecting to localhost:6379. Connection refused.
```

**Solution:**
```bash
# Start Redis
sudo systemctl start redis
# or
redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

#### 2. **Module Import Error**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### 3. **OCR Not Working**
```
FileNotFoundError: ocrmypdf not found
```

**Solution:**
```bash
# Install OCR dependencies
sudo apt install ocrmypdf tesseract-ocr ghostscript poppler-utils

# Or disable OCR in config
export ENABLE_OCR=false
```

#### 4. **Port 8000 Already in Use**
```
ERROR: [Errno 98] Address already in use
```

**Solution:**
```bash
# Find process using port 8000
lsof -ti:8000

# Kill the process
kill -9 $(lsof -ti:8000)

# Or use different port
uvicorn app.main:app --port 8001
```

### Frontend Issues

#### 1. **Database Connection Error**
```
Error: Can't reach database server at localhost:5432
```

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection
psql -U rumahuser -d rumahplagiasi -h localhost
```

#### 2. **Prisma Schema Mismatch**
```
Error: Prisma schema loaded from prisma/schema.prisma is not in sync with your database
```

**Solution:**
```bash
# Push schema changes
npx prisma db push

# Regenerate client
npx prisma generate
```

#### 3. **NextAuth Error**
```
[next-auth][error][NO_SECRET] Please define a NEXTAUTH_SECRET environment variable
```

**Solution:**
```bash
# Generate secret
openssl rand -base64 32

# Add to .env
echo "NEXTAUTH_SECRET=<generated-secret>" >> .env
```

#### 4. **Module Not Found**
```
Module not found: Can't resolve '@/components/...'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### 5. **Python API Connection Error**
```
Error: Failed to connect to Python API at http://localhost:8000
```

**Solution:**
```bash
# Verify backend is running
curl http://localhost:8000

# Check PYTHON_API_URL in .env
grep PYTHON_API_URL .env

# Make sure API key matches
grep PYTHON_API_KEY .env
```

### Common Issues

#### 1. **CORS Errors**

If you see CORS errors in browser console:

**Backend:** Check `app/main.py` CORS settings:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 2. **File Upload Fails**

**Solution:**
```bash
# Check directories exist
mkdir -p backend/uploads backend/outputs backend/temp
mkdir -p frontend/uploads/documents frontend/uploads/payments

# Check permissions
chmod 755 backend/uploads backend/outputs backend/temp
chmod 755 frontend/uploads
```

#### 3. **Slow Performance**

See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for optimization tips.

---

## Useful Commands

### Database Management

```bash
# Open Prisma Studio (Database GUI)
cd frontend
npx prisma studio

# Reset database (⚠️ DELETES ALL DATA)
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name your_migration_name

# View database schema
npx prisma db pull
```

### Backend Management

```bash
# Check Celery tasks
celery -A app.celery_app inspect active

# Purge all tasks
celery -A app.celery_app purge

# Check Redis keys
redis-cli keys '*'

# Monitor Redis
redis-cli monitor
```

### Logs

```bash
# Backend logs
cd backend
tail -f logs/app.log  # If logging configured

# Celery logs
tail -f logs/celery.log

# Frontend logs (development)
# Logs appear in terminal running npm run dev
```

---

## Default Accounts (After Seeding)

### Admin
- **Email:** admin@rumahplagiasi.com
- **Password:** admin123
- **Role:** ADMIN (full access)

### Test Users
1. **Budi Pratama** (Active with subscription)
   - Email: budi.pratama@student.itb.ac.id
   - Password: password123
   - Status: ACTIVE with Paket Tutup

2. **Siti Permata** (Pending verification)
   - Email: siti.permata@student.ugm.ac.id
   - Password: password123
   - Status: Payment uploaded, waiting verification

3. **Andi Saputra** (Pending payment)
   - Email: andi.saputra@student.ui.ac.id
   - Password: password123
   - Status: Profile completed, need payment

4. **Maya Dewi** (New user)
   - Email: maya.dewi@student.unair.ac.id
   - Password: password123
   - Status: Need to complete profile

---

## Development Workflow

### Making Code Changes

**Backend:**
1. Edit Python files
2. FastAPI auto-reloads (with `--reload` flag)
3. For Celery changes, restart worker: `Ctrl+C` → restart command

**Frontend:**
1. Edit files in `app/`, `components/`, etc.
2. Next.js auto-reloads (hot reload)
3. For schema changes: `npx prisma db push` → `npx prisma generate`

### Testing

```bash
# Backend - API endpoint test
curl -X POST http://localhost:8000/jobs/process-document \
  -H "X-API-Key: your-api-key" \
  -F "original_doc=@test.docx" \
  -F "turnitin_pdf=@test.pdf"

# Frontend - Access pages
# Landing: http://localhost:3000
# Login: http://localhost:3000/auth/login
# Dashboard: http://localhost:3000/dashboard
# Admin: http://localhost:3000/admin
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP (Port 3000)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages/UI   │  │  API Routes  │  │   NextAuth   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────┬───────────────────┬───────────────────────────────┘
          │                   │
          │                   │ HTTP (Port 8000)
          │                   ▼
          │         ┌─────────────────────────────────────────┐
          │         │      FastAPI Backend (Python)           │
          │         │  ┌──────────────┐  ┌──────────────┐    │
          │         │  │  API Routes  │  │ Bypass Engine│    │
          │         │  └──────────────┘  └──────────────┘    │
          │         └─────────┬────────────────────────────┬──┘
          │                   │                            │
          │                   │ Redis (Port 6379)         │
          │                   ▼                            │
          │         ┌─────────────────────────────┐       │
          │         │    Celery Worker            │       │
          │         │  (Background Processing)    │       │
          │         └─────────────────────────────┘       │
          │                                                │
          │ PostgreSQL (Port 5432)                        │
          ▼                                                │
┌─────────────────────────────────────┐                   │
│         PostgreSQL Database         │◄──────────────────┘
│  - Users, Documents, Payments, etc. │
└─────────────────────────────────────┘
```

---

## Support

For issues or questions:
1. Check this guide first
2. Check [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)
3. Check logs for error messages
4. Create an issue in the repository

---

**Last Updated:** 2025-01-01
**Version:** 1.0.0
