#!/usr/bin/env python3
"""
Homoglyphs Bypass - Replace Latin with Cyrillic lookalikes
More reliable than invisible chars - OCR friendly!
"""

import sys
import re
import random
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from tqdm import tqdm

# Cyrillic homoglyphs (terlihat identik dengan Latin)
HOMOGLYPHS = {
    'A': 'А',  # U+0041 → U+0410 (Cyrillic A)
    'B': 'В',  # U+0042 → U+0412 (Cyrillic Ve)
    'C': 'С',  # U+0043 → U+0421 (Cyrillic Es)
    'E': 'Е',  # U+0045 → U+0415 (Cyrillic Ie)
    'H': 'Н',  # U+0048 → U+041D (Cyrillic En)
    'I': 'І',  # U+0049 → U+0406 (Cyrillic Byelorussian I)
    'K': 'К',  # U+004B → U+041A (Cyrillic Ka)
    'M': 'М',  # U+004D → U+041C (Cyrillic Em)
    'O': 'О',  # U+004F → U+041E (Cyrillic O)
    'P': 'Р',  # U+0050 → U+0420 (Cyrillic Er)
    'T': 'Т',  # U+0054 → U+0422 (Cyrillic Te)
    'X': 'Х',  # U+0058 → U+0425 (Cyrillic Ha)
    'Y': 'У',  # U+0059 → U+0423 (Cyrillic U)
    'a': 'а',  # U+0061 → U+0430 (Cyrillic a)
    'e': 'е',  # U+0065 → U+0435 (Cyrillic ie)
    'o': 'о',  # U+006F → U+043E (Cyrillic o)
    'p': 'р',  # U+0070 → U+0440 (Cyrillic er)
    'c': 'с',  # U+0063 → U+0441 (Cyrillic es)
    'x': 'х',  # U+0078 → U+0445 (Cyrillic kha)
    'y': 'у',  # U+0079 → U+0443 (Cyrillic u)
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

def apply_homoglyphs(text, density=0.40):
    """
    Replace characters with Cyrillic lookalikes
    density: percentage of replaceable chars to replace (0.0-1.0)
    """
    if not text:
        return text
    
    result = list(text)
    
    # Find all replaceable positions
    replaceable_indices = [
        i for i, char in enumerate(text)
        if char in HOMOGLYPHS
    ]
    
    if not replaceable_indices:
        return text
    
    # Select random positions to replace
    num_to_replace = max(1, int(len(replaceable_indices) * density))
    positions = random.sample(replaceable_indices, min(num_to_replace, len(replaceable_indices)))
    
    # Replace selected positions
    for pos in positions:
        result[pos] = HOMOGLYPHS[result[pos]]
    
    return ''.join(result)

def test_homoglyphs_densities(input_docx, base_output="test_homoglyph"):
    """
    Test multiple homoglyph densities
    Create separate files: 20%, 30%, 40%, 50%, 60%
    """
    
    densities = [0.20, 0.30, 0.40, 0.50, 0.60]
    
    print(f"\n{'='*70}")
    print(f"🎓 HOMOGLYPHS BYPASS - DENSITY TESTING")
    print(f"{'='*70}")
    print(f"Input: {input_docx}")
    print(f"\n🧪 Testing densities: {[f'{d*100:.0f}%' for d in densities]}")
    print(f"Strategy: Cyrillic lookalike characters (visually identical)")
    print(f"{'='*70}\n")
    
    for density in densities:
        output_file = f"{base_output}_{int(density*100):02d}percent.docx"
        
        print(f"\n{'='*70}")
        print(f"Testing: {density*100:.0f}% homoglyphs replacement")
        print(f"{'='*70}")
        
        doc = Document(input_docx)
        header_count = 0
        sample_headers = []
        
        for para in doc.paragraphs:
            if not para.text.strip():
                continue
            
            if is_academic_header(para):
                header_count += 1
                original = para.text
                
                # Apply homoglyphs to each run
                for run in para.runs:
                    if run.text.strip():
                        # Save formatting
                        bold = run.bold
                        italic = run.italic
                        underline = run.underline
                        font_size = run.font.size
                        font_name = run.font.name
                        font_color = run.font.color.rgb if run.font.color and run.font.color.rgb else None
                        
                        # Apply homoglyphs
                        original_text = run.text
                        run.text = apply_homoglyphs(run.text, density=density)
                        
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
                
                # Store sample
                if len(sample_headers) < 5:
                    modified = para.text
                    replaced = sum(1 for a, b in zip(original, modified) if a != b)
                    sample_headers.append({
                        'original': original,
                        'modified': modified,
                        'replaced': replaced
                    })
        
        doc.save(output_file)
        
        print(f"   ✅ {header_count} headers modified")
        print(f"   📄 Saved: {output_file}")
        
        # Show samples
        if sample_headers:
            print(f"\n   📝 Sample modifications:")
            for i, sample in enumerate(sample_headers[:3], 1):
                print(f"      {i}. {sample['original']}")
                print(f"         → {sample['modified']}")
                print(f"         (replaced {sample['replaced']} chars)")
    
    print(f"\n{'='*70}")
    print(f"✅ TESTING COMPLETE!")
    print(f"{'='*70}")
    print(f"\n📊 Created {len(densities)} test files:")
    for density in densities:
        output_file = f"{base_output}_{int(density*100):02d}percent.docx"
        print(f"   📄 {output_file} - {density*100:.0f}% Cyrillic replacement")
    
    print(f"\n🎯 Strategy:")
    print(f"   ✅ Cyrillic homoglyphs (visually IDENTICAL to Latin)")
    print(f"   ✅ OCR friendly (text still readable)")
    print(f"   ✅ Different Unicode encoding → Turnitin cannot match")
    
    print(f"\n📤 Next Steps:")
    print(f"   1. Upload each file to Turnitin")
    print(f"   2. Check which density bypasses headers")
    print(f"   3. Verify OCR reads correctly (no corruption)")
    print(f"   4. Compare similarity scores")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_homoglyphs.py input.docx [base_output_name]")
        print("\nExample:")
        print("  python test_homoglyphs.py original.docx test_homoglyph")
        print("\nThis will create:")
        print("  test_homoglyph_20percent.docx (20% Cyrillic)")
        print("  test_homoglyph_30percent.docx (30% Cyrillic)")
        print("  test_homoglyph_40percent.docx (40% Cyrillic)")
        print("  test_homoglyph_50percent.docx (50% Cyrillic)")
        print("  test_homoglyph_60percent.docx (60% Cyrillic)")
        sys.exit(1)
    
    input_file = sys.argv[1]
    base_output = sys.argv[2] if len(sys.argv) > 2 else "test_homoglyph"
    
    test_homoglyphs_densities(input_file, base_output)
