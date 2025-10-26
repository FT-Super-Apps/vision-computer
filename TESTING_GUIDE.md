# Testing Guide - Anti-Plagiasi System Integration

This guide walks through testing the complete backend-frontend integration with role-based access control.

## Prerequisites

### 1. Environment Setup

Ensure you have the following services running:
- PostgreSQL database
- Redis server
- Python backend API (FastAPI)
- Next.js frontend

### 2. Initial Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npm run db:generate

# 4. Push database schema
npm run db:push

# 5. Seed database with test users
npm run db:seed
```

## Test Credentials

After running the seed script, you'll have these test accounts:

### Admin Account
- **Email**: admin@antiplagiasi.com
- **Password**: admin123
- **Role**: ADMIN
- **Access**: Full system access, can view all users' documents and progress

### Test User 1
- **Email**: user1@test.com
- **Password**: user123
- **Role**: USER
- **Access**: Can only view their own documents

### Test User 2
- **Email**: user2@test.com
- **Password**: user123
- **Role**: USER
- **Access**: Can only view their own documents

## Testing Scenarios

### Test 1: User Authentication

#### 1.1 Registration Flow
```bash
# Start the frontend
cd frontend
npm run dev
```

1. Navigate to http://localhost:3000/auth/register
2. Register a new user:
   - Name: "New Test User"
   - Email: "newuser@test.com"
   - Password: "password123"
3. Verify redirect to login page
4. Check database:
```bash
npm run db:studio
# Look for the new user in the users table
```

#### 1.2 Login Flow (Regular User)
1. Navigate to http://localhost:3000/auth/login
2. Login with user1@test.com / user123
3. Verify redirect to /dashboard
4. Verify user can only see their own documents
5. Try accessing /admin - should redirect to /dashboard

#### 1.3 Login Flow (Admin User)
1. Logout (if logged in)
2. Login with admin@antiplagiasi.com / admin123
3. Verify redirect to /dashboard
4. Navigate to /admin - should see admin dashboard
5. Verify admin can see all users' documents

### Test 2: Document Upload & Processing (via Python API)

#### 2.1 Upload Document via Python API
```bash
# From project root
cd backend

# Upload a document (replace with actual .docx file)
curl -X POST "http://localhost:8000/bypass/upload" \
  -H "X-API-Key: your-api-key" \
  -F "file=@test_document.docx" \
  -F "strategy=unified_bypass" \
  -F "user_id=USER_ID_FROM_DB" \
  -F "document_title=Test Document"
```

Expected response:
```json
{
  "status": "processing",
  "task_id": "xxxx-xxxx-xxxx",
  "document_id": "yyyy-yyyy-yyyy",
  "message": "Document uploaded and processing started"
}
```

#### 2.2 Check Processing Status
```bash
curl "http://localhost:8000/task/status/{task_id}" \
  -H "X-API-Key: your-api-key"
```

Expected response:
```json
{
  "task_id": "xxxx-xxxx-xxxx",
  "status": "PROCESSING",
  "progress": 45,
  "result": null
}
```

### Test 3: Frontend Integration

#### 3.1 User Dashboard View
1. Login as user1@test.com
2. Navigate to /dashboard
3. Verify you see the document you uploaded
4. Check document status (PROCESSING → COMPLETED)
5. For completed documents:
   - Verify "Download" button appears
   - Click download and verify file downloads correctly

#### 3.2 Admin Dashboard View
1. Login as admin@antiplagiasi.com
2. Navigate to /admin
3. **Overview Tab**:
   - Verify statistics show correct counts
   - Check "Processing Now" count updates in real-time
   - Verify success rate calculation
   - Review recent activity log
   - Check top users ranking
4. **Documents Tab**:
   - Verify all users' documents are visible
   - For each document, verify:
     - User information displayed (name, email)
     - Document status correct
     - Progress bar shows for PROCESSING documents
     - Completed documents show metrics (flags removed, processing time)
     - Failed documents show error message
5. **Real-time Updates**:
   - Keep admin dashboard open
   - Upload a new document via API (in another terminal)
   - Verify document appears within 10 seconds
   - Watch progress bar update in real-time

### Test 4: Database Integration

#### 4.1 Document Record Creation
```bash
# Check database via Prisma Studio
cd frontend
npm run db:studio
```

1. Navigate to "documents" table
2. Verify uploaded document exists with:
   - Correct userId
   - Original filename
   - Status: PENDING → PROCESSING → COMPLETED
   - File metadata (size, type, page count)

#### 4.2 Bypass History
1. Navigate to "bypass_history" table
2. For each processing job, verify:
   - documentId matches
   - userId matches
   - strategy is correct
   - status updates (PENDING → QUEUED → PROCESSING → COMPLETED)
   - progress goes from 0 to 100
   - outputPath and outputFilename populated
   - Metrics populated (flagsRemoved, processingTime, successRate)
   - pythonApiResponse contains processing details

#### 4.3 Activity Logs
1. Navigate to "activity_logs" table
2. Verify activities logged:
   - USER_LOGIN
   - DOCUMENT_UPLOAD
   - BYPASS_CREATED
   - BYPASS_COMPLETED

### Test 5: File Download

#### 5.1 Download via Frontend
1. Login as user with completed document
2. Navigate to /dashboard
3. Click "Download" button on completed document
4. Verify file downloads with correct filename
5. Open file and verify it's the processed version

#### 5.2 Download via API
```bash
# Get the output filename from database
# Then download via API
curl "http://localhost:8000/bypass/download/{filename}" \
  -H "X-API-Key: your-api-key" \
  -o downloaded_file.docx
```

Verify file downloads correctly.

### Test 6: Role-Based Access Control

#### 6.1 API Authorization Tests
```bash
# Test admin endpoint without auth - should fail
curl http://localhost:3000/api/admin/stats
# Expected: 403 Unauthorized

# Test admin endpoint as regular user - should fail
# 1. Login as user1@test.com
# 2. Get session cookie
# 3. Try accessing admin endpoint
curl http://localhost:3000/api/admin/stats \
  -H "Cookie: next-auth.session-token=USER_SESSION_TOKEN"
# Expected: 403 Unauthorized

# Test admin endpoint as admin - should succeed
# 1. Login as admin@antiplagiasi.com
# 2. Get session cookie
# 3. Access admin endpoint
curl http://localhost:3000/api/admin/stats \
  -H "Cookie: next-auth.session-token=ADMIN_SESSION_TOKEN"
# Expected: 200 OK with stats data
```

#### 6.2 Frontend Route Protection
1. **Without Auth**:
   - Navigate to /dashboard - should redirect to /auth/login
   - Navigate to /admin - should redirect to /auth/login

2. **As Regular User**:
   - Navigate to /dashboard - should show user dashboard
   - Navigate to /admin - should redirect to /dashboard

3. **As Admin**:
   - Navigate to /dashboard - should show user dashboard
   - Navigate to /admin - should show admin dashboard

### Test 7: Real-time Progress Tracking

#### 7.1 Upload Large Document
```bash
# Upload a larger document that takes time to process
curl -X POST "http://localhost:8000/bypass/upload" \
  -H "X-API-Key: your-api-key" \
  -F "file=@large_document.docx" \
  -F "strategy=comprehensive" \
  -F "user_id=USER_ID" \
  -F "document_title=Large Test Document"
```

#### 7.2 Monitor Progress
1. Login as admin
2. Navigate to /admin
3. Click "Documents" tab
4. Watch the progress bar update in real-time (auto-refresh every 10 seconds)
5. Verify:
   - Progress starts at 0%
   - Progress increases over time
   - Status changes: PENDING → QUEUED → PROCESSING → COMPLETED
   - Upon completion, progress bar disappears
   - Metrics appear (flags removed, processing time)

### Test 8: Error Handling

#### 8.1 Failed Processing
1. Upload a corrupted or invalid document
2. Verify:
   - Status changes to FAILED
   - Error message displayed in admin dashboard
   - Error message displayed in user dashboard
   - Document remains in database for debugging

#### 8.2 Network Errors
1. Stop the Python API
2. Try uploading a document
3. Verify error handling in frontend
4. Restart Python API
5. Verify system recovers

## Automated Testing Script

Create a test script to automate common scenarios:

```bash
#!/bin/bash
# test_integration.sh

echo "🧪 Testing Anti-Plagiasi Integration..."

# Test 1: Health Check
echo "\n1️⃣ Testing API Health..."
curl -s http://localhost:8000/ | jq
curl -s http://localhost:3000/api/health | jq

# Test 2: Database Connection
echo "\n2️⃣ Testing Database Connection..."
cd frontend
npx prisma db execute --stdin <<< "SELECT 1"

# Test 3: Upload Document
echo "\n3️⃣ Testing Document Upload..."
UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:8000/bypass/upload" \
  -H "X-API-Key: $API_KEY" \
  -F "file=@test_document.docx" \
  -F "strategy=unified_bypass" \
  -F "user_id=$TEST_USER_ID" \
  -F "document_title=Automated Test Document")

echo $UPLOAD_RESPONSE | jq
TASK_ID=$(echo $UPLOAD_RESPONSE | jq -r '.task_id')

# Test 4: Check Task Status
echo "\n4️⃣ Checking Task Status..."
sleep 5
curl -s "http://localhost:8000/task/status/$TASK_ID" \
  -H "X-API-Key: $API_KEY" | jq

echo "\n✅ Integration tests completed!"
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string in .env
cat frontend/.env | grep DATABASE_URL
```

#### 2. Prisma Client Not Generated
```bash
cd frontend
npm run db:generate
```

#### 3. Session/Auth Issues
```bash
# Clear browser cookies
# Check NEXTAUTH_SECRET in .env
# Verify NEXTAUTH_URL matches your frontend URL
```

#### 4. Python API Not Saving Results
```bash
# Check logs
tail -f backend/logs/app.log

# Verify environment variables
cat backend/.env | grep NEXTJS_API_URL

# Test database client
cd backend
python -c "from app.database_client import db_client; print(db_client.nextjs_url)"
```

#### 5. Admin Dashboard Not Showing Data
```bash
# Check browser console for errors
# Verify admin user role in database
# Check API endpoint responses in Network tab
```

## Success Criteria

Your integration is working correctly if:

- ✅ Users can register and login
- ✅ Documents uploaded via Python API appear in Next.js database
- ✅ User dashboard shows only user's own documents
- ✅ Admin dashboard shows all users' documents
- ✅ Real-time progress tracking works (auto-refresh)
- ✅ Progress bars update correctly for processing documents
- ✅ Completed documents can be downloaded
- ✅ Role-based access control prevents unauthorized access
- ✅ Activity logs capture all important events
- ✅ Statistics calculate correctly
- ✅ Error handling works for failed processing

## Next Steps

After successful testing:

1. Deploy to staging environment
2. Perform load testing
3. Set up monitoring and alerts
4. Create user documentation
5. Plan production deployment
