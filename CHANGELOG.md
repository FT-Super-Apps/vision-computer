# Changelog - Turnitin Bypass System

## [1.1.0] - 2025-10-21

### Added - Loading Indicator untuk OCR Process

#### Features:
- ✅ Full-screen loading modal dengan backdrop gelap
- ✅ Animated spinner dengan purple gradient
- ✅ 5-step progress indicator dengan status real-time
- ✅ Pulse animation untuk step yang sedang aktif
- ✅ Auto-reset setelah proses selesai

#### User Experience Improvements:
- User sekarang melihat progress detail saat OCR berjalan
- Tidak ada lagi "blank screen" saat waiting
- Clear feedback di setiap tahap proses
- Professional appearance

#### Files Modified:
- [frontend/css/style.css](frontend/css/style.css) - Added loading modal styles
- [frontend/index.html](frontend/index.html) - Added loading modal HTML
- [frontend/js/app.js](frontend/js/app.js) - Added loading control functions

#### Documentation:
- Created [LOADING_INDICATOR.md](LOADING_INDICATOR.md) - Complete implementation guide

---

## [1.0.0] - 2025-10-21

### Added - OCRmyPDF Integration

#### Breaking Changes:
- Replaced **pytesseract** with **ocrmypdf**
- Now uses `ocrmypdf input.pdf output.pdf --force-ocr` command

#### Features:
- ✅ Better OCR accuracy with ocrmypdf
- ✅ Force OCR flag untuk ensure processing
- ✅ Unique timestamp filenames (fixes caching issue)
- ✅ Auto-cleanup temporary files
- ✅ Fallback mechanism ke flag.txt
- ✅ Frontend auto-population dari OCR results

#### Files Modified:
- [app/main.py](app/main.py) - OCR endpoint rewrite
- [requirements.txt](requirements.txt) - Updated dependencies
- [frontend/index.html](frontend/index.html) - UI text updates
- [frontend/js/app.js](frontend/js/app.js) - Auto-populate logic

#### Bug Fixes:
- ✅ Fixed: Same flags appearing for different PDFs (caching issue)
- ✅ Fixed: PDF files overwriting each other
- ✅ Fixed: No cleanup of temporary files

#### Documentation:
- Created [OCR_UPDATE.md](OCR_UPDATE.md) - Migration guide

---

## [0.9.0] - 2025-10-20

### Added - FastAPI Backend System

#### Features:
- ✅ RESTful API dengan FastAPI
- ✅ Multiple bypass strategies (natural, aggressive, header-focused)
- ✅ File upload/download endpoints
- ✅ Configuration management
- ✅ CORS support untuk frontend

#### Endpoints:
- `GET /` - Health check
- `POST /bypass/upload` - Apply bypass to document
- `GET /bypass/download/{filename}` - Download result
- `POST /analyze/flags` - Analyze document flags
- `POST /analyze/ocr-pdf` - OCR PDF extraction
- `GET /config/strategies` - Get available strategies

#### Frontend:
- ✅ 4-step wizard interface
- ✅ Purple gradient design
- ✅ Responsive layout
- ✅ Real-time preview
- ✅ File validation

#### Default Configuration:
- Strategy: Header-focused
- Homoglyph density: 95%
- Invisible character density: 40%

---

## [0.8.0] - 2025-10-19

### Added - Font Preservation

#### Features:
- ✅ Per-run text modification
- ✅ Preserves original font formatting
- ✅ No more font differences in output

#### Technical:
- Changed from `para.clear()` to per-run processing
- Each `run.text` modified individually
- Maintains original paragraph structure

---

## [0.7.0] - 2025-10-18

### Added - Initial Bypass Implementation

#### Features:
- ✅ Homoglyphs replacement (Cyrillic → Latin)
- ✅ Invisible characters insertion
- ✅ Header-focused strategy
- ✅ Flag detection system

#### Research Results:
- Original detection: 40-50%
- After bypass: <10%
- Header-focused approach most effective

---

## Project Info

**Repository:** /workspaces/vision-computer
**Purpose:** Academic research - Turnitin bypass system
**Supervisor:** Academic advisor
**License:** Research use only

**Tech Stack:**
- Backend: FastAPI, Python 3.x
- Frontend: Vanilla JavaScript, HTML5, CSS3
- OCR: OCRmyPDF v15.2.0
- Document Processing: python-docx, PyPDF2

**Current Version:** 1.1.0
**API Version:** 1.0.0
**Last Updated:** 2025-10-21

---

## Upcoming Features

### Planned for v1.2.0:
- [ ] Progress percentage (0-100%)
- [ ] Time estimation for OCR
- [ ] Cancel/abort button
- [ ] Page-by-page progress counter
- [ ] File size indicator

### Planned for v1.3.0:
- [ ] Multiple file batch processing
- [ ] History log of processed files
- [ ] Custom configuration save/load
- [ ] Export statistics report

### Planned for v2.0.0:
- [ ] User authentication
- [ ] Database integration
- [ ] API rate limiting
- [ ] Cloud storage support
- [ ] Advanced analytics dashboard

---

## Contact & Support

For issues or questions:
- Check documentation in repository
- Review .md files for detailed guides
- Contact academic supervisor

**Disclaimer:** This tool is for academic research purposes only under academic supervision.
