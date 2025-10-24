#!/usr/bin/env python3
"""
Recreate original_round2.docx
Ultra-aggressive homoglyphs (70-80% density)
"""

import random
from docx import Document

# Cyrillic homoglyphs
HOMOGLYPHS = {
    'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н',
    'I': 'І', 'K': 'К', 'M': 'М', 'O': 'О', 'P': 'Р',
    'T': 'Т', 'X': 'Х', 'Yb': 'У',
    'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с',
    'x': 'х', 'y': 'у', 'i': 'і', 'k': 'к', 'u': 'υ',
    'd': 'ԁ', 'g': 'ց', 'j': 'ј', 'l': 'l', 'n': 'п',
    's': 'ѕ', 'v': 'ѵ', 'w': 'ԝ', 'z': 'ᴢ'
}

def apply_ultra_aggressive_homoglyphs(text, density=0.75):
    """Apply 75% homoglyphs replacement"""
    if not text:
        return text
    
    result = list(text)
    replaceable = [i for i, c in enumerate(text) if c in HOMOGLYPHS]
    
    if not replaceable:
        return text
    
    num_replace = max(1, int(len(replaceable) * density))
    positions = random.sample(replaceable, min(num_replace, len(replaceable)))
    
    for pos in positions:
        result[pos] = HOMOGLYPHS[result[pos]]
    
    return ''.join(result)

def recreate_round2(input_docx='original.docx', output_docx='original_round2_recreated.docx'):
    """Recreate original_round2.docx logic"""
    
    print(f"\n{'='*70}")
    print(f"🔥 ULTRA-AGGRESSIVE BYPASS - ROUND 2 RECREATION")
    print(f"{'='*70}")
    print(f"Input : {input_docx}")
    print(f"Output: {output_docx}")
    print(f"Density: 75% Cyrillic homoglyphs")
    print(f"{'='*70}\n")
    
    doc = Document(input_docx)
    
    # Target paragraphs (same as original_round2)
    # Based on analysis: 15 paragraphs were modified
    target_indices = [3, 4, 5, 9, 10, 11, 12, 13, 14, 15, 18, 19, 22, 23, 24]
    
    modified_count = 0

    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if not text:
            continue

        # Modify if in target list OR if paragraph is substantial
        if i in target_indices or len(text.split()) > 20:
            original = text
            modified_para = False
            modified_text_full = ""

            # Modifikasi setiap run untuk mempertahankan formatting
            for run in para.runs:
                if run.text:
                    original_run_text = run.text
                    modified_run_text = apply_ultra_aggressive_homoglyphs(run.text, density=0.75)

                    if modified_run_text != original_run_text:
                        run.text = modified_run_text
                        modified_para = True

                    modified_text_full += modified_run_text

            if modified_para:
                modified_count += 1

                cyrillic_count = sum(1 for c in modified_text_full if '\u0400' <= c <= '\u04FF')

                if modified_count <= 5:
                    print(f"✅ Para {i+1} modified ({cyrillic_count} Cyrillic)")
                    print(f"   Original: {original[:60]}...")
                    print(f"   Modified: {modified_text_full[:60]}...")
                    print()
    
    doc.save(output_docx)
    
    print(f"\n{'='*70}")
    print(f"✅ COMPLETE!")
    print(f"{'='*70}")
    print(f"Modified paragraphs: {modified_count}")
    print(f"Output: {output_docx}")
    print(f"\n🎯 This recreates the ultra-aggressive approach")
    print(f"   used in original_round2.docx (2008 Cyrillic chars)")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    import sys
    
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'original.docx'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'original_round2_recreated.docx'
    
    recreate_round2(input_file, output_file)
