# 🚀 Quick Start Guide - Rumah Plagiasi

The **fastest** way to get Rumah Plagiasi up and running!

⚡ **Created by devnolife**

---

## ⏱️ Time to Setup: ~5 minutes

Just run ONE command and you're ready to go! 🎉

---

## 📋 Prerequisites

Before running the init script, make sure you have:

- ✅ **Python 3.8+** - Backend runtime
- ✅ **Node.js 18+** - Frontend runtime  
- ✅ **npm** - Node package manager
- ⚠️ **Redis** (Optional) - For Celery workers
- ⚠️ **PostgreSQL** (Optional) - For frontend database

### Check Prerequisites

```bash
# Check Python
python3 --version

# Check Node.js
node --version

# Check npm
npm --version

# Check Redis (optional)
redis-server --version

# Check PostgreSQL (optional)
psql --version
```

---

## 🎯 One-Command Setup

Run the initialization script:

```bash
./init.sh
```

That's it! The script will automatically:

1. ✅ Check all prerequisites
2. ✅ Generate secure API key
3. ✅ Setup backend `.env` with API key
4. ✅ Setup frontend `.env` with same API key
5. ✅ Install Python dependencies
6. ✅ Install Node.js dependencies
7. ✅ Setup Prisma database
8. ✅ Create necessary directories
9. ✅ Verify everything is configured correctly

---

## 🎬 What Happens During Init

### Step 1: Prerequisites Check

```
[STEP] Checking prerequisites...

✅ Python: 3.12.1
✅ Node.js: v20.10.0
✅ npm: v10.2.3
✅ Redis: Available
✅ PostgreSQL: Available
```

### Step 2: API Key Generation

```
[STEP] Generating secure API key...

✅ API Key generated successfully
   Key: apk_XyZ123AbC456DeF789GhI012JkL345MnO678PqR901StU234
```

### Step 3: Environment Setup

```
[STEP] Setting up Backend environment...

✅ Backend .env created with API key
ℹ️  Location: /workspaces/vision-computer/.env

[STEP] Setting up Frontend environment...

Database Configuration
Press Enter to use default PostgreSQL URL, or enter your custom URL:
DATABASE_URL (default: postgresql://postgres:postgres@localhost:5432/rumahplagiasi): 

✅ Frontend .env created with same API key
ℹ️  Location: /workspaces/vision-computer/frontend/.env
```

### Step 4: Dependencies Installation

```
[STEP] Installing Backend Python dependencies...
   Installing packages.....
✅ Backend dependencies installed

[STEP] Installing Frontend Node.js dependencies...
   Installing packages (this may take a while)........
✅ Frontend dependencies installed
```

### Step 5: Database Setup

```
[STEP] Setting up Frontend database with Prisma...

ℹ️  Generating Prisma Client...
ℹ️  Pushing database schema...
✅ Database setup completed
```

### Step 6: Final Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   🎉 INITIALIZATION COMPLETED SUCCESSFULLY! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Setup Summary:
├─ Backend
│  ├─ API Key: ✓ Generated & Configured
│  ├─ Environment: ✓ .env created
│  ├─ Dependencies: ✓ Installed
│  └─ Directories: ✓ Created
│
└─ Frontend
   ├─ API Key: ✓ Same as Backend
   ├─ Environment: ✓ .env created
   ├─ Dependencies: ✓ Installed
   └─ Database: ✓ Prisma configured

🔐 API Key Information:
   Your API Key: apk_XyZ123AbC456DeF789GhI012JkL345MnO678PqR901StU234
   Location:
     • Backend:  .env → API_KEY
     • Frontend: frontend/.env → PYTHON_API_KEY

🚀 Next Steps:
1. Start Backend:
   ./start_production.sh

2. Start Frontend (in new terminal):
   cd frontend && npm run dev

3. Access Applications:
   • Backend API:  http://localhost:8000
   • Frontend:     http://localhost:3000
   • API Docs:     http://localhost:8000/docs
```

---

## 🚀 Starting the Application

### Option 1: Using Production Scripts (Recommended)

#### Start Backend (Terminal 1)

```bash
./start_production.sh
```

This will start:
- Redis Server (if not running)
- FastAPI with Gunicorn (4 workers)
- Celery Workers (4 concurrent workers)

#### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

#### Check Status

```bash
./status_production.sh
```

### Option 2: Using PM2-like Manager

```bash
# Start all backend services
./pm2-like.sh start

# Check status
./pm2-like.sh status

# View logs
./pm2-like.sh logs

# Stop all services
./pm2-like.sh stop
```

### Option 3: Development Mode

#### Backend (Terminal 1)

```bash
# Start Redis first
redis-server

# Start FastAPI with auto-reload
uvicorn app.main:app --reload --port 8000

# Start Celery workers (separate terminal)
celery -A app.celery_app worker --loglevel=info
```

#### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

---

## 🌐 Access Points

After starting both backend and frontend:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js web application |
| **Backend API** | http://localhost:8000 | Python FastAPI |
| **API Docs** | http://localhost:8000/docs | Swagger UI documentation |
| **ReDoc** | http://localhost:8000/redoc | Alternative API docs |
| **Prisma Studio** | `npm run db:studio` | Database viewer (port 5555) |

---

## 📁 Generated Files Structure

After running init.sh:

```
vision-computer/
├── .env                    # ✅ Backend config with API_KEY
├── uploads/                # ✅ Created
├── outputs/                # ✅ Created
├── temp/                   # ✅ Created
├── logs/                   # ✅ Created
├── pids/                   # ✅ Created
│
└── frontend/
    ├── .env                # ✅ Frontend config with PYTHON_API_KEY
    ├── node_modules/       # ✅ Dependencies installed
    └── prisma/
        └── schema.prisma   # ✅ Database schema
```

---

## 🔧 Configuration Files

### Backend `.env`

```env
# API Security
API_KEY=apk_GeneratedKey123...

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Upload Configuration
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
TEMP_DIR=./temp

# Processing Configuration
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=docx,doc,pdf

# Environment
ENVIRONMENT=development
DEBUG=true
```

### Frontend `.env`

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rumahplagiasi"

# NextAuth
NEXTAUTH_SECRET="GeneratedSecret123..."
NEXTAUTH_URL="http://localhost:3000"

# Python API (Same API key as backend!)
PYTHON_API_URL="http://localhost:8000"
PYTHON_API_KEY=apk_GeneratedKey123...
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

---

## 🧪 Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected:
```json
{
  "status": "healthy",
  "version": "2.1.0"
}
```

### 2. Test API with Authentication

```bash
# Get your API key from .env
API_KEY=$(grep "^API_KEY=" .env | cut -d'=' -f2)

# Test strategies endpoint
curl http://localhost:8000/config/strategies \
  -H "X-API-Key: $API_KEY"
```

### 3. Test Frontend

Open browser: http://localhost:3000

You should see the homepage with:
- "ANTI-PLAGIASI" title
- "Document Bypass System v2.1.0"
- Links to Dashboard and Login

---

## 🔄 Re-initialization

If you need to re-initialize (will backup existing .env files):

```bash
./init.sh
```

Old `.env` files will be backed up as:
- `.env.backup.<timestamp>`
- `frontend/.env.backup.<timestamp>`

---

## 🐛 Troubleshooting

### Issue: "Python 3 is not installed"

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install python3 python3-pip

# macOS
brew install python3
```

### Issue: "Node.js is not installed"

**Solution:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node
```

### Issue: "Redis not found"

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis
```

### Issue: "PostgreSQL not found"

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# macOS
brew install postgresql@15
brew services start postgresql@15
```

### Issue: "Database connection failed"

**Solution:**
1. Make sure PostgreSQL is running
2. Create database:
   ```bash
   createdb rumahplagiasi
   ```
3. Update `DATABASE_URL` in `frontend/.env`
4. Run Prisma setup:
   ```bash
   cd frontend
   npx prisma db push
   ```

### Issue: "Port 8000 already in use"

**Solution:**
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in Python API
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
cd frontend
PORT=3001 npm run dev
```

---

## 📚 Next Steps After Setup

1. **Read Documentation**
   - [API_KEY_SETUP.md](API_KEY_SETUP.md) - API Key authentication
   - [frontend/README.md](frontend/README.md) - Frontend guide
   - API Docs: http://localhost:8000/docs

2. **Implement Features**
   - Authentication (NextAuth.js)
   - Document upload interface
   - Bypass processing workflow
   - Dashboard with analytics

3. **Customize Configuration**
   - Modify bypass strategies
   - Add custom bypass techniques
   - Configure email notifications
   - Setup monitoring

---

## 🎯 Summary

| Step | Command | Time |
|------|---------|------|
| 1. Initialize | `./init.sh` | ~5 min |
| 2. Start Backend | `./start_production.sh` | ~30 sec |
| 3. Start Frontend | `cd frontend && npm run dev` | ~10 sec |
| 4. Access App | Open http://localhost:3000 | Instant |

**Total:** ~6 minutes from zero to running! 🚀

---

## 💡 Pro Tips

1. **Use PM2-like Manager**
   ```bash
   ./pm2-like.sh start    # Start all services
   ./pm2-like.sh status   # Check status
   ./pm2-like.sh logs     # View logs
   ```

2. **Monitor Services**
   ```bash
   ./pm2-like.sh monit    # Real-time monitoring
   ```

3. **Quick Restart**
   ```bash
   ./restart_production.sh
   ```

4. **View Logs**
   ```bash
   tail -f logs/*.log
   ```

5. **Database Management**
   ```bash
   cd frontend
   npm run db:studio      # Open Prisma Studio
   ```

---

⚡ **Made with ❤️ by devnolife**

Need help? Check the documentation or open an issue!
