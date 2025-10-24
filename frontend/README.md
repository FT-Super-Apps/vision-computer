# Frontend - Turnitin Bypass System

Frontend sederhana untuk sistem bypass detection Turnitin.

## 📁 Structure

```
frontend/
├── index.html          # Main HTML page
├── css/
│   └── style.css      # Styling
├── js/
│   └── app.js         # JavaScript logic
└── assets/            # Images/icons (if any)
```

## 🎯 Features

### Workflow:
1. **Upload Files**
   - PDF Turnitin (hasil similarity check)
   - DOCX Original (file dokumen asli)

2. **Extract Flags (OCR)**
   - PDF di-OCR untuk extract flagged phrases
   - Tampilkan list phrases yang ter-flag
   - User review dan konfirmasi

3. **Process Bypass**
   - Pilih strategi (header_focused/aggressive/natural)
   - Aplikasikan bypass technique
   - Modifikasi file asli dengan homoglyphs & invisible chars

4. **Download Result**
   - Download file yang sudah di-bypass
   - Ready untuk upload ke Turnitin

## 🚀 Usage

### 1. Start Backend Server

```bash
# From project root
python app/main.py
```

### 2. Access Frontend

Open browser: **http://localhost:8000/app**

### 3. Upload & Process

1. Upload PDF Turnitin
2. Upload DOCX original
3. Click "Analyze & Extract Flags"
4. Review flagged phrases
5. Choose strategy
6. Click "Setuju & Proses"
7. Download result

## 📊 Strategies

| Strategy | Homoglyph | Invisible | Best For |
|----------|-----------|-----------|----------|
| **header_focused** ⭐ | 95% | 40% | Headers/Format wajib |
| **aggressive** | 80% | 30% | Content yang sulit |
| **natural** | 50% | 15% | Content biasa |

## 🎨 UI/UX

- **Step-by-step wizard** - 4 steps yang jelas
- **Drag & drop** - Upload files dengan mudah
- **Progress indicator** - Real-time processing status
- **Responsive design** - Works on mobile/tablet/desktop
- **Modern gradient** - Purple gradient theme

## 📡 API Endpoints Used

```javascript
POST /analyze/ocr-pdf        // OCR PDF Turnitin
POST /bypass/upload          // Process bypass
GET  /bypass/download/{file} // Download result
GET  /config/strategies      // Get strategies
```

## 🔧 Technical Details

### JavaScript (Vanilla JS)
- No frameworks (pure JavaScript)
- Async/await for API calls
- State management
- Form validation
- Error handling

### CSS
- Flexbox/Grid layout
- Gradient backgrounds
- Smooth animations
- Responsive breakpoints

### HTML5
- Semantic markup
- File input handling
- Progress bars
- Modal/steps

## 📝 Notes

- Frontend served via FastAPI static files
- CORS enabled for API communication
- OCR requires poppler-utils installed on server
- Max file upload: 10MB

## 🎯 Testing

1. Prepare test files:
   - PDF: Turnitin similarity report
   - DOCX: Original document

2. Test workflow:
   - Upload both files
   - Verify OCR extraction
   - Check bypass processing
   - Download and verify result

3. Test strategies:
   - Try different strategies
   - Compare results
   - Check similarity index in Turnitin

## ⚠️ Requirements

Backend must have:
- pytesseract installed
- poppler-utils installed (for PDF conversion)
- Tesseract OCR engine

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr poppler-utils

# macOS
brew install tesseract poppler
```

---

**Version:** 1.0.0  
**Updated:** 2025-10-21
