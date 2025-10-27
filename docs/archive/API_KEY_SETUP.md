# 🔐 API Key Authentication Setup

Sistem Rumah Plagiasi sekarang dilengkapi dengan API Key authentication untuk mengamankan Python API. API key diperlukan untuk semua request dari Next.js frontend ke Python backend.

⚡ **Created by devnolife**

---

## 🎯 Overview

### Architecture

```
┌─────────────────────────────┐
│  Next.js Frontend (Port 3000) │
│  PYTHON_API_KEY="apk_..."    │
└──────────────┬───────────────┘
               │
               │ HTTP Request
               │ Header: X-API-Key: apk_...
               ↓
┌──────────────────────────────┐
│  Python API (Port 8000)       │
│  API_KEY="apk_..."           │
│  ✓ Validates API Key         │
│  ✓ Returns 401 if missing    │
│  ✓ Returns 403 if invalid    │
└──────────────────────────────┘
```

### Security Benefits

✅ **Prevents Unauthorized Access** - Hanya client dengan API key valid yang bisa akses API  
✅ **Easy Rotation** - API key bisa di-generate ulang kapan saja  
✅ **Environment-Based** - Beda API key untuk dev/staging/production  
✅ **Audit Trail** - Track siapa yang akses API  

---

## 🚀 Quick Setup

### Step 1: Generate API Key

Jalankan generator script:

```bash
python generate_api_key.py
```

Output:
```
╔═══════════════════════════════════════════════════════════════════════╗
║                    🔐 API KEY GENERATOR 🔐                            ║
║                  Rumah Plagiasi                                 ║
╚═══════════════════════════════════════════════════════════════════════╝

⚡ Created by devnolife

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 Generated API Key:
   apk_XyZ123AbC456DeF789GhI012JkL345MnO678PqR901StU234

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Configuration Instructions:
...
```

### Step 2: Configure Python Backend

Edit `/workspaces/vision-computer/.env`:

```env
# API Security
API_KEY=apk_XyZ123AbC456DeF789GhI012JkL345MnO678PqR901StU234
```

### Step 3: Configure Next.js Frontend

Edit `/workspaces/vision-computer/frontend/.env`:

```env
# Python API
PYTHON_API_KEY=apk_XyZ123AbC456DeF789GhI012JkL345MnO678PqR901StU234
```

### Step 4: Restart Services

```bash
# Stop existing services
./stop_production.sh

# Start with new API key
./start_production.sh
```

---

## 🔧 How It Works

### Python Backend (FastAPI)

#### 1. Middleware Implementation

File: `app/middleware/api_key.py`

```python
class APIKeyMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exclude_paths: list = None):
        super().__init__(app)
        self.api_key = os.getenv("API_KEY")
        self.exclude_paths = exclude_paths or ["/", "/health", "/docs"]
    
    async def dispatch(self, request: Request, call_next):
        # Skip validation untuk public endpoints
        if request.url.path in self.exclude_paths:
            return await call_next(request)
        
        # Get API key dari header
        api_key_header = request.headers.get("X-API-Key")
        
        # Validate
        if not api_key_header:
            return JSONResponse(
                status_code=401,
                content={"error": "Missing API Key"}
            )
        
        if api_key_header != self.api_key:
            return JSONResponse(
                status_code=403,
                content={"error": "Invalid API Key"}
            )
        
        return await call_next(request)
```

#### 2. Integration in main.py

```python
from app.middleware import APIKeyMiddleware

app.add_middleware(
    APIKeyMiddleware,
    exclude_paths=["/", "/health", "/docs", "/openapi.json", "/redoc"]
)
```

### Next.js Frontend

#### Python Client Implementation

File: `frontend/lib/api/python-client.ts`

```typescript
class PythonAPIClient {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.PYTHON_API_KEY
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      },
    })
  }
}
```

Setiap request akan otomatis include API key di header.

---

## 📡 Public vs Protected Endpoints

### Public Endpoints (No API Key Required)

- `GET /` - API version info
- `GET /health` - Health check
- `GET /docs` - Swagger documentation
- `GET /redoc` - ReDoc documentation
- `GET /openapi.json` - OpenAPI schema

### Protected Endpoints (API Key Required)

- `POST /analyze/flags` - Analyze document for flags
- `POST /bypass/upload` - Perform bypass on document
- `POST /unified/process` - Unified analysis + bypass
- `POST /analyze/ocr-pdf` - OCR processing
- `GET /config/strategies` - Get available strategies
- All Celery task endpoints

---

## 🧪 Testing

### Test without API Key (Should Fail)

```bash
curl http://localhost:8000/analyze/flags -X POST
```

Response:
```json
{
  "success": false,
  "error": "Missing API Key",
  "message": "API key is required. Please provide 'X-API-Key' header."
}
```

### Test with Invalid API Key (Should Fail)

```bash
curl http://localhost:8000/analyze/flags \
  -X POST \
  -H "X-API-Key: invalid-key"
```

Response:
```json
{
  "success": false,
  "error": "Invalid API Key",
  "message": "The provided API key is invalid or has been revoked."
}
```

### Test with Valid API Key (Should Success)

```bash
curl http://localhost:8000/config/strategies \
  -X GET \
  -H "X-API-Key: apk_YourValidKeyHere"
```

Response:
```json
{
  "strategies": [...],
  "total": 5
}
```

---

## 🔄 API Key Rotation

### When to Rotate

- API key compromised or leaked
- Employee/developer offboarded
- Suspected unauthorized access
- Regular security audit (every 90 days)

### How to Rotate

1. **Generate new API key**
   ```bash
   python generate_api_key.py
   ```

2. **Update backend .env**
   ```env
   API_KEY=apk_NewKeyGenerated123
   ```

3. **Update frontend .env**
   ```env
   PYTHON_API_KEY=apk_NewKeyGenerated123
   ```

4. **Restart all services**
   ```bash
   ./restart_production.sh
   cd frontend && npm run dev
   ```

5. **Verify new key works**
   ```bash
   curl http://localhost:8000/config/strategies \
     -H "X-API-Key: apk_NewKeyGenerated123"
   ```

---

## 🚨 Security Best Practices

### ✅ DO

- ✅ Store API key in `.env` files (never in code)
- ✅ Add `.env` to `.gitignore`
- ✅ Use different API keys for dev/staging/prod
- ✅ Rotate API keys regularly (every 90 days)
- ✅ Use HTTPS in production
- ✅ Monitor API access logs
- ✅ Set up rate limiting (to be implemented)

### ❌ DON'T

- ❌ Commit `.env` files to Git
- ❌ Share API keys in Slack/Email/Chat
- ❌ Use same API key across environments
- ❌ Log API keys in application logs
- ❌ Expose API keys in client-side code
- ❌ Hard-code API keys in source code

---

## 🐛 Troubleshooting

### Frontend: "PYTHON_API_KEY not set" Warning

**Problem:** Warning di console browser

**Solution:**
```bash
cd frontend
cp .env.example .env
# Edit .env dan tambahkan PYTHON_API_KEY
```

### Backend: "API_KEY not set" Warning

**Problem:** Warning di Python logs

**Solution:**
```bash
cp .env.example .env
# Edit .env dan tambahkan API_KEY
```

### 401 Unauthorized Error

**Problem:** Request ditolak dengan "Missing API Key"

**Solution:**
- Pastikan `PYTHON_API_KEY` di-set di `frontend/.env`
- Restart Next.js dev server

### 403 Forbidden Error

**Problem:** Request ditolak dengan "Invalid API Key"

**Solution:**
- Verify API key sama di backend dan frontend
- Check typo atau extra spaces
- Regenerate API key jika perlu

### Health Check Endpoint Requires API Key

**Problem:** `/health` endpoint minta API key

**Solution:**
- Check `exclude_paths` di `app/main.py`
- Pastikan `/health` ada di exclude list

---

## 📊 Monitoring & Logging

### View API Key Validation Logs

```bash
tail -f logs/api.log | grep "API-Auth"
```

### Successful Requests

```
X-API-Auth: success
```

### Failed Requests

```
401 Unauthorized - Missing API Key
403 Forbidden - Invalid API Key
```

---

## 🔮 Future Enhancements

### Planned Features

- [ ] Multiple API keys untuk different clients
- [ ] API key expiration dates
- [ ] Rate limiting per API key
- [ ] API key usage analytics
- [ ] Admin dashboard untuk key management
- [ ] Webhook notifications on failed attempts
- [ ] IP whitelisting per API key
- [ ] Scoped permissions per API key

---

## 📚 API Reference

### Header Format

```
X-API-Key: apk_<48-character-random-string>
```

### Example Request (curl)

```bash
curl -X POST "http://localhost:8000/analyze/flags" \
  -H "X-API-Key: apk_YourApiKeyHere" \
  -F "file=@document.docx"
```

### Example Request (JavaScript)

```javascript
import axios from 'axios'

const response = await axios.post(
  'http://localhost:8000/analyze/flags',
  formData,
  {
    headers: {
      'X-API-Key': process.env.PYTHON_API_KEY
    }
  }
)
```

### Example Request (Python)

```python
import requests

headers = {
    'X-API-Key': os.getenv('API_KEY')
}

response = requests.post(
    'http://localhost:8000/analyze/flags',
    files={'file': open('document.docx', 'rb')},
    headers=headers
)
```

---

## 💡 Development Mode

### Disable API Key Validation

Untuk development, kamu bisa disable API key validation dengan **tidak** set `API_KEY` di backend `.env`:

```env
# API_KEY=  # Commented out or removed
```

⚠️ **Warning:** Semua requests akan diterima tanpa authentication!

### Enable Validation

Set `API_KEY` di `.env` untuk enable validation:

```env
API_KEY=apk_YourDevApiKey123
```

---

## 🎓 Summary

1. **Generate API key**: `python generate_api_key.py`
2. **Backend config**: Add `API_KEY` to `.env`
3. **Frontend config**: Add `PYTHON_API_KEY` to `frontend/.env`
4. **Restart services**: `./restart_production.sh`
5. **Test**: API requests now require `X-API-Key` header

---

⚡ **Made with ❤️ by devnolife**

Untuk pertanyaan atau issues, silakan contact administrator.
