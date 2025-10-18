#!/usr/bin/env python3
"""
Enhanced Header Bypass - Detect ALL academic headers
Apply invisible characters to:
- BAB I, BAB II, BAB III, etc.
- KATA PENGANTAR, DAFTAR ISI, ABSTRAK, etc.
- 1.1, 1.2, 2.1, 2.2, etc.
- Numbered sections with titles
"""

import sys
import re
import random
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from tqdm import tqdm

# Invisible characters
INVISIBLE_CHARS = [
    '\u200B',  # ZERO WIDTH SPACE
    '\u200C',  # ZERO WIDTH NON-JOINER
    '\u200D',  # ZERO WIDTH JOINER
]

# Unicode lookalikes (Cyrillic)
UNICODE_MAP = {
    'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р',
    'c': 'с', 'x': 'х', 'y': 'у', 'i': 'і',
    'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е',
    'H': 'Н', 'K': 'К', 'M': 'М', 'O': 'О',
    'P': 'Р', 'T': 'Т', 'X': 'Х', 'Y': 'У'
}

def is_academic_header(paragraph):
    """Detect berbagai format header akademik Indonesia"""
    text = paragraph.text.strip()
    text_upper = text.upper()
    word_count = len(text.split())
    
    # Skip empty
    if not text:
        return False
    
    # Pattern 1: BAB dengan angka romawi/arab
    if re.match(r'^BAB\s+[IVX0-9]+', text_upper):
        return True
    
    # Pattern 2: Numbered sections (1.1, 2.3.4, dll)
    if re.match(r'^\d+\.\d+(\.\d+)?\s+[A-Z]', text):
        return True
    
    # Pattern 3: Just numbers (1.1, 2.3, etc)
    if re.match(r'^\d+\.\d+(\.\d+)?\.?\s*$', text):
        return True
    
    # Pattern 4: Common academic headers (comprehensive list)
    # Use case-insensitive matching for flexibility
    common_headers = [
        # Front matter
        'kata pengantar', 'prakata', 'foreword',
        'abstrak', 'abstract',
        'daftar isi', 'table of contents',
        'daftar tabel', 'list of tables',
        'daftar gambar', 'list of figures',
        'daftar lampiran', 'list of appendices',
        'daftar pustaka', 'references', 'bibliography',
        'daftar simbol', 'list of symbols',
        'daftar singkatan', 'list of abbreviations',
        
        # Main content headers
        'pendahuluan', 'introduction',
        'latar belakang', 'background',
        'tinjauan pustaka', 'literature review',
        'landasan teori', 'theoretical framework',
        'kerangka teori', 'theoretical basis',
        'metodologi penelitian', 'research methodology',
        'metode penelitian', 'research method',
        'hasil dan pembahasan', 'results and discussion',
        'hasil penelitian', 'research results',
        'pembahasan', 'discussion',
        'analisis', 'analysis',
        'kesimpulan dan saran', 'conclusion and recommendation',
        'kesimpulan', 'conclusion',
        'saran', 'recommendation', 'suggestions',
        
        # Back matter
        'lampiran', 'appendix', 'appendices',
        'ucapan terima kasih', 'acknowledgments',
        'lembar pengesahan', 'approval sheet',
        'lembar persetujuan', 'approval letter',
        'halaman judul', 'title page',
        'biodata penulis', 'author biography',
        'riwayat hidup', 'curriculum vitae',
        
        # Sub-sections (PENTING: mixed case support!)
        'rumusan masalah', 'problem formulation',
        'batasan masalah', 'scope of research',
        'tujuan penelitian', 'research objectives',
        'manfaat penelitian', 'research benefits',
        'sistematika penulisan', 'writing systematic',
        'kerangka pemikiran', 'conceptual framework',
        'hipotesis', 'hypothesis',
        'definisi operasional', 'operational definition',
        
        # Additional common patterns
        'secara teoritis', 'secara praktis',
        'ruang lingkup', 'scope',
    ]
    
    # Check against lowercase version for case-insensitive matching
    text_lower = text.lower().strip()
    for header in common_headers:
        if header in text_lower:
            return True
    
    # Pattern 5: ALL CAPS dengan ≤8 kata (expanded from 6)
    if text_upper == text and word_count <= 8 and len(text) >= 3:
        return True
    
    # Pattern 6: Check heading style
    if paragraph.style.name.startswith('Heading'):
        return True
    
    # Pattern 7: Check formatting (bold + large font + short text)
    if paragraph.runs:
        first_run = paragraph.runs[0]
        is_bold = first_run.bold
        is_large = first_run.font.size and first_run.font.size.pt >= 12
        is_short = word_count <= 10
        
        if is_bold and is_short:
            return True
        
        if is_large and word_count <= 6:
            return True
    
    # Pattern 8: Centered text with ≤8 words
    if paragraph.alignment in [WD_ALIGN_PARAGRAPH.CENTER] and word_count <= 8:
        return True
    
    return False

def add_invisible_chars(text, density=0.25):
    """Add invisible characters between letters"""
    if not text or len(text) < 2:
        return text
    
    result = []
    for i, char in enumerate(text):
        result.append(char)
        # Add invisible char after alphanumeric with probability
        if char.isalnum() and random.random() < density:
            result.append(random.choice(INVISIBLE_CHARS))
    
    return ''.join(result)

def add_unicode_substitution(text, density=0.15):
    """Replace characters with Cyrillic lookalikes"""
    if not text:
        return text
    
    result = []
    for char in text:
        if char in UNICODE_MAP and random.random() < density:
            result.append(UNICODE_MAP[char])
        else:
            result.append(char)
    
    return ''.join(result)

def apply_header_tricks(text, invisible_density=0.25, unicode_density=0.15):
    """Combine invisible chars + unicode substitution"""
    # First: unicode substitution
    text = add_unicode_substitution(text, unicode_density)
    # Second: invisible chars
    text = add_invisible_chars(text, invisible_density)
    return text

def process_all_headers(input_docx, output_docx, invisible_density=0.25, unicode_density=0.15):
    """
    Process ALL academic headers in document
    Apply invisible chars + unicode substitution
    """
    print(f"\n{'='*70}")
    print(f"🎓 ENHANCED HEADER BYPASS - ALL ACADEMIC HEADERS")
    print(f"{'='*70}")
    print(f"Input  : {input_docx}")
    print(f"Output : {output_docx}")
    print(f"Invisible density: {invisible_density*100:.0f}%")
    print(f"Unicode density  : {unicode_density*100:.0f}%")
    print(f"\n📖 Loading document...")
    
    doc = Document(input_docx)
    
    header_count = 0
    processed_count = 0
    header_samples = []
    
    print(f"\n🔧 Processing paragraphs...")
    
    for para_idx, para in enumerate(tqdm(doc.paragraphs)):
        # Skip empty paragraphs
        if not para.text.strip():
            continue
        
        # Check if header
        if is_academic_header(para):
            header_count += 1
            original = para.text
            
            # Store sample (first 10)
            if len(header_samples) < 10:
                header_samples.append(original)
            
            # Apply tricks to each run
            for run in para.runs:
                if run.text.strip():
                    # Save formatting
                    bold = run.bold
                    italic = run.italic
                    underline = run.underline
                    font_size = run.font.size
                    font_name = run.font.name
                    font_color = run.font.color.rgb if run.font.color and run.font.color.rgb else None
                    
                    # Apply invisible chars + unicode substitution
                    run.text = apply_header_tricks(
                        run.text, 
                        invisible_density=invisible_density,
                        unicode_density=unicode_density
                    )
                    
                    # Restore formatting
                    run.bold = bold
                    run.italic = italic
                    run.underline = underline
                    if font_size:
                        run.font.size = font_size
                    if font_name:
                        run.font.name = font_name
                    if font_color:
                        run.font.color.rgb = font_color
            
            processed_count += 1
    
    # Save document
    print(f"\n💾 Saving to: {output_docx}")
    doc.save(output_docx)
    
    print(f"\n{'='*70}")
    print(f"✅ COMPLETE!")
    print(f"{'='*70}")
    print(f"📊 Statistics:")
    print(f"   - Headers found    : {header_count}")
    print(f"   - Headers modified : {processed_count}")
    print(f"   - Invisible density: {invisible_density*100:.0f}%")
    print(f"   - Unicode density  : {unicode_density*100:.0f}%")
    
    print(f"\n📝 Sample Headers Detected:")
    for i, header in enumerate(header_samples, 1):
        print(f"   {i}. {header[:60]}{'...' if len(header) > 60 else ''}")
    
    print(f"\n{'='*70}")
    print(f"🎯 Strategy Applied:")
    print(f"   ✅ Invisible chars (ZWSP, ZWNJ, ZWJ) - {invisible_density*100:.0f}%")
    print(f"   ✅ Unicode substitution (Cyrillic)   - {unicode_density*100:.0f}%")
    print(f"   ✅ Formatting preserved (bold, size, color)")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python enhanced_header_bypass.py input.docx [output.docx] [invisible_density] [unicode_density]")
        print("\nExample:")
        print("  python enhanced_header_bypass.py original.docx original_enhanced.docx 0.25 0.15")
        print("\nDensity values:")
        print("  invisible_density: 0.15-0.30 (recommended: 0.25)")
        print("  unicode_density  : 0.10-0.20 (recommended: 0.15)")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.docx', '_enhanced.docx')
    invisible_density = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
    unicode_density = float(sys.argv[4]) if len(sys.argv) > 4 else 0.15
    
    process_all_headers(input_file, output_file, invisible_density, unicode_density)
