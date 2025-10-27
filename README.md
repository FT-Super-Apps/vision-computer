# 🏠 Rumah Plagiasi

Modern document bypass system dengan Next.js fullstack frontend dan Python FastAPI backend. Setup dalam 5 menit dengan satu command!

⚡ **Created by devnolife**

---

## 📋 Table of Contents

- [Quick Start](#-quick-start-5-minutes)
- [Architecture](#-architecture)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Detailed Setup](#-detailed-setup)
- [API Key Authentication](#-api-key-authentication)
- [Frontend Guide](#-frontend-guide-nextjs)
- [Backend Guide](#-backend-guide-python)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites

- ✅ Python 3.8+
- ✅ Node.js 18+
- ✅ npm
- ⚠️ Redis (optional, for Celery)
- ⚠️ PostgreSQL (optional, for frontend DB)

### One-Command Setup

```bash
# 1. Initialize everything (auto-generate API key, setup .env, install deps)
./init.sh

# 2. Setup frontend (database, seed users, etc.)
./setup_frontend.sh

# 3. Start backend
./start_production.sh

# 4. Start frontend (in new terminal)
cd frontend && npm run dev

# 5. Access applications
# - Frontend: http://localhost:3000
# - Admin Dashboard: http://localhost:3000/admin
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

**That's it!** 🎉 Everything configured automatically!

### 🔐 Default Login Credentials

After running `setup_frontend.sh`, use these credentials:

**Admin Access:**
- Email: `admin@rumahplagiasi.com`
- Password: `admin123`
- Access: Full system monitoring at `/admin`

**Test User:**
- Email: `user1@test.com`
- Password: `user123`
- Access: Personal dashboard at `/dashboard`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    init.sh (One Command)                     │
│                                                              │
│  ✓ Check prerequisites                                       │
│  ✓ Generate secure API key: apk_abc123...                   │
│  ✓ Setup Backend .env with API_KEY                          │
│  ✓ Setup Frontend .env with PYTHON_API_KEY (same key)       │
│  ✓ Install all dependencies                                 │
│  ✓ Setup Prisma database                                    │
│  ✓ Create directories                                       │
│  ✓ Verify setup                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴─────────────────────┐
        │                                         │
        ↓                                         ↓
┌──────────────────────┐              ┌──────────────────────┐
│  Backend (Port 8000)  │              │  Frontend (Port 3000) │
│                      │              │                      │
│  • FastAPI           │◄─────────────┤  • Next.js 14        │
│  • Celery Workers    │  X-API-Key   │  • App Router        │
│  • Redis             │              │  • Prisma ORM        │
│  • Document Bypass   │              │  • Shadcn UI         │
│  • OCR Processing    │              │  • NextAuth.js       │
│                      │              │                      │
│  .env:               │              │  .env:               │
│    API_KEY=apk_...   │              │    PYTHON_API_KEY=   │
│                      │              │      apk_... (same!) │
└──────────────────────┘              └──────────────────────┘
```

### Data Flow

```
User Upload Document
       ↓
Next.js Frontend (Port 3000)
       ↓
    (HTTP + X-API-Key Header)
       ↓
Python API (Port 8000)
       ↓
   Validate API Key
       ↓
   Queue Task to Celery
       ↓
Celery Worker Processes Document
       ↓
   Store Result in Redis
       ↓
Return Result to Frontend
       ↓
Display to User
```

---

## ✨ Features

### Backend (Python FastAPI)
- ✅ **Document Bypass** - Multiple strategies (header_focused, natural, etc.)
- ✅ **Document Analysis** - Flag detection & metadata extraction
- ✅ **OCR Processing** - Extract text from PDFs
- ✅ **Async Processing** - Celery task queue with Redis
- ✅ **API Key Auth** - Secure authentication with middleware
- ✅ **Auto Documentation** - Swagger UI & ReDoc
- ✅ **File Management** - Upload/download with size limits
- ✅ **Error Handling** - Comprehensive error responses

### Frontend (Next.js)
- ✅ **Modern UI** - Shadcn UI components + TailwindCSS
- ✅ **Full Stack** - API routes + Server components
- ✅ **Database** - Prisma ORM with PostgreSQL
- ✅ **Authentication** - NextAuth.js with credentials provider & bcrypt
- ✅ **Role-Based Access** - Admin & User roles with route protection
- ✅ **Admin Dashboard** - Real-time monitoring of all users' processes
- ✅ **Progress Tracking** - Live progress bars with auto-refresh
- ✅ **User Management** - Registration, login, and profile management
- ✅ **Document Management** - Upload, list, search, download
- ✅ **Bypass History** - Complete audit trail of all operations
- ✅ **Analytics** - System-wide statistics and user metrics
- ✅ **Responsive** - Mobile-friendly design

---

## 📁 Project Structure

```
vision-computer/
├── 🔥 init.sh                      # ONE-COMMAND SETUP
├── generate_api_key.py             # API key generator
├── start_production.sh             # Start backend services
├── stop_production.sh              # Stop backend services
├── restart_production.sh           # Restart services
├── status_production.sh            # Check status
├── pm2-like.sh                     # PM2-like manager
│
├── .env                            # Backend config (auto-generated)
├── requirements.txt                # Python dependencies
│
├── app/                            # Python FastAPI Application
│   ├── main.py                     # FastAPI app with API key middleware
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── api_key.py              # API key authentication
│   ├── bypass_engine.py            # Document bypass logic
│   ├── content_analyzer.py         # Document analysis
│   ├── tasks.py                    # Celery async tasks
│   └── celery_app.py               # Celery configuration
│
├── uploads/                        # Uploaded files (auto-created)
├── outputs/                        # Processed files (auto-created)
├── temp/                           # Temporary files (auto-created)
├── logs/                           # Application logs (auto-created)
├── pids/                           # Process IDs (auto-created)
│
└── frontend/                       # Next.js Application
    ├── .env                        # Frontend config (auto-generated)
    ├── package.json                # Node dependencies
    │
    ├── prisma/
    │   └── schema.prisma           # Database schema (comprehensive!)
    │
    ├── app/
    │   ├── layout.tsx              # Root layout
    │   ├── page.tsx                # Homepage
    │   ├── globals.css             # Global styles
    │   ├── api/                    # API routes (to be implemented)
    │   ├── dashboard/              # Dashboard pages
    │   ├── documents/              # Document management
    │   ├── history/                # Bypass history
    │   └── auth/                   # Auth pages
    │
    ├── components/
    │   ├── ui/                     # Shadcn UI components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── input.tsx
    │   │   └── label.tsx
    │   └── layout/                 # Layout components
    │
    └── lib/
        ├── prisma.ts               # Prisma client singleton
        ├── utils.ts                # Utility functions
        └── api/
            └── python-client.ts    # Python API integration
```

---

## 🔧 Detailed Setup

### What Does init.sh Do?

The initialization script automates **everything**:

1. **Check Prerequisites**
   - Verifies Python 3.8+
   - Verifies Node.js 18+
   - Verifies npm
   - Checks Redis (optional)
   - Checks PostgreSQL (optional)

2. **Generate API Key**
   ```
   apk_XyZ123AbC456DeF789GhI012JkL345MnO678PqR901StU234
   ```
   - Cryptographically secure (64 characters)
   - Same key for backend & frontend

3. **Setup Backend .env**
   ```env
   API_KEY=apk_XyZ123...
   REDIS_URL=redis://localhost:6379/0
   CELERY_BROKER_URL=redis://localhost:6379/0
   UPLOAD_DIR=./uploads
   OUTPUT_DIR=./outputs
   ```

4. **Setup Frontend .env**
   ```env
   PYTHON_API_KEY=apk_XyZ123...  # Same as backend!
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="auto-generated"
   PYTHON_API_URL="http://localhost:8000"
   ```

5. **Install Dependencies**
   - Backend: `pip install -r requirements.txt`
   - Frontend: `npm install`

6. **Setup Database**
   - Generate Prisma Client
   - Push schema to database

7. **Create Directories**
   - uploads/, outputs/, temp/, logs/, pids/

8. **Verify Setup**
   - Check all configs
   - Verify API key consistency
   - Display summary

### Manual Setup (Alternative)

If you prefer manual setup:

```bash
# 1. Generate API key
python generate_api_key.py

# 2. Setup backend
cp .env.example .env
# Edit .env and add API_KEY

# 3. Setup frontend
cd frontend
cp .env.example .env
# Edit .env and add PYTHON_API_KEY (same as backend API_KEY)

# 4. Install dependencies
pip install -r requirements.txt
cd frontend && npm install

# 5. Setup database
cd frontend
npx prisma generate
npx prisma db push

# 6. Create directories
mkdir -p uploads outputs temp logs pids
```

---

## 🔐 API Key Authentication

### How It Works

1. **Backend** validates `X-API-Key` header using middleware
2. **Frontend** automatically sends API key in all requests
3. **Same key** configured in both `.env` files

### API Key Format

```
apk_<48-character-random-string>
```

Example: `apk_CY8EMmqsYjc5YfwdHb8DCDX3C3OTbQeW3H5TQw8zoItlKYZx`

### Backend Middleware

File: `app/middleware/api_key.py`

```python
class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip validation for public endpoints
        if request.url.path in ["/", "/health", "/docs"]:
            return await call_next(request)
        
        # Validate API key
        api_key = request.headers.get("X-API-Key")
        if not api_key or api_key != os.getenv("API_KEY"):
            return JSONResponse(
                status_code=401,
                content={"error": "Invalid or missing API key"}
            )
        
        return await call_next(request)
```

### Frontend Client

File: `frontend/lib/api/python-client.ts`

```typescript
class PythonAPIClient {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.PYTHON_API_URL,
      headers: {
        'X-API-Key': process.env.PYTHON_API_KEY, // Auto-included!
      },
    })
  }
}
```

### Public vs Protected Endpoints

**Public (No API Key):**
- `GET /` - API info
- `GET /health` - Health check
- `GET /docs` - API documentation
- `GET /redoc` - ReDoc documentation

**Protected (API Key Required):**
- `POST /analyze/flags` - Analyze document
- `POST /bypass/upload` - Bypass document
- `POST /unified/process` - Unified processing
- `GET /config/strategies` - Get strategies
- All other endpoints

### Regenerate API Key

```bash
# Generate new key
python generate_api_key.py

# Update both .env files
# Backend: API_KEY=new_key
# Frontend: PYTHON_API_KEY=new_key

# Restart services
./restart_production.sh
cd frontend && npm run dev
```

---

## 🎨 Frontend Guide (Next.js)

### Database Schema (Prisma)

Comprehensive schema for data masters:

```prisma
// Users & Authentication
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          UserRole  @default(USER)
  documents     Document[]
  bypasses      BypassHistory[]
}

// Document Management
model Document {
  id                String         @id @default(cuid())
  title             String
  originalFilename  String
  fileSize          Int
  uploadedAt        DateTime       @default(now())
  status            DocumentStatus @default(PENDING)
  analysis          DocumentAnalysis?
  bypasses          BypassHistory[]
}

// Analysis Results (from Python API)
model DocumentAnalysis {
  id             String   @id @default(cuid())
  documentId     String   @unique
  flagCount      Int
  flagTypes      Json
  analyzedAt     DateTime @default(now())
}

// Bypass History
model BypassHistory {
  id             String       @id @default(cuid())
  documentId     String
  strategy       String
  status         BypassStatus @default(PENDING)
  outputPath     String?
  createdAt      DateTime     @default(now())
}

// System Statistics
model SystemStats {
  id                 String   @id @default(cuid())
  date               DateTime @unique
  totalDocuments     Int
  totalBypasses      Int
  successfulBypasses Int
}
```

### Python API Integration

File: `frontend/lib/api/python-client.ts`

```typescript
import { pythonAPI } from '@/lib/api/python-client'

// Analyze document
const result = await pythonAPI.analyzeDocument(file, filename)

// Perform bypass
const output = await pythonAPI.bypassDocument(file, filename, 'header_focused')

// Unified processing
const unified = await pythonAPI.unifiedProcess(file, filename, strategy)

// Get strategies
const strategies = await pythonAPI.getStrategies()

// OCR processing
const ocrResult = await pythonAPI.ocrPdf(file, filename)
```

### UI Components (Shadcn)

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Usage in components
<Card>
  <CardHeader>
    <CardTitle>Upload Document</CardTitle>
  </CardHeader>
  <CardContent>
    <Label htmlFor="file">Select File</Label>
    <Input id="file" type="file" />
    <Button>Upload</Button>
  </CardContent>
</Card>
```

### Development

```bash
cd frontend

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run dev server
npm run dev

# Open Prisma Studio
npm run db:studio
```

---

## 🐍 Backend Guide (Python)

### API Endpoints

#### Document Analysis
```bash
POST /analyze/flags
Content-Type: multipart/form-data
X-API-Key: apk_YourKeyHere

file: document.docx
```

#### Document Bypass
```bash
POST /bypass/upload
Content-Type: multipart/form-data
X-API-Key: apk_YourKeyHere

file: document.docx
strategy: header_focused
```

#### Unified Processing
```bash
POST /unified/process
Content-Type: multipart/form-data
X-API-Key: apk_YourKeyHere

file: document.docx
strategy: header_focused
```

#### Get Strategies
```bash
GET /config/strategies
X-API-Key: apk_YourKeyHere
```

### Bypass Strategies

1. **header_focused** - Remove Turnitin metadata from headers
2. **natural** - Natural text manipulation
3. **content_only** - Focus on content preservation
4. **aggressive** - Maximum flag removal
5. **custom** - Custom strategy (configurable)

### Celery Tasks

Async processing dengan Celery:

```python
from app.tasks import process_document_unified_task

# Queue task
task = process_document_unified_task.delay(file_path, strategy)

# Check status
result = task.get()
```

---

## 💻 Usage

### Start Services

#### Option 1: Production Mode (Recommended)
```bash
./start_production.sh
```

#### Option 2: PM2-like Manager
```bash
./pm2-like.sh start
```

#### Option 3: Development Mode
```bash
# Terminal 1: Backend
uvicorn app.main:app --reload

# Terminal 2: Celery
celery -A app.celery_app worker --loglevel=info

# Terminal 3: Frontend
cd frontend && npm run dev
```

### Check Status

```bash
./status_production.sh
# or
./pm2-like.sh status
```

### View Logs

```bash
./pm2-like.sh logs
# or
tail -f logs/*.log
```

### Stop Services

```bash
./stop_production.sh
# or
./pm2-like.sh stop
```

### Restart Services

```bash
./restart_production.sh
# or
./pm2-like.sh restart
```

---

## 📖 API Documentation

### Swagger UI
```
http://localhost:8000/docs
```

### ReDoc
```
http://localhost:8000/redoc
```

### OpenAPI Schema
```
http://localhost:8000/openapi.json
```

---

## 🐛 Troubleshooting

### Backend Issues

#### "API_KEY not set" Warning
```bash
# Check .env file exists
ls -la .env

# Run init.sh to recreate
./init.sh
```

#### Port 8000 Already in Use
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or change port
uvicorn app.main:app --port 8001
```

#### Redis Connection Error
```bash
# Start Redis
redis-server

# Or install Redis
sudo apt-get install redis-server  # Ubuntu
brew install redis                  # macOS
```

### Frontend Issues

#### "PYTHON_API_KEY not set" Warning
```bash
# Check frontend/.env exists
ls -la frontend/.env

# Run init.sh to recreate
./init.sh
```

#### Port 3000 Already in Use
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or run on different port
cd frontend
PORT=3001 npm run dev
```

#### Database Connection Error
```bash
# Create database
createdb rumahplagiasi

# Push schema
cd frontend
npx prisma db push
```

#### Prisma Client Not Generated
```bash
cd frontend
npx prisma generate
```

### Authentication Issues

#### 401 Unauthorized
```bash
# Check API key in .env files
grep "API_KEY" .env
grep "PYTHON_API_KEY" frontend/.env

# Make sure they match
```

#### 403 Forbidden
```bash
# Regenerate API key
python generate_api_key.py

# Update both .env files
# Restart services
```

---

## 🚢 Deployment

### Development
```bash
./init.sh
./start_production.sh
cd frontend && npm run dev
```

### Production Checklist

- [ ] Generate production API key
- [ ] Setup PostgreSQL production database
- [ ] Configure Redis for production
- [ ] Setup reverse proxy (Nginx)
- [ ] Enable HTTPS/SSL
- [ ] Configure environment variables
- [ ] Setup monitoring & logging
- [ ] Configure backup strategy
- [ ] Setup CI/CD pipeline
- [ ] Load testing
- [ ] Security audit

### Environment Variables

**Backend Production:**
```env
API_KEY=<production-key>
ENVIRONMENT=production
DEBUG=false
REDIS_URL=<production-redis-url>
ALLOWED_ORIGINS=https://your-domain.com
```

**Frontend Production:**
```env
PYTHON_API_KEY=<same-as-backend>
DATABASE_URL=<production-database-url>
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

Private - Created by devnolife

---

## 💡 Tips & Tricks

### Quick Commands

```bash
# Full restart
./restart_production.sh && cd frontend && npm run dev

# Check all services
./pm2-like.sh status

# Monitor logs
./pm2-like.sh monit

# Database management
cd frontend && npm run db:studio
```

### Performance Tips

1. Use production mode for backend (`./start_production.sh`)
2. Enable Redis caching
3. Optimize Prisma queries
4. Use CDN for frontend assets
5. Enable gzip compression
6. Monitor with Prisma Studio

### Security Tips

1. Never commit `.env` files
2. Rotate API keys regularly (every 90 days)
3. Use different keys per environment
4. Enable HTTPS in production
5. Setup rate limiting
6. Monitor failed auth attempts

---

## 📞 Support

For questions or issues:
- Check troubleshooting section above
- View API docs: http://localhost:8000/docs
- Open an issue on GitHub

---

⚡ **Made with ❤️ by devnolife**

**Remember:** Just run `./init.sh` and you're ready to go! 🚀
