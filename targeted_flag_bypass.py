#!/usr/bin/env python3
"""
Targeted Turnitin Flag Bypass
Hanya memodifikasi kata/frasa yang ter-flag oleh Turnitin
Menggunakan kombinasi: Homoglyphs + Invisible Characters
"""

import random
from docx import Document
from docx.shared import Pt

# ============================================================================
# CONFIGURATION
# ============================================================================

# Cyrillic homoglyphs (visual identical)
HOMOGLYPHS = {
    'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н',
    'I': 'І', 'K': 'К', 'M': 'М', 'O': 'О', 'P': 'Р',
    'T': 'Т', 'X': 'Х', 'Y': 'У',
    'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с',
    'x': 'х', 'y': 'у', 'i': 'і', 'k': 'к', 'u': 'υ',
    'd': 'ԁ', 'g': 'ց', 'j': 'ј', 'l': 'l', 'n': 'п',
    's': 'ѕ', 'v': 'ѵ', 'w': 'ԝ', 'z': 'ᴢ'
}

# Invisible characters (zero-width)
INVISIBLE_CHARS = [
    '\u200B',  # Zero-width space
    '\u200C',  # Zero-width non-joiner
    '\u200D',  # Zero-width joiner
    '\uFEFF',  # Zero-width no-break space
]

# ============================================================================
# LOAD FLAGGED PHRASES
# ============================================================================

def load_flagged_phrases(flag_file='flag.txt'):
    """Load kata/frasa yang ter-flag dari file"""
    with open(flag_file, 'r', encoding='utf-8') as f:
        phrases = [line.strip() for line in f if line.strip()]

    # Sort by length (longest first) untuk avoid partial replacement
    phrases.sort(key=len, reverse=True)

    print(f"✅ Loaded {len(phrases)} flagged phrases")
    return phrases

# ============================================================================
# BYPASS TECHNIQUES
# ============================================================================

def apply_homoglyphs(text, density=0.80):
    """Apply homoglyphs replacement"""
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

def apply_invisible_chars(text, density=0.30):
    """Insert invisible characters between words/characters"""
    if not text or len(text) < 3:
        return text

    result = list(text)
    # Insert positions (between characters, avoid start/end)
    insert_positions = list(range(1, len(text) - 1))

    num_insert = max(1, int(len(insert_positions) * density))
    positions = sorted(random.sample(insert_positions, min(num_insert, len(insert_positions))), reverse=True)

    for pos in positions:
        invisible_char = random.choice(INVISIBLE_CHARS)
        result.insert(pos, invisible_char)

    return ''.join(result)

def apply_combined_bypass(text, homoglyph_density=0.80, invisible_density=0.30):
    """Kombinasi homoglyphs + invisible characters"""
    # Step 1: Apply homoglyphs
    text = apply_homoglyphs(text, density=homoglyph_density)

    # Step 2: Apply invisible characters
    text = apply_invisible_chars(text, density=invisible_density)

    return text

# ============================================================================
# TARGETED REPLACEMENT
# ============================================================================

def targeted_replace_in_text(text, flagged_phrases, homoglyph_density=0.80, invisible_density=0.30):
    """Replace hanya kata/frasa yang ter-flag"""
    if not text:
        return text, 0

    modified_text = text
    replacement_count = 0

    for phrase in flagged_phrases:
        if phrase in modified_text:
            # Apply bypass technique
            bypassed_phrase = apply_combined_bypass(phrase, homoglyph_density, invisible_density)

            # Replace all occurrences
            modified_text = modified_text.replace(phrase, bypassed_phrase)
            replacement_count += 1

    return modified_text, replacement_count

# ============================================================================
# MAIN PROCESSING
# ============================================================================

def process_document(input_docx='original.docx',
                     output_docx='original_targeted_bypass.docx',
                     flag_file='flag.txt',
                     homoglyph_density=0.80,
                     invisible_density=0.30):
    """Process dokumen dengan targeted bypass"""

    print(f"\n{'='*70}")
    print(f"🎯 TARGETED TURNITIN FLAG BYPASS")
    print(f"{'='*70}")
    print(f"Input       : {input_docx}")
    print(f"Output      : {output_docx}")
    print(f"Flag file   : {flag_file}")
    print(f"Homoglyph   : {int(homoglyph_density*100)}%")
    print(f"Invisible   : {int(invisible_density*100)}%")
    print(f"{'='*70}\n")

    # Check if output file exists
    import os
    if os.path.exists(output_docx):
        print(f"⚠️  WARNING: {output_docx} already exists!")

        # Generate new filename with timestamp
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = output_docx.rsplit('.', 1)[0]
        output_docx = f"{base_name}_{timestamp}.docx"
        print(f"✅ Creating new file: {output_docx}\n")

    # Load flagged phrases
    flagged_phrases = load_flagged_phrases(flag_file)

    print(f"\n📋 Flagged phrases preview:")
    for i, phrase in enumerate(flagged_phrases[:5], 1):
        print(f"   {i}. {phrase[:60]}{'...' if len(phrase) > 60 else ''}")
    if len(flagged_phrases) > 5:
        print(f"   ... and {len(flagged_phrases) - 5} more")
    print()

    # Load document (read from input, never modify input)
    doc = Document(input_docx)

    total_replacements = 0
    modified_paragraphs = 0

    # Process each paragraph
    for i, para in enumerate(doc.paragraphs):
        if not para.text.strip():
            continue

        para_modified = False

        # Process each run to preserve formatting
        for run in para.runs:
            if run.text:
                modified_text, count = targeted_replace_in_text(
                    run.text,
                    flagged_phrases,
                    homoglyph_density,
                    invisible_density
                )

                if count > 0:
                    run.text = modified_text
                    total_replacements += count
                    para_modified = True

        if para_modified:
            modified_paragraphs += 1

            if modified_paragraphs <= 3:
                print(f"✅ Para {i+1}: {total_replacements} flagged phrases replaced")

    # Save document
    doc.save(output_docx)

    print(f"\n{'='*70}")
    print(f"✅ COMPLETE!")
    print(f"{'='*70}")
    print(f"Modified paragraphs    : {modified_paragraphs}")
    print(f"Total replacements     : {total_replacements}")
    print(f"Output saved to        : {output_docx}")
    print(f"\n🎯 Strategi:")
    print(f"   - Homoglyphs: {int(homoglyph_density*100)}% karakter diganti (Cyrillic)")
    print(f"   - Invisible : {int(invisible_density*100)}% invisible chars inserted")
    print(f"   - Font/formatting tetap dipertahankan")
    print(f"{'='*70}\n")

# ============================================================================
# ANALYZE MODE
# ============================================================================

def analyze_flags(input_docx='original.docx', flag_file='flag.txt'):
    """Analisis berapa banyak flagged phrases di dokumen"""

    print(f"\n{'='*70}")
    print(f"🔍 ANALYZE FLAGGED PHRASES IN DOCUMENT")
    print(f"{'='*70}\n")

    flagged_phrases = load_flagged_phrases(flag_file)
    doc = Document(input_docx)

    # Get all text
    full_text = '\n'.join([para.text for para in doc.paragraphs])

    print(f"📊 Analysis Results:\n")

    found_count = 0
    total_occurrences = 0

    for phrase in flagged_phrases:
        count = full_text.count(phrase)
        if count > 0:
            found_count += 1
            total_occurrences += count
            print(f"   ✓ '{phrase[:50]}...' → {count} occurrence(s)")

    print(f"\n{'='*70}")
    print(f"Summary:")
    print(f"   - Total flagged phrases : {len(flagged_phrases)}")
    print(f"   - Found in document     : {found_count}")
    print(f"   - Total occurrences     : {total_occurrences}")
    print(f"{'='*70}\n")

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == 'analyze':
        # Analyze mode
        input_file = sys.argv[2] if len(sys.argv) > 2 else 'original.docx'
        flag_file = sys.argv[3] if len(sys.argv) > 3 else 'flag.txt'
        analyze_flags(input_file, flag_file)
    else:
        # Process mode
        input_file = sys.argv[1] if len(sys.argv) > 1 else 'original.docx'
        output_file = sys.argv[2] if len(sys.argv) > 2 else 'original_targeted_bypass.docx'
        flag_file = sys.argv[3] if len(sys.argv) > 3 else 'flag.txt'

        # Optional: custom densities
        homoglyph_d = float(sys.argv[4]) if len(sys.argv) > 4 else 0.80
        invisible_d = float(sys.argv[5]) if len(sys.argv) > 5 else 0.30

        process_document(input_file, output_file, flag_file, homoglyph_d, invisible_d)
