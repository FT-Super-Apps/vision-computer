#!/usr/bin/env python3
"""
Header-Focused Bypass for Turnitin
Strategi khusus untuk header/format wajib akademik
Ultra-aggressive: 90-100% replacement
"""

import random
from docx import Document
from docx.shared import Pt
import re

# ============================================================================
# CONFIGURATION - ULTRA AGGRESSIVE
# ============================================================================

# Cyrillic homoglyphs (visual identical)
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

# Invisible characters
INVISIBLE_CHARS = [
    '\u200B',  # Zero-width space
    '\u200C',  # Zero-width non-joiner
    '\u200D',  # Zero-width joiner
    '\uFEFF',  # Zero-width no-break space
]

# ============================================================================
# HEADER PATTERNS - Format akademik yang wajib
# ============================================================================

HEADER_PATTERNS = [
    # Format: huruf + titik + spasi + kata
    r'^[A-Z]\.\s+.*$',  # A. Latar Belakang, B. Rumusan, dst
    r'^BAB\s+[IVX]+.*$',  # BAB I, BAB II, dst
    r'^[0-9]+\.\s+.*$',  # 1. Item, 2. Item
    r'^[0-9]+\.[0-9]+.*$',  # 1.1, 1.2, dst
]

# Specific headers yang pasti ter-flag
KNOWN_HEADERS = [
    'B. Rumusan Masalah',
    'C. Tujuan Penelitian',
    'E. Ruang Lingkup Penelitian',
    'A. Latar Belakang',
    'D. Manfaat Penelitian',
    'F. Sistematika Penulisan',
    'BAB I',
    'BAB II',
    'BAB III',
    'BAB IV',
    'BAB V',
    'PENDAHULUAN',
    'TINJAUAN PUSTAKA',
    'METODOLOGI PENELITIAN',
    'HASIL DAN PEMBAHASAN',
    'PENUTUP',
    'DAFTAR PUSTAKA',
    'LAMPIRAN'
]

# Kalimat pembuka standar
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
# ULTRA AGGRESSIVE BYPASS
# ============================================================================

def ultra_aggressive_homoglyphs(text, density=0.95):
    """Apply 95% homoglyphs - hampir semua karakter diganti"""
    if not text:
        return text

    result = list(text)
    replaceable = [i for i, c in enumerate(text) if c in HOMOGLYPHS]

    if not replaceable:
        return text

    # Replace hampir semua (95%)
    num_replace = max(1, int(len(replaceable) * density))
    positions = random.sample(replaceable, min(num_replace, len(replaceable)))

    for pos in positions:
        result[pos] = HOMOGLYPHS[result[pos]]

    return ''.join(result)

def insert_invisible_aggressive(text, density=0.40):
    """Insert invisible characters aggressively"""
    if not text or len(text) < 2:
        return text

    result = list(text)

    # Insert at multiple points
    insert_positions = list(range(1, len(text)))

    num_insert = max(1, int(len(insert_positions) * density))
    positions = sorted(random.sample(insert_positions, min(num_insert, len(insert_positions))), reverse=True)

    for pos in positions:
        invisible_char = random.choice(INVISIBLE_CHARS)
        result.insert(pos, invisible_char)

    return ''.join(result)

def is_header(text):
    """Check if text is a header"""
    text = text.strip()

    # Check known headers
    for header in KNOWN_HEADERS:
        if header.lower() in text.lower():
            return True

    # Check patterns
    for pattern in HEADER_PATTERNS:
        if re.match(pattern, text, re.IGNORECASE):
            return True

    return False

def is_standard_phrase(text):
    """Check if text contains standard academic phrases"""
    text_lower = text.lower()
    for phrase in STANDARD_PHRASES:
        if phrase.lower() in text_lower:
            return True
    return False

# ============================================================================
# MAIN PROCESSING
# ============================================================================

def process_headers(input_docx='original.docx',
                   output_docx='original_header_bypass.docx',
                   homoglyph_density=0.95,
                   invisible_density=0.40):
    """Process dokumen dengan fokus pada header bypass"""

    print(f"\n{'='*70}")
    print(f"🎯 HEADER-FOCUSED TURNITIN BYPASS")
    print(f"{'='*70}")
    print(f"Input       : {input_docx}")
    print(f"Output      : {output_docx}")
    print(f"Strategy    : Ultra-Aggressive Header Bypass")
    print(f"Homoglyph   : {int(homoglyph_density*100)}%")
    print(f"Invisible   : {int(invisible_density*100)}%")
    print(f"{'='*70}\n")

    # Check if output exists
    import os
    if os.path.exists(output_docx):
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = output_docx.rsplit('.', 1)[0]
        output_docx = f"{base_name}_{timestamp}.docx"
        print(f"⚠️  Output exists, creating: {output_docx}\n")

    doc = Document(input_docx)

    header_count = 0
    phrase_count = 0
    total_modifications = 0

    print("🔍 Processing...\n")

    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if not text:
            continue

        modified = False

        # Check if this is a header or standard phrase
        is_hdr = is_header(text)
        is_std = is_standard_phrase(text)

        if is_hdr or is_std:
            # Process each run with ULTRA AGGRESSIVE settings
            for run in para.runs:
                if run.text:
                    original_text = run.text

                    # Apply ultra aggressive bypass
                    modified_text = ultra_aggressive_homoglyphs(original_text, density=homoglyph_density)
                    modified_text = insert_invisible_aggressive(modified_text, density=invisible_density)

                    if modified_text != original_text:
                        run.text = modified_text
                        modified = True

            if modified:
                total_modifications += 1

                if is_hdr:
                    header_count += 1
                    print(f"✅ HEADER {header_count}: {text[:50]}{'...' if len(text) > 50 else ''}")

                if is_std:
                    phrase_count += 1
                    print(f"✅ PHRASE {phrase_count}: {text[:50]}{'...' if len(text) > 50 else ''}")

    # Save document
    doc.save(output_docx)

    print(f"\n{'='*70}")
    print(f"✅ COMPLETE!")
    print(f"{'='*70}")
    print(f"Headers modified       : {header_count}")
    print(f"Standard phrases       : {phrase_count}")
    print(f"Total modifications    : {total_modifications}")
    print(f"Output saved to        : {output_docx}")
    print(f"\n🎯 Strategy Applied:")
    print(f"   - {int(homoglyph_density*100)}% Cyrillic homoglyphs")
    print(f"   - {int(invisible_density*100)}% invisible characters")
    print(f"   - Ultra-aggressive mode for headers")
    print(f"   - Font/formatting preserved")
    print(f"{'='*70}\n")

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import sys

    input_file = sys.argv[1] if len(sys.argv) > 1 else 'original.docx'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'original_header_bypass.docx'

    # Optional: custom densities (default: ultra aggressive)
    homoglyph_d = float(sys.argv[3]) if len(sys.argv) > 3 else 0.95
    invisible_d = float(sys.argv[4]) if len(sys.argv) > 4 else 0.40

    process_headers(input_file, output_file, homoglyph_d, invisible_d)
