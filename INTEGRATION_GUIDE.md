# 🔗 Backend-Frontend Integration Guide

**Anti-Plagiasi System - Database Integration**
Created by devnolife

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Flow Diagram](#flow-diagram)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Database Schema](#database-schema)
- [Testing](#testing)

---

## 🎯 Overview

Sistem ini mengintegrasikan **Python Backend** (FastAPI + Celery) dengan **Next.js Frontend** (PostgreSQL + Prisma) untuk:

✅ **Tracking semua dokumen yang diproses**
✅ **Menyimpan hasil analisis dan bypass**
✅ **Memungkinkan user melihat history mereka**
✅ **Monitoring status processing real-time**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER UPLOADS FILE                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PYTHON BACKEND                               │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   FastAPI    │─────▶│    Celery    │─────▶│ Bypass Engine│  │
│  │   (Upload)   │      │   (Process)  │      │  (Modify)    │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                             │                                    │
│                             │ Saves result to backend/outputs/   │
│                             ▼                                    │
│                    ┌──────────────────┐                         │
│                    │ Database Client  │                         │
│                    │  (HTTP Request)  │                         │
│                    └────────┬─────────┘                         │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                              │ POST /api/bypass/result
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS FRONTEND                            │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │  API Routes  │─────▶│   Prisma     │─────▶│  PostgreSQL  │  │
│  │  (Receive)   │      │  (ORM)       │      │  (Database)  │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            USER CAN VIEW THEIR DOCUMENTS                  │  │
│  │  - Document List                                          │  │
│  │  - Processing Status                                      │  │
│  │  - Download Results                                       │  │
│  │  - View Statistics                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow Diagram

### Complete Processing Flow:

```
1. User Upload Document
   │
   ├─▶ Next.js API: POST /api/documents/create
   │   └─▶ Save to database: Document (PENDING status)
   │   └─▶ Return document_id
   │
2. Call Python API for Processing
   │
   ├─▶ Python Backend: POST /bypass/unified
   │   ├─▶ Start Celery Task (process_document_unified_task)
   │   │   ├─▶ Phase 1: Analyze PDF (detect flags)
   │   │   ├─▶ Phase 2: Match flags in original
   │   │   ├─▶ Phase 3: Apply bypass techniques
   │   │   └─▶ Save to backend/outputs/
   │   │
   │   └─▶ Database Client: Save Results
   │       └─▶ POST /api/bypass/result
   │           ├─▶ Save BypassHistory (COMPLETED)
   │           ├─▶ Update Document (COMPLETED)
   │           └─▶ Create ActivityLog
   │
3. User Views Results
   │
   └─▶ Next.js: GET /api/documents/user/{userId}
       └─▶ Display document list with download links
```

---

## 📡 API Endpoints

### Next.js API Routes

#### 1. Create Document
```typescript
POST /api/documents/create

Request Body:
{
  "userId": "user_123",
  "title": "My Document",
  "originalFilename": "document.docx",
  "fileSize": 1024000,
  "fileType": "docx",
  "uploadPath": "/uploads/document.docx"
}

Response:
{
  "success": true,
  "data": {
    "id": "doc_abc123",
    "title": "My Document",
    "status": "PENDING",
    ...
  }
}
```

#### 2. Save Analysis Result
```typescript
POST /api/documents/{documentId}/analysis

Request Body:
{
  "flagCount": 15,
  "flagTypes": ["highlight", "underline"],
  "metadata": {...}
}

Response:
{
  "success": true,
  "data": {
    "id": "analysis_xyz",
    "documentId": "doc_abc123",
    ...
  }
}
```

#### 3. Save Bypass Result
```typescript
POST /api/bypass/result

Request Body:
{
  "documentId": "doc_abc123",
  "userId": "user_123",
  "strategy": "unified_bypass",
  "status": "COMPLETED",
  "outputPath": "backend/outputs/unified_bypass_20251026_123456_document.docx",
  "outputFilename": "unified_bypass_20251026_123456_document.docx",
  "outputFileSize": 1048576,
  "flagsRemoved": 15,
  "processingTime": 45,
  "successRate": 95.5
}

Response:
{
  "success": true,
  "data": {
    "id": "bypass_123",
    "documentId": "doc_abc123",
    "status": "COMPLETED",
    ...
  }
}
```

#### 4. Get User Documents
```typescript
GET /api/documents/user/{userId}?page=1&limit=20&status=COMPLETED

Response:
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc_abc123",
        "title": "My Document",
        "status": "COMPLETED",
        "bypasses": [
          {
            "outputFilename": "unified_bypass_...",
            "outputPath": "backend/outputs/...",
            "flagsRemoved": 15
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### 5. Get Document Detail
```typescript
GET /api/documents/{documentId}/status

Response:
{
  "success": true,
  "data": {
    "id": "doc_abc123",
    "title": "My Document",
    "status": "COMPLETED",
    "user": {...},
    "analysis": {...},
    "bypasses": [...]
  }
}
```

---

## 💻 Usage Examples

### Python Backend (Celery Task)

```python
from app.database_client import db_client

# Inside process_document_unified_task
def process_document_unified_task(self, document_id, user_id, ...):
    # ... processing logic ...

    # Save to database after processing
    db_client.save_bypass_result(
        document_id=document_id,
        user_id=user_id,
        strategy="unified_bypass",
        status="COMPLETED",
        output_path=output_filename,
        output_filename=os.path.basename(output_filename),
        output_file_size=output_file_size,
        flags_removed=len(processed_flags),
        processing_time=processing_time,
        success_rate=success_rate
    )
```

### Next.js Frontend (React Component)

```typescript
import { documentService } from '@/lib/services/document.service'

// Get user documents
const { data } = await documentService.getUserDocuments('user_123', {
  page: 1,
  limit: 20,
  status: 'COMPLETED'
})

// Display documents
data.documents.map(doc => (
  <div key={doc.id}>
    <h3>{doc.title}</h3>
    <p>Status: {doc.status}</p>
    {doc.bypasses[0] && (
      <a href={`/download/${doc.bypasses[0].outputPath}`}>
        Download Result
      </a>
    )}
  </div>
))
```

---

## 🗄️ Database Schema

### Key Models

```prisma
model Document {
  id                 String             @id @default(cuid())
  title              String
  originalFilename   String
  fileSize           Int
  status             DocumentStatus     @default(PENDING)
  userId             String

  user               User               @relation(...)
  analysis           DocumentAnalysis?
  bypasses           BypassHistory[]
}

model BypassHistory {
  id                String         @id @default(cuid())
  documentId        String
  userId            String
  strategy          String
  status            BypassStatus   @default(PENDING)

  outputPath        String?
  outputFilename    String?
  outputFileSize    Int?
  flagsRemoved      Int?
  processingTime    Int?
  successRate       Float?

  document          Document       @relation(...)
  user              User           @relation(...)
}
```

---

## 🧪 Testing

### 1. Test Database Connection

```bash
# From backend directory
cd backend
python -c "from app.database_client import db_client; print('✓ Database client initialized')"
```

### 2. Test API Endpoints

```bash
# Test create document
curl -X POST http://localhost:3000/api/documents/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "title": "Test Document",
    "originalFilename": "test.docx",
    "fileSize": 1024,
    "fileType": "docx"
  }'
```

### 3. Full Integration Test

1. **Start Backend:**
   ```bash
   ./devnolife.sh
   # Select option [2] - Start Backend
   ```

2. **Start Frontend:**
   ```bash
   ./devnolife.sh
   # Select option [3] - Start Frontend
   ```

3. **Upload & Process:**
   - Upload document via Python API
   - Check database for new record
   - Verify output file is saved
   - Check bypass history record

4. **View Results:**
   - Login to frontend
   - Navigate to documents page
   - See processed documents
   - Download result file

---

## 🔐 Environment Variables

### Backend (.env)
```bash
API_KEY=apk_your_generated_key
NEXTJS_API_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379/0
UPLOAD_DIR=./backend/uploads
OUTPUT_DIR=./backend/outputs
```

### Frontend (.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/antiplagiasi
NEXT_PUBLIC_API_URL=http://localhost:3000
PYTHON_API_URL=http://localhost:8000
PYTHON_API_KEY=apk_your_generated_key
```

---

## 🎯 Key Features

✅ **Automatic Database Sync** - Results auto-saved after processing
✅ **Real-time Status** - Track processing status
✅ **User-specific Data** - Each user sees only their documents
✅ **Complete History** - Full audit trail of all operations
✅ **Statistics Tracking** - Success rates, processing times, etc.
✅ **Error Handling** - Graceful degradation if database unavailable

---

## 📝 Notes

1. **File Storage**: Files stored in `backend/outputs/` (not in database)
2. **Database**: Only metadata stored in PostgreSQL
3. **Download**: Frontend needs route to serve files from backend
4. **Security**: API key required for backend-to-frontend communication
5. **Scalability**: Database can be separate from file storage

---

## 🛠️ Setup and Testing

### Quick Setup

Use the automated setup script to initialize the frontend:

```bash
# Run the frontend setup script
./setup_frontend.sh
```

This script will:
- Install all dependencies
- Generate Prisma client
- Push database schema
- Seed database with test users (admin and regular users)

### Verify Integration

Run the verification script to check if all components are properly integrated:

```bash
# Run integration verification
./verify_integration.sh
```

This will check:
- All prerequisites (PostgreSQL, Redis, Node.js, Python)
- File structure and key files
- Environment configuration
- Running services (Python API, Next.js)
- Database connection and tables
- API endpoints

### Comprehensive Testing

For detailed testing scenarios, refer to [TESTING_GUIDE.md](./TESTING_GUIDE.md) which includes:
- User authentication flows
- Document upload and processing tests
- Admin dashboard functionality
- Real-time progress tracking
- Role-based access control verification
- Error handling scenarios

### Test Credentials

After running the seed script:

**Admin Account:**
- Email: `admin@antiplagiasi.com`
- Password: `admin123`
- Can access: `/admin` dashboard with full system visibility

**Test Users:**
- Email: `user1@test.com` / `user2@test.com`
- Password: `user123`
- Can access: Personal `/dashboard` only

---

## 🚀 Next Steps

1. ✅ ~~Create file download endpoint~~ (Completed)
2. ✅ ~~Add authentication~~ (Completed with NextAuth)
3. ✅ ~~Implement role-based access~~ (Completed - Admin/User roles)
4. Add file cleanup cron job
5. Add search and filter in admin dashboard
6. Create analytics and reporting features
7. Implement email notifications
8. Add rate limiting and quota management

---

**Made with ❤️ by devnolife**
