# API Key Setup Guide 🔑

Panduan setup API key untuk komunikasi antara Frontend (Next.js) dan Backend (Python FastAPI).

---

## 🎯 Masalah yang Terjadi

Jika Anda mendapatkan error seperti ini:

```json
{
    "success": false,
    "error": "Missing API Key",
    "message": "API key is required. Please provide 'X-API-Key' header."
}
```

Ini berarti **API key tidak terkirim** atau **tidak match** antara frontend dan backend.

---

## ✅ Solusi: Setup API Key

### 1️⃣ Generate API Key (Jika Belum Ada)

```bash
# Option 1: Menggunakan Python
python3 -c "import secrets; print('apk_' + secrets.token_urlsafe(40))"

# Option 2: Menggunakan OpenSSL
echo "apk_$(openssl rand -base64 40 | tr -d '=' | tr '+/' '-_')"
```

Copy output API key yang dihasilkan, contoh:
```
apk_jkhXe9xwCH8UamKsrNnxZCqCki6JX6HzPkJQINGatwBdAKqe
```

---

### 2️⃣ Setup Backend (.env)

Buat atau edit file `backend/.env`:

```bash
cd backend
nano .env
```

Tambahkan:

```env
# API Key for authentication
# This MUST match PYTHON_API_KEY in frontend/.env
API_KEY=apk_jkhXe9xwCH8UamKsrNnxZCqCki6JX6HzPkJQINGatwBdAKqe

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

**⚠️ PENTING**: API key di backend menggunakan variable `API_KEY`

---

### 3️⃣ Setup Frontend (.env)

Edit file `frontend/.env`:

```bash
cd frontend
nano .env
```

Pastikan ada:

```env
# Python Backend API
PYTHON_API_URL="http://localhost:8000"
PYTHON_API_KEY=apk_jkhXe9xwCH8UamKsrNnxZCqCki6JX6HzPkJQINGatwBdAKqe
PYTHON_API_TIMEOUT="300000"
```

**⚠️ PENTING**:
- API key di frontend menggunakan variable `PYTHON_API_KEY`
- **Value harus SAMA** dengan `API_KEY` di backend
- Jangan ada `NEXT_PUBLIC_` prefix (ini server-side only)

---

### 4️⃣ Restart Services

**Backend:**
```bash
# Stop backend jika running (Ctrl+C)
# Restart:
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
# Stop frontend jika running (Ctrl+C)
# Restart:
cd frontend
npm run dev
```

**⚠️ PENTING**: **HARUS restart** agar environment variables terbaca!

---

## 🧪 Testing

### Test 1: Check Environment Variables

**Backend:**
```bash
cd backend
source venv/bin/activate
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print('API_KEY:', os.getenv('API_KEY')[:20] + '...' if os.getenv('API_KEY') else 'NOT SET')"
```

**Expected Output:**
```
API_KEY: apk_jkhXe9xwCH8Uam...
```

### Test 2: Test Backend API Key

```bash
# Without API key (should fail)
curl http://localhost:8000/jobs/test-job/status

# Expected:
# {"success":false,"error":"Missing API Key"...}

# With API key (should work or return job not found)
curl -H "X-API-Key: apk_jkhXe9xwCH8UamKsrNnxZCqCki6JX6HzPkJQINGatwBdAKqe" \
  http://localhost:8000/jobs/test-job/status

# Expected:
# {"success":false,...} or valid response if job exists
```

### Test 3: Test Full Flow

1. Login ke frontend: http://localhost:3000
2. Upload document dengan PDF Turnitin
3. Klik "Proses Dokumen"
4. **Progress bar harus muncul dan ter-update**
5. Check browser console (F12) untuk errors

---

## 🔍 Debugging

### Check Logs

**Browser Console (F12):**
```javascript
// Should NOT see:
[API_KEY_ERROR] PYTHON_API_KEY is not set

[BACKEND_ERROR] {
  "error": "Missing API Key"
}
```

**Backend Terminal:**
```python
# Should NOT see:
⚠️  WARNING: API_KEY not set in environment variables!

# Should see on startup:
INFO:     Application startup complete.
```

### Verify API Key Match

```bash
# Frontend
cd frontend
grep PYTHON_API_KEY .env

# Backend
cd backend
grep API_KEY .env

# Compare outputs - they MUST match!
```

---

## 📋 Checklist

Before testing the application:

- [ ] Backend `.env` exists with `API_KEY` set
- [ ] Frontend `.env` exists with `PYTHON_API_KEY` set
- [ ] Both API keys have the **exact same value**
- [ ] Backend service restarted (to load new .env)
- [ ] Frontend service restarted (to load new .env)
- [ ] Redis is running
- [ ] Celery worker is running
- [ ] `curl` test with API key works

---

## 🎯 Quick Fix Summary

```bash
# 1. Generate API key
API_KEY=$(python3 -c "import secrets; print('apk_' + secrets.token_urlsafe(40))")
echo "Generated API Key: $API_KEY"

# 2. Add to backend/.env
cd backend
echo "API_KEY=$API_KEY" >> .env

# 3. Add to frontend/.env
cd ../frontend
echo "PYTHON_API_KEY=$API_KEY" >> .env

# 4. Restart both services
# Backend: Ctrl+C → uvicorn app.main:app --reload
# Frontend: Ctrl+C → npm run dev
```

---

## Common Errors

### Error: "Missing API Key"

**Cause**: Frontend tidak mengirim `X-API-Key` header atau backend tidak bisa membaca `API_KEY` dari .env

**Solution**:
1. Pastikan `backend/.env` ada dan berisi `API_KEY`
2. Pastikan `frontend/.env` ada dan berisi `PYTHON_API_KEY`
3. Restart kedua services

### Error: "Invalid API Key"

**Cause**: API key tidak match antara frontend dan backend

**Solution**:
1. Compare API keys: `grep API_KEY backend/.env` vs `grep PYTHON_API_KEY frontend/.env`
2. Pastikan value-nya **exact match** (case-sensitive)
3. Restart kedua services

### Progress Not Updating

**Cause**: API key error menyebabkan request ke backend gagal

**Solution**:
1. Fix API key setup (steps above)
2. Check browser console for error messages
3. Verify `redis-cli ping` returns PONG
4. Restart all services

---

## 🔐 Security Notes

1. **Never commit** `.env` files to git
2. **Use different** API keys for development and production
3. **Rotate** API keys regularly in production
4. **Use HTTPS** in production to encrypt API key in transit
5. Add `.env` to `.gitignore` (already done)

---

## 📚 Related Documentation

- [QUICK_START.md](QUICK_START.md) - Getting started guide
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Performance tips

---

**Last Updated:** 2025-01-01
**Issue:** Frontend → Backend communication API key mismatch
**Solution:** Ensure API_KEY (backend) = PYTHON_API_KEY (frontend)
