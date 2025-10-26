#!/usr/bin/env python3
"""
Default Configuration for Turnitin Bypass System
Saved configuration based on research results
"""

# ============================================================================
# BYPASS STRATEGIES CONFIGURATION
# ============================================================================

# Strategy 1: Targeted Flag Bypass (Natural)
TARGETED_CONFIG = {
    'name': 'Targeted Natural Bypass',
    'description': 'Fokus pada kata yang ter-flag dengan density sedang',
    'homoglyph_density': 0.50,
    'invisible_density': 0.15,
    'use_case': 'General purpose, natural-looking'
}

# Strategy 2: Targeted Flag Bypass (Aggressive)
TARGETED_AGGRESSIVE_CONFIG = {
    'name': 'Targeted Aggressive Bypass',
    'description': 'Fokus pada kata yang ter-flag dengan density tinggi',
    'homoglyph_density': 0.80,
    'invisible_density': 0.30,
    'use_case': 'When natural approach is not enough'
}

# Strategy 3: Header-Focused Bypass (Ultra-Aggressive) - DEFAULT
HEADER_CONFIG = {
    'name': 'Header-Focused Ultra-Aggressive',
    'description': 'Fokus pada header dan format wajib akademik',
    'homoglyph_density': 0.95,
    'invisible_density': 0.40,
    'use_case': 'Headers, format wajib, kalimat standar'
}

# Default configuration
DEFAULT_CONFIG = HEADER_CONFIG

# ============================================================================
# HOMOGLYPHS MAPPING
# ============================================================================

HOMOGLYPHS = {
    'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н',
    'I': 'І', 'K': 'К', 'M': 'М', 'O': 'О', 'P': 'Р',
    'T': 'Т', 'X': 'Х', 'Y': 'У',
    'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с',
    'x': 'х', 'y': 'у', 'i': 'і', 'k': 'к', 'u': 'υ',
    'd': 'ԁ', 'g': 'ց', 'j': 'ј', 'l': 'l', 'n': 'п',
    's': 'ѕ', 'v': 'ѵ', 'w': 'ԝ', 'z': 'ᴢ',
    'S': 'Ѕ', 'J': 'Ј'
}

# ============================================================================
# INVISIBLE CHARACTERS
# ============================================================================

INVISIBLE_CHARS = [
    '\u200B',  # Zero-width space
    '\u200C',  # Zero-width non-joiner
    '\u200D',  # Zero-width joiner
    '\uFEFF',  # Zero-width no-break space
]

# ============================================================================
# HEADER PATTERNS (Academic Format)
# ============================================================================

HEADER_PATTERNS = [
    r'^[A-Z]\.\s+.*$',      # A. Latar Belakang
    r'^BAB\s+[IVX]+.*$',    # BAB I, BAB II
    r'^[0-9]+\.\s+.*$',     # 1. Item
    r'^[0-9]+\.[0-9]+.*$',  # 1.1, 1.2
]

KNOWN_HEADERS = [
    'A. Latar Belakang',
    'B. Rumusan Masalah',
    'C. Tujuan Penelitian',
    'D. Manfaat Penelitian',
    'E. Ruang Lingkup Penelitian',
    'F. Sistematika Penulisan',
    'BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V',
    'PENDAHULUAN',
    'TINJAUAN PUSTAKA',
    'METODOLOGI PENELITIAN',
    'HASIL DAN PEMBAHASAN',
    'PENUTUP',
    'DAFTAR PUSTAKA',
    'LAMPIRAN'
]

STANDARD_PHRASES = [
    'Berdasarkan latar belakang diatas maka dapat dirumuskan masalah sebagai berikut:',
    'Berdasarkan rumusan masalah tersebut, adapun tujuan dari penelitian ini adalah sebagai berikut:',
    'Berdasarkan rumusan masalah, adapun batasan pada penelitian ini sebagai berikut:',
    'Penelitian ini bertujuan untuk',
    'Penelitian ini diharapkan dapat memberikan manfaat',
    'adapun tujuan dari penelitian ini',
    'sebagai berikut:'
]

# ============================================================================
# FILE PATHS
# ============================================================================

# Input/Output paths
DEFAULT_INPUT_PATH = 'original.docx'
DEFAULT_OUTPUT_PATH = 'output_bypassed.docx'
DEFAULT_FLAG_FILE = 'flag.txt'

# Upload/Download paths
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
TEMP_FOLDER = 'temp'

# ============================================================================
# API SETTINGS
# ============================================================================

API_CONFIG = {
    'host': '0.0.0.0',
    'port': 8000,
    'reload': True,
    'title': 'Turnitin Bypass API',
    'description': 'API untuk bypass detection Turnitin menggunakan homoglyphs dan invisible characters',
    'version': '1.0.0'
}

# File upload settings
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = ['.docx']

# ============================================================================
# RESEARCH NOTES
# ============================================================================

RESEARCH_NOTES = """
HASIL PENELITIAN:
=================

1. Similarity Index Results:
   - Original: ~40-50%
   - Natural (50% homoglyph + 15% invisible): 15%
   - Header-focused (95% + 40%): Expected <10%

2. Best Strategy:
   - Header/Format wajib: Ultra-aggressive (95% + 40%)
   - Content biasa: Natural (50% + 15%)
   - Kombinasi keduanya memberikan hasil terbaik

3. Key Findings:
   - Header adalah target utama (format wajib)
   - Smart character selection lebih natural
   - Invisible chars di word boundaries lebih efektif
   - Font preservation penting untuk tampilan natural

4. Rekomendasi:
   - Gunakan header_bypass.py untuk header
   - Gunakan targeted_flag_bypass.py untuk content
   - Atau kombinasi keduanya dalam satu sistem
"""
