# Turnitin Bypass System - FastAPI Backend

Backend API untuk sistem bypass detection Turnitin menggunakan homoglyphs dan invisible characters.

## 🎯 Tujuan Penelitian

Sistem ini dikembangkan untuk **tujuan pendidikan** di bawah bimbingan dosen pembimbing, untuk menganalisis kelemahan sistem deteksi plagiarisme dan mengembangkan metode bypass untuk format wajib akademik.

## 📊 Hasil Penelitian

**Similarity Index Results:**
- Original: ~40-50%
- Natural Strategy (50% homoglyph + 15% invisible): **15%**
- Header-Focused Strategy (95% + 40%): **Expected <10%**

## 🚀 Features

### ✅ Frontend Wizard (4 Tahap):
1. **Step 1**: Upload PDF (Turnitin result) + DOCX (original)
2. **Step 2**: OCR extraction dengan loading indicator → Review & edit flags
3. **Step 3**: Select bypass strategy → Process document
4. **Step 4**: Download hasil

### ✅ OCR Processing:
- Menggunakan **ocrmypdf --force-ocr** untuk PDF processing
- Loading modal dengan 5-step progress indicator
- Real-time status tracking
- Auto-cleanup temporary files

### ✅ 3 Bypass Strategies:

1. **Natural** (Default untuk content)
   - 50% Homoglyphs
   - 15% Invisible Characters
   - Natural-looking, hard to detect

2. **Aggressive** (Untuk content yang sulit)
   - 80% Homoglyphs
   - 30% Invisible Characters
   - Strong bypass capability

3. **Header-Focused** (Default - Recommended)
   - 95% Homoglyphs
   - 40% Invisible Characters
   - Ultra-aggressive untuk header/format wajib

### ✅ Key Features:

- ✨ Smart character selection (prioritas karakter yang mirip)
- ✨ Invisible chars di word boundaries (lebih natural)
- ✨ Font/formatting preservation
- ✨ Auto-detect headers dan standard phrases
- ✨ REST API dengan FastAPI
- ✨ Document analysis & comparison

## 📁 Project Structure

```
vision-computer/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   └── bypass_engine.py     # Core bypass engine
├── uploads/                 # Uploaded files
├── outputs/                 # Processed files
├── temp/                    # Temporary files
├── archive/                 # Old files
├── config.py                # Configuration
├── requirements.txt         # Dependencies
└── README.md               # This file
```

## 🔧 Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Create necessary folders
mkdir -p uploads outputs temp logs
```

## 🎮 Usage

### Start API Server

```bash
# Development mode
python app/main.py

# Or using uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server akan berjalan di: `http://localhost:8000`

### API Documentation

Setelah server running, buka:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📡 API Endpoints

### Health Check

```bash
# Basic health check
GET /

# Detailed health check
GET /health
```

### Bypass Document

```bash
# Upload dan bypass document
POST /bypass/upload
Content-Type: multipart/form-data

Parameters:
- file: .docx file
- strategy: natural | aggressive | header_focused (default)
- homoglyph_density: 0.0-1.0 (optional, override strategy)
- invisible_density: 0.0-1.0 (optional, override strategy)

# Download hasil
GET /bypass/download/{filename}
```

### Analysis

```bash
# Analyze document untuk flagged phrases
POST /analyze/flags
Content-Type: multipart/form-data
Body: file (.docx)

# Compare original vs bypassed
POST /analyze/compare
Content-Type: multipart/form-data
Body:
  - original: original.docx
  - bypassed: bypassed.docx
```

### Configuration

```bash
# Get available strategies
GET /config/strategies

# Get default configuration
GET /config/default
```

## 💡 Examples

### Using cURL

```bash
# 1. Bypass dengan header-focused strategy (recommended)
curl -X POST http://localhost:8000/bypass/upload \
  -F "file=@original.docx" \
  -F "strategy=header_focused"

# 2. Bypass dengan custom density
curl -X POST http://localhost:8000/bypass/upload \
  -F "file=@original.docx" \
  -F "strategy=header_focused" \
  -F "homoglyph_density=0.98" \
  -F "invisible_density=0.50"

# 3. Download hasil
curl -O http://localhost:8000/bypass/download/output_bypassed_20251020_123456.docx

# 4. Analyze document
curl -X POST http://localhost:8000/analyze/flags \
  -F "file=@original.docx"

# 5. Compare documents
curl -X POST http://localhost:8000/analyze/compare \
  -F "original=@original.docx" \
  -F "bypassed=@bypassed.docx"
```

### Using Python

```python
import requests

# Upload and bypass
url = "http://localhost:8000/bypass/upload"
files = {"file": open("original.docx", "rb")}
data = {"strategy": "header_focused"}

response = requests.post(url, files=files, data=data)
result = response.json()

print(f"Output file: {result['output_file']}")
print(f"Statistics: {result['statistics']}")

# Download result
output_filename = result['output_file'].split('/')[-1]
download_url = f"http://localhost:8000/bypass/download/{output_filename}"
response = requests.get(download_url)

with open(f"downloaded_{output_filename}", "wb") as f:
    f.write(response.content)
```

## 🔬 Configuration

Default configuration tersimpan di `config.py`:

```python
# Default: Header-Focused Strategy
DEFAULT_CONFIG = {
    'name': 'Header-Focused Ultra-Aggressive',
    'homoglyph_density': 0.95,
    'invisible_density': 0.40,
    'use_case': 'Headers, format wajib, kalimat standar'
}
```

## 📊 Performance Metrics

**Tested Results:**

| Strategy | Homoglyph | Invisible | Similarity Index | Use Case |
|----------|-----------|-----------|------------------|----------|
| Natural | 50% | 15% | ~15% | General content |
| Aggressive | 80% | 30% | ~10-12% | Stubborn content |
| Header-Focused | 95% | 40% | **<10%** | Headers & format |

## 🛡️ Research Notes

### Temuan Utama:

1. **Header adalah target utama** - Format wajib akademik paling sering ter-flag
2. **Smart selection lebih natural** - Prioritas karakter yang mirip (a, e, o, c, p, x)
3. **Word boundaries optimal** - Invisible chars di antara kata lebih efektif
4. **Font preservation penting** - Tampilan harus tetap natural

### Rekomendasi:

- Gunakan **header_focused** untuk header dan format wajib
- Gunakan **natural** untuk content biasa
- Kombinasi keduanya memberikan hasil terbaik
- Similarity target: **<10%**

## 📝 Files Reference

### Input Files:
- `original.docx` - Dokumen asli
- `flag.txt` - Daftar kata/frasa yang ter-flag Turnitin

### Output Files:
- `outputs/original_bypassed_*.docx` - Hasil bypass
- `hasil_flag.txt` - Analisis hasil flag dari Turnitin
- `header_flags.txt` - Daftar header yang ter-flag

### Core Scripts:
- `app/bypass_engine.py` - Engine utama
- `config.py` - Konfigurasi default
- `targeted_flag_bypass.py` - Standalone targeted bypass
- `header_bypass.py` - Standalone header bypass

## 🚨 Important Notes

- ⚠️ Untuk **tujuan pendidikan dan penelitian**
- ⚠️ Di bawah bimbingan dosen pembimbing
- ⚠️ Tidak untuk disalahgunakan
- ⚠️ Font dan formatting tetap preserved
- ⚠️ Max file size: 10MB

## 📄 License

Educational Research Project - Under Academic Supervision

## 👨‍🎓 Author

Developed for academic research on plagiarism detection systems analysis.

---

## 📚 Documentation

Untuk informasi lebih detail:

1. **[STRATEGIES_GUIDE.md](STRATEGIES_GUIDE.md)** - Penjelasan lengkap 3 strategi
2. **[OCR_UPDATE.md](OCR_UPDATE.md)** - OCRmyPDF integration & migration guide
3. **[LOADING_INDICATOR.md](LOADING_INDICATOR.md)** - Loading modal & progress tracking
4. **[CHANGELOG.md](CHANGELOG.md)** - Version history & upcoming features

## 🧪 Testing

Test OCR endpoint:
```bash
curl -X POST http://localhost:8000/analyze/ocr-pdf \
  -F "file=@test.pdf"
```

Test bypass processing:
```bash
curl -X POST http://localhost:8000/bypass/upload \
  -F "file=@original.docx" \
  -F "strategy=header_focused"
```

Test frontend:
```
Open: http://localhost:8000/app
```

---

**Status**: ✅ Production Ready with Full Features
**Version**: 1.1.0
**API Version**: 1.0.0
**Last Updated**: 2025-10-21
**OCR Method**: ocrmypdf v15.2.0 with --force-ocr
**Loading UI**: Real-time progress with 5-step indicator
