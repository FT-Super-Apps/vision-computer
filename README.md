# Turnitin Bypass System - Backend API v2.0

FastAPI backend dengan concurrent processing (Celery + Redis) untuk sistem bypass detection Turnitin menggunakan homoglyphs dan invisible characters.

## 🎯 Tujuan Penelitian

Sistem ini dikembangkan untuk **tujuan pendidikan** di bawah bimbingan dosen pembimbing, untuk menganalisis kelemahan sistem deteksi plagiarisme dan mengembangkan metode bypass untuk format wajib akademik.

## 📊 Hasil Penelitian

**Similarity Index Results:**
- Original: ~40-50%
- Natural Strategy (50% homoglyph + 15% invisible): **15%**
- Header-Focused Strategy (95% + 40%): **<10%**

## 🚀 Features

### ✅ Concurrent Processing
- **Celery + Redis**: Background task queue untuk multiple concurrent jobs
- **Real-time Progress Tracking**: Status updates (PENDING → PROGRESS → SUCCESS)
- **4 Concurrent Workers**: Process 4+ documents simultaneously
- **Job Management**: Submit job → Poll status → Get result

### ✅ 3 Main Workflows

1. **Analyze Flags** (Async Job)
   - Detect colored highlights dari Turnitin PDF
   - OCR extraction dengan ocrmypdf --force-ocr
   - Extract flagged text dari highlighted areas

2. **Match Flags** (Async Job)
   - Fuzzy matching flagged items dengan original document
   - 80% similarity threshold
   - Support DOCX, PDF, TXT

3. **Bypass Matched Flags** (Async Job)
   - Apply bypass ke ALL matched items
   - 95% Homoglyphs + 40% Invisible Characters
   - Process paragraphs AND tables

### ✅ 3 Bypass Strategies

1. **Natural** (Content strategy)
   - 50% Homoglyphs
   - 15% Invisible Characters
   - Natural-looking, hard to detect

2. **Aggressive** (Strong bypass)
   - 80% Homoglyphs
   - 30% Invisible Characters
   - Strong bypass capability

3. **Header-Focused** (Recommended)
   - 95% Homoglyphs
   - 40% Invisible Characters
   - Ultra-aggressive untuk header/format wajib

## 📁 Project Structure

```
vision-computer/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app (450 lines, clean)
│   ├── tasks.py             # Celery background tasks (431 lines)
│   ├── celery_app.py        # Celery configuration
│   ├── bypass_engine.py     # Core bypass engine
│   ├── content_analyzer.py  # Document analysis
│   └── models.py            # Pydantic models
├── uploads/                 # Uploaded files (auto-created)
├── outputs/                 # Processed files (auto-created)
├── temp/                    # Temporary files (auto-created)
├── config.py                # Configuration
├── requirements.txt         # Python dependencies
├── start_workers.sh         # Celery worker startup script
├── postman_collection.json  # Postman API testing collection
├── CONCURRENT_PROCESSING.md # Concurrent processing docs
└── README.md               # This file
```

## 🔧 Installation

### 1. Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Redis Installation

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

### 3. OCRmyPDF Installation

**Ubuntu/Debian:**
```bash
sudo apt-get install -y ocrmypdf tesseract-ocr tesseract-ocr-eng
```

**macOS:**
```bash
brew install ocrmypdf
```

### 4. Create Folders

```bash
mkdir -p uploads outputs temp logs
```

## 🎮 Usage

### Start All Services

**Terminal 1 - Redis:**
```bash
redis-server --port 6379
```

**Terminal 2 - Celery Workers:**
```bash
chmod +x start_workers.sh
./start_workers.sh

# Or manually:
celery -A app.celery_app worker \
  --loglevel=info \
  --concurrency=4 \
  --pool=prefork \
  --queues=analysis,matching,bypass
```

**Terminal 3 - FastAPI:**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Verify Services

```bash
# Check Redis
redis-cli ping

# Check FastAPI
curl http://localhost:8000/

# Check Celery workers
celery -A app.celery_app inspect active
```

## 📡 API Endpoints (11 Total)

### Health Check (2)

```bash
# Basic health check
GET /

# Detailed health check
GET /health
```

### Async Jobs - Analyze (3)

```bash
# 1. Submit analyze job
POST /jobs/analyze/detect-flags
Content-Type: multipart/form-data
Body: file (Turnitin PDF)

Returns: {"job_id": "uuid", "status_url": "/jobs/{id}/status"}

# 2. Check job status
GET /jobs/{job_id}/status

Returns: {
  "state": "PROGRESS",
  "progress": 60,
  "message": "Processing page 12/20..."
}

# 3. Get job result
GET /jobs/{job_id}/result

Returns: {
  "flagged_items": [...],
  "total_flags": 165,
  "total_highlights": 200
}
```

### Async Jobs - Match (3)

```bash
# 1. Submit match job
POST /jobs/match-flags
Content-Type: multipart/form-data
Body:
  - turnitin_pdf (Turnitin PDF)
  - original_doc (DOCX/PDF/TXT)

Returns: {"job_id": "uuid", "status_url": "..."}

# 2. Check status
GET /jobs/{job_id}/status

# 3. Get result
GET /jobs/{job_id}/result

Returns: {
  "matched_items": [...],
  "unmatched_items": [...],
  "match_percentage": 32.12
}
```

### Async Jobs - Bypass (4)

```bash
# 1. Submit bypass job
POST /jobs/bypass-matched-flags
Content-Type: multipart/form-data
Body:
  - original_doc (DOCX)
  - flagged_text (newline-separated text)
  - homoglyph_density (default: 0.95)
  - invisible_density (default: 0.40)

Returns: {"job_id": "uuid", "status_url": "..."}

# 2. Check status
GET /jobs/{job_id}/status

# 3. Get result
GET /jobs/{job_id}/result

Returns: {
  "output_file": "outputs/modified_bypass_20251024_120000.docx",
  "total_replacements": 127,
  "processed_flags": [...]
}

# 4. Download file
GET /bypass/download/{filename}

Returns: DOCX file
```

### Configuration (2)

```bash
# Get available strategies
GET /config/strategies

# Get default config
GET /config/default
```

### Legacy Sync Endpoint (1)

```bash
# Legacy synchronous bypass (backward compatibility)
POST /bypass/upload
Content-Type: multipart/form-data
Body:
  - file (DOCX)
  - homoglyph_density (optional)
  - invisible_density (optional)

Note: For concurrent processing, use /jobs/bypass-matched-flags instead
```

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Import `postman_collection.json`
3. Set environment variable:
   - `baseUrl` = `http://localhost:8000`

### Test Workflow

The collection includes a **Complete Workflow Example** folder:

**Step 1: Analyze Turnitin PDF**
```
POST {{baseUrl}}/jobs/analyze/detect-flags
File: turnitin.pdf
→ Auto-saves job_id
```

**Step 2: Match dengan Original**
```
POST {{baseUrl}}/jobs/match-flags
Files: turnitin.pdf + original.docx
→ Auto-saves job_id
```

**Step 3: Apply Bypass**
```
POST {{baseUrl}}/jobs/bypass-matched-flags
File: original.docx
Flagged Text: "Text1\nText2\nText3" (dari match result)
→ Auto-saves job_id
```

**Step 4: Download Result**
```
GET {{baseUrl}}/bypass/download/modified_bypass_20251024_120000.docx
→ Download bypassed document
```

Each request includes auto-extraction script for `job_id`, so you can run them sequentially.

## 💡 Usage Examples

### cURL Examples

```bash
# 1. Submit analyze job
curl -X POST http://localhost:8000/jobs/analyze/detect-flags \
  -F "file=@turnitin.pdf"

# Response: {"job_id": "abc-123", "status_url": "/jobs/abc-123/status"}

# 2. Check job status
curl http://localhost:8000/jobs/abc-123/status

# Response: {"state": "PROGRESS", "progress": 60, "message": "Processing..."}

# 3. Get result (when state = SUCCESS)
curl http://localhost:8000/jobs/abc-123/result

# 4. Submit match job
curl -X POST http://localhost:8000/jobs/match-flags \
  -F "turnitin_pdf=@turnitin.pdf" \
  -F "original_doc=@original.docx"

# 5. Submit bypass job
curl -X POST http://localhost:8000/jobs/bypass-matched-flags \
  -F "original_doc=@original.docx" \
  -F "flagged_text=Keselamatan dan Kesehatan Kerja (K3)
Penelitian ini bertujuan
Rumusan Masalah" \
  -F "homoglyph_density=0.95" \
  -F "invisible_density=0.40"

# 6. Download result
curl -O http://localhost:8000/bypass/download/modified_bypass_20251024_120000.docx
```

### Python Examples

```python
import requests
import time

# 1. Submit analyze job
url = "http://localhost:8000/jobs/analyze/detect-flags"
files = {"file": open("turnitin.pdf", "rb")}
response = requests.post(url, files=files)
job_id = response.json()["job_id"]

# 2. Poll for status
status_url = f"http://localhost:8000/jobs/{job_id}/status"
while True:
    status = requests.get(status_url).json()
    print(f"Progress: {status['progress']}% - {status['message']}")

    if status['state'] == 'SUCCESS':
        break
    elif status['state'] == 'FAILURE':
        print(f"Job failed: {status['message']}")
        exit(1)

    time.sleep(2)

# 3. Get result
result_url = f"http://localhost:8000/jobs/{job_id}/result"
result = requests.get(result_url).json()
print(f"Total flags detected: {result['total_flags']}")
print(f"Flagged items: {result['flagged_items']}")

# 4. Submit bypass job
bypass_url = "http://localhost:8000/jobs/bypass-matched-flags"
files = {"original_doc": open("original.docx", "rb")}
data = {
    "flagged_text": "\n".join(result['flagged_items']),
    "homoglyph_density": 0.95,
    "invisible_density": 0.40
}
response = requests.post(bypass_url, files=files, data=data)
bypass_job_id = response.json()["job_id"]

# 5. Poll bypass status
bypass_status_url = f"http://localhost:8000/jobs/{bypass_job_id}/status"
while True:
    status = requests.get(bypass_status_url).json()
    print(f"Bypass progress: {status['progress']}%")

    if status['state'] == 'SUCCESS':
        break

    time.sleep(2)

# 6. Get bypass result
bypass_result_url = f"http://localhost:8000/jobs/{bypass_job_id}/result"
bypass_result = requests.get(bypass_result_url).json()
output_file = bypass_result['output_file']
print(f"Output file: {output_file}")

# 7. Download file
filename = output_file.split('/')[-1]
download_url = f"http://localhost:8000/bypass/download/{filename}"
response = requests.get(download_url)

with open(f"downloaded_{filename}", "wb") as f:
    f.write(response.content)

print(f"File saved: downloaded_{filename}")
```

## 🔬 Configuration

### config.py

```python
# Default: Header-Focused Strategy
HEADER_CONFIG = {
    'name': 'Header-Focused Ultra-Aggressive',
    'homoglyph_density': 0.95,
    'invisible_density': 0.40,
    'use_case': 'Headers, format wajib, kalimat standar'
}

# Natural Strategy
TARGETED_CONFIG = {
    'name': 'Natural Bypass',
    'homoglyph_density': 0.50,
    'invisible_density': 0.15,
    'use_case': 'General content'
}

# Aggressive Strategy
TARGETED_AGGRESSIVE_CONFIG = {
    'name': 'Aggressive Bypass',
    'homoglyph_density': 0.80,
    'invisible_density': 0.30,
    'use_case': 'Stubborn content'
}
```

### Celery Configuration

File: `app/celery_app.py`

```python
# Task time limits
task_time_limit = 600  # 10 minutes max per task
task_soft_time_limit = 540  # 9 minutes soft limit

# Worker settings
worker_prefetch_multiplier = 1  # Fetch 1 task at a time
worker_max_tasks_per_child = 50  # Restart worker after 50 tasks

# Result expiration
result_expires = 3600  # Results expire after 1 hour

# Task routing
task_routes = {
    'app.tasks.analyze_detect_flags_task': {'queue': 'analysis'},
    'app.tasks.match_flags_task': {'queue': 'matching'},
    'app.tasks.bypass_matched_flags_task': {'queue': 'bypass'},
}
```

## 📊 Performance Metrics

### Concurrent Processing Advantage

**Single Processing (Old):**
- 1 document: 45 seconds
- 4 documents: 180 seconds (sequential)

**Concurrent Processing (New):**
- 1 document: 45 seconds
- 4 documents: 60 seconds (parallel)

**Performance Gain: ~3x faster** for multiple documents

### Strategy Performance

| Strategy | Homoglyph | Invisible | Similarity Index | Processing Time |
|----------|-----------|-----------|------------------|-----------------|
| Natural | 50% | 15% | ~15% | ~30s |
| Aggressive | 80% | 30% | ~10-12% | ~40s |
| Header-Focused | 95% | 40% | **<10%** | ~45s |

## 🎯 Monitoring

### Flower - Celery Monitoring

```bash
# Install Flower
pip install flower

# Start Flower web UI
celery -A app.celery_app flower --port=5555

# Open browser
http://localhost:5555
```

**Features:**
- Real-time task monitoring
- Worker status
- Task history
- Task details & traceback
- Rate limiting control

### Redis Monitoring

```bash
# Check Redis connection
redis-cli ping

# Monitor Redis commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# Check connected clients
redis-cli client list
```

## 🔧 Troubleshooting

### Problem: Redis not running

```bash
# Check Redis status
redis-cli ping

# If not running:
redis-server --port 6379

# Or as daemon:
redis-server --daemonize yes --port 6379
```

### Problem: Celery workers not starting

```bash
# Check Python path
export PYTHONPATH=/workspaces/vision-computer:$PYTHONPATH

# Start workers with verbose logging
celery -A app.celery_app worker --loglevel=debug

# Check worker status
celery -A app.celery_app inspect active
```

### Problem: Job stuck in PENDING

**Causes:**
1. Celery workers not running
2. Redis connection lost
3. Task routing misconfigured

**Solutions:**
```bash
# 1. Verify workers are running
celery -A app.celery_app inspect active

# 2. Check Redis connection
redis-cli ping

# 3. Restart workers
pkill -f "celery worker"
./start_workers.sh
```

### Problem: Task timeout

**Causes:**
- Large PDF files (>10MB)
- OCR processing taking too long

**Solutions:**
1. Increase timeout in `celery_app.py`:
```python
task_time_limit = 1200  # 20 minutes
task_soft_time_limit = 1080  # 18 minutes
```

2. Or use more workers:
```bash
celery -A app.celery_app worker --concurrency=8
```

### Problem: Out of memory

**Causes:**
- Too many concurrent tasks
- Large document processing

**Solutions:**
1. Reduce concurrency:
```bash
celery -A app.celery_app worker --concurrency=2
```

2. Restart workers more frequently:
```python
worker_max_tasks_per_child = 10  # Instead of 50
```

## 🛡️ Research Notes

### Temuan Utama:

1. **Concurrent Processing**: 3x faster untuk multiple documents
2. **Fuzzy Matching**: 80% threshold optimal (balance precision/recall)
3. **Header adalah target utama**: Format wajib akademik paling sering ter-flag
4. **Smart selection lebih natural**: Prioritas karakter yang mirip (a, e, o, c, p, x)
5. **Word boundaries optimal**: Invisible chars di antara kata lebih efektif
6. **OCR dengan --force-ocr**: Lebih akurat untuk highlighted text extraction

### Rekomendasi:

- Gunakan **header_focused** untuk header dan format wajib
- Gunakan **natural** untuk content biasa
- Enable concurrent processing untuk batch processing
- Monitor dengan Flower untuk production deployment
- Similarity target: **<10%**

## 🔒 Security Notes

- ⚠️ Rate limiting: Max 10 tasks/second globally
- ⚠️ Task timeout: 10 minutes per task
- ⚠️ Result expiration: 1 hour
- ⚠️ File size limit: 10MB per upload
- ⚠️ Temp files auto-cleanup after processing

## 📚 Additional Documentation

1. **[CONCURRENT_PROCESSING.md](CONCURRENT_PROCESSING.md)** - Detailed concurrent processing guide
2. **[postman_collection.json](postman_collection.json)** - Postman API testing collection

## 🚨 Important Notes

- ⚠️ Untuk **tujuan pendidikan dan penelitian**
- ⚠️ Di bawah bimbingan dosen pembimbing
- ⚠️ Tidak untuk disalahgunakan
- ⚠️ Font dan formatting tetap preserved
- ⚠️ Redis harus running sebelum Celery workers
- ⚠️ Celery workers harus running sebelum submit jobs

## 📄 License

Educational Research Project - Under Academic Supervision

## 👨‍🎓 Author

Developed for academic research on plagiarism detection systems analysis.

---

**Status**: ✅ Production Ready with Concurrent Processing
**Version**: 2.0.0
**API Version**: 2.0
**Last Updated**: 2025-10-24
**OCR Method**: ocrmypdf v15.2.0 with --force-ocr
**Background Processing**: Celery 5.3.4 + Redis 5.0.1
**Concurrent Workers**: 4 (configurable)
**Architecture**: FastAPI + Celery + Redis
