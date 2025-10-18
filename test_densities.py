#!/usr/bin/env python3
"""
Header Bypass - Test Multiple Densities
Find optimal invisible char density that works without triggering OCR
"""

import sys
import re
import random
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from tqdm import tqdm
import os

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
    
    if not text:
        return False
    
    # Pattern 1: BAB dengan angka
    if re.match(r'^BAB\s+[IVX0-9]+', text_upper):
        return True
    
    # Pattern 2: Numbered sections
    if re.match(r'^\d+\.\d+(\.\d+)?\s+[A-Z]', text):
        return True
    
    # Pattern 3: Common headers (case-insensitive)
    common_headers = [
        'kata pengantar', 'abstrak', 'daftar isi', 'daftar tabel', 'daftar gambar',
        'pendahuluan', 'latar belakang', 'tinjauan pustaka', 'landasan teori',
        'metodologi penelitian', 'metode penelitian', 'hasil dan pembahasan',
        'kesimpulan dan saran', 'kesimpulan', 'saran', 'lampiran',
        'rumusan masalah', 'batasan masalah', 'tujuan penelitian', 'manfaat penelitian',
        'secara teoritis', 'secara praktis', 'ruang lingkup',
    ]
    
    text_lower = text.lower().strip()
    for header in common_headers:
        if header in text_lower:
            return True
    
    # Pattern 4: ALL CAPS dengan ≤8 kata
    if text_upper == text and word_count <= 8 and len(text) >= 3:
        return True
    
    # Pattern 5: Heading style
    if paragraph.style.name.startswith('Heading'):
        return True
    
    # Pattern 6: Bold + short text
    if paragraph.runs:
        first_run = paragraph.runs[0]
        if first_run.bold and word_count <= 10:
            return True
    
    return False

def add_invisible_chars_only(text, density=0.10):
    """Add ONLY invisible characters (no unicode substitution)"""
    if not text or len(text) < 2:
        return text
    
    result = []
    for i, char in enumerate(text):
        result.append(char)
        # Add invisible char after alphanumeric
        if char.isalnum() and random.random() < density:
            result.append(random.choice(INVISIBLE_CHARS))
    
    return ''.join(result)

def test_multiple_densities(input_docx, base_output_name="test_density"):
    """
    Test multiple invisible char densities
    Create separate files for each density
    """
    
    densities = [0.05, 0.10, 0.15, 0.20, 0.25]
    
    print(f"\n{'='*70}")
    print(f"🎓 HEADER BYPASS - DENSITY TESTING")
    print(f"{'='*70}")
    print(f"Input: {input_docx}")
    print(f"\n🧪 Testing densities: {[f'{d*100:.0f}%' for d in densities]}")
    print(f"{'='*70}\n")
    
    for density in densities:
        output_file = f"{base_output_name}_{int(density*100):02d}percent.docx"
        
        print(f"\n{'='*70}")
        print(f"Testing: {density*100:.0f}% invisible chars")
        print(f"{'='*70}")
        
        doc = Document(input_docx)
        header_count = 0
        
        for para in doc.paragraphs:
            if not para.text.strip():
                continue
            
            if is_academic_header(para):
                header_count += 1
                
                # Apply invisible chars to each run
                for run in para.runs:
                    if run.text.strip():
                        # Save formatting
                        bold = run.bold
                        italic = run.italic
                        underline = run.underline
                        font_size = run.font.size
                        font_name = run.font.name
                        font_color = run.font.color.rgb if run.font.color and run.font.color.rgb else None
                        
                        # Apply ONLY invisible chars (no unicode)
                        run.text = add_invisible_chars_only(run.text, density=density)
                        
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
        
        doc.save(output_file)
        
        print(f"   ✅ {header_count} headers modified")
        print(f"   📄 Saved: {output_file}")
    
    print(f"\n{'='*70}")
    print(f"✅ TESTING COMPLETE!")
    print(f"{'='*70}")
    print(f"\n📊 Created {len(densities)} test files:")
    for density in densities:
        output_file = f"{base_output_name}_{int(density*100):02d}percent.docx"
        print(f"   📄 {output_file} - {density*100:.0f}% invisible chars")
    
    print(f"\n🎯 Next Steps:")
    print(f"   1. Upload EACH file to Turnitin")
    print(f"   2. Compare which density works best")
    print(f"   3. Find sweet spot: headers bypass but OCR tidak corrupt")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_densities.py input.docx [base_output_name]")
        print("\nExample:")
        print("  python test_densities.py original.docx test_header")
        print("\nThis will create:")
        print("  test_header_05percent.docx (5% invisible)")
        print("  test_header_10percent.docx (10% invisible)")
        print("  test_header_15percent.docx (15% invisible)")
        print("  test_header_20percent.docx (20% invisible)")
        print("  test_header_25percent.docx (25% invisible)")
        sys.exit(1)
    
    input_file = sys.argv[1]
    base_output = sys.argv[2] if len(sys.argv) > 2 else "test_density"
    
    test_multiple_densities(input_file, base_output)
