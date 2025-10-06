# Turnitin Bypass API

FastAPI backend untuk sistem bypass Turnitin dengan paraphrase cerdas menggunakan IndoT5 AI model.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install System Dependencies

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-ind tesseract-ocr-eng ocrmypdf

# Verify installation
tesseract --version
ocrmypdf --version
```

### 3. Run API Server

```bash
cd /workspaces/vision-computer
python api/main.py
```

Server akan berjalan di: `http://localhost:8000`

API Docs (Swagger): `http://localhost:8000/docs`

## 📡 API Endpoints

### 1. Create Processing Job

**POST** `/api/v1/process`

Upload PDF Turnitin + DOCX original untuk diproses.

**Request:**
- `pdf_file`: Turnitin PDF report (multipart/form-data)
- `docx_file`: Original DOCX document (multipart/form-data)

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Job created successfully. Processing started."
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/process" \
  -F "pdf_file=@testing.pdf" \
  -F "docx_file=@testing.docx"
```

### 2. Check Job Status

**GET** `/api/v1/status/{job_id}`

Cek status dan progress processing.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "stage": "paraphrasing",
  "progress": 60,
  "message": null,
  "error": null,
  "result": null
}
```

**Status Values:**
- `pending`: Job baru dibuat
- `processing`: Sedang diproses
- `completed`: Selesai
- `failed`: Gagal

**Stage Values:**
- `uploading` → `ocr` → `extracting` → `matching` → `paraphrasing` → `applying` → `done`

### 3. Get Job Result

**GET** `/api/v1/result/{job_id}`

Dapatkan summary hasil processing (setelah completed).

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "stats": {
    "flagged_texts_found": 49,
    "matched_texts": 44,
    "paraphrased_texts": 44,
    "applied_texts": 43,
    "processing_time_seconds": 187.5
  },
  "output_file": "550e8400-e29b-41d4-a716-446655440000_bypassed.docx",
  "download_url": "/api/v1/download/550e8400-e29b-41d4-a716-446655440000"
}
```

### 4. Download Bypassed DOCX

**GET** `/api/v1/download/{job_id}`

Download file DOCX yang sudah di-bypass.

**Response:**
File download dengan nama `bypassed_{original_filename}.docx`

**cURL Example:**
```bash
curl -o bypassed.docx "http://localhost:8000/api/v1/download/550e8400-e29b-41d4-a716-446655440000"
```

### 5. Download Intermediate JSON

**GET** `/api/v1/download/{job_id}/json/{file_type}`

Download file JSON intermediate untuk debugging.

**Parameters:**
- `file_type`: `flagged`, `matches`, atau `paraphrased`

**Examples:**
```bash
# Flagged texts (hasil extraction)
curl -o flagged.json "http://localhost:8000/api/v1/download/{job_id}/json/flagged"

# Matches (hasil matching dengan DOCX)
curl -o matches.json "http://localhost:8000/api/v1/download/{job_id}/json/matches"

# Paraphrased (hasil paraphrase)
curl -o paraphrased.json "http://localhost:8000/api/v1/download/{job_id}/json/paraphrased"
```

### 6. Delete Job

**DELETE** `/api/v1/job/{job_id}`

Hapus job dan semua file terkait.

**Response:**
```json
{
  "message": "Job deleted successfully"
}
```

### 7. List All Jobs

**GET** `/api/v1/jobs`

List semua jobs (admin endpoint).

**Response:**
```json
{
  "total": 5,
  "jobs": [
    {
      "job_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "stage": "done",
      "progress": 100,
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

### 8. Health Check

**GET** `/`

Check API status.

**Response:**
```json
{
  "status": "ok",
  "service": "Turnitin Bypass API",
  "version": "1.0.0",
  "active_jobs": 2,
  "max_concurrent": 3
}
```

## 🔄 Complete Workflow Example

### Using cURL:

```bash
# 1. Upload files dan create job
RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/process" \
  -F "pdf_file=@testing.pdf" \
  -F "docx_file=@testing.docx")

# Extract job_id
JOB_ID=$(echo $RESPONSE | jq -r '.job_id')
echo "Job ID: $JOB_ID"

# 2. Poll status sampai completed
while true; do
  STATUS=$(curl -s "http://localhost:8000/api/v1/status/$JOB_ID")
  CURRENT_STATUS=$(echo $STATUS | jq -r '.status')
  PROGRESS=$(echo $STATUS | jq -r '.progress')
  STAGE=$(echo $STATUS | jq -r '.stage')
  
  echo "Status: $CURRENT_STATUS | Stage: $STAGE | Progress: $PROGRESS%"
  
  if [ "$CURRENT_STATUS" = "completed" ] || [ "$CURRENT_STATUS" = "failed" ]; then
    break
  fi
  
  sleep 5
done

# 3. Download result
if [ "$CURRENT_STATUS" = "completed" ]; then
  curl -o bypassed_output.docx "http://localhost:8000/api/v1/download/$JOB_ID"
  echo "Downloaded: bypassed_output.docx"
fi
```

### Using Python:

```python
import requests
import time

# 1. Upload files
with open('testing.pdf', 'rb') as pdf, open('testing.docx', 'rb') as docx:
    files = {
        'pdf_file': pdf,
        'docx_file': docx
    }
    response = requests.post('http://localhost:8000/api/v1/process', files=files)
    job_id = response.json()['job_id']
    print(f"Job ID: {job_id}")

# 2. Poll status
while True:
    status = requests.get(f'http://localhost:8000/api/v1/status/{job_id}').json()
    print(f"Status: {status['status']} | Stage: {status['stage']} | Progress: {status['progress']}%")
    
    if status['status'] in ['completed', 'failed']:
        break
    
    time.sleep(5)

# 3. Download result
if status['status'] == 'completed':
    response = requests.get(f'http://localhost:8000/api/v1/download/{job_id}')
    with open('bypassed_output.docx', 'wb') as f:
        f.write(response.content)
    print("Downloaded: bypassed_output.docx")
```

## ⚙️ Configuration

### Concurrent Processing Limit

Edit di `api/main.py`:

```python
MAX_CONCURRENT_JOBS = 3  # Default: 3 concurrent jobs
```

### File Retention

Files automatically cleaned up after 24 hours. Edit di `api/main.py`:

```python
cutoff_time = datetime.now() - timedelta(hours=24)  # Default: 24 hours
```

## 🏗️ Architecture

```
/workspaces/vision-computer/
├── api/
│   ├── main.py           # FastAPI application
│   ├── uploads/          # User uploads (auto-cleaned)
│   ├── outputs/          # Generated DOCX files
│   └── temp/             # Intermediate JSON files
├── core/
│   ├── extractor.py      # PDF OCR + color detection
│   ├── matcher.py        # Match with DOCX
│   ├── paraphraser.py    # IndoT5 AI paraphrase
│   ├── applier.py        # Apply to DOCX
│   └── models.py         # Pydantic models
└── requirements.txt
```

## 🧠 Processing Pipeline

1. **Upload** (`uploading`): Save PDF + DOCX
2. **OCR** (`ocr`): Force OCR on PDF with ocrmypdf
3. **Extract** (`extracting`): Detect colored regions, extract text
4. **Match** (`matching`): Match flagged texts with DOCX paragraphs
5. **Paraphrase** (`paraphrasing`):
   - Short texts (≤5 words): Invisible characters
   - Long texts (>5 words): IndoT5 AI paraphrase
6. **Apply** (`applying`): Replace original text in DOCX
7. **Done** (`done`): Generate output file

## 🔒 Security Notes

**Current Implementation:**
- No authentication (open API)
- No rate limiting
- In-memory job storage (lost on restart)

**Production Recommendations:**
- Add JWT/API key authentication
- Implement rate limiting (per IP/user)
- Use Redis for job storage
- Add input validation (file size limits, content scanning)
- Use HTTPS
- Add CORS restrictions

## 📊 Performance

**Single Job (40-50 pages PDF):**
- OCR: ~30 seconds
- Extract: ~5 seconds
- Match: ~1 second
- Paraphrase: ~2 minutes (33 texts with IndoT5)
- Apply: ~1 second
- **Total: ~3-4 minutes**

**Concurrent Processing:**
- Max 3 jobs simultaneously (configurable)
- Additional jobs queued automatically
- Each job uses ~2GB RAM (IndoT5 model)

## 🐛 Troubleshooting

### Error: "ocrmypdf: command not found"

```bash
sudo apt-get install ocrmypdf
```

### Error: "Tesseract not found"

```bash
sudo apt-get install tesseract-ocr tesseract-ocr-ind tesseract-ocr-eng
```

### Model Download Timeout

IndoT5 model (~900MB) will be downloaded on first use. Ensure stable internet connection.

### Port 8000 Already in Use

```bash
# Change port in api/main.py
uvicorn.run("main:app", host="0.0.0.0", port=8001)
```

## 📝 License

Internal tool for educational purposes.

## 🤝 Support

For issues or questions, check:
- API Docs: `http://localhost:8000/docs`
- Logs: Terminal output dari `python api/main.py`
