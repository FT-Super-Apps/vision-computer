#!/usr/bin/env python3
"""
Simple extractor untuk testing - extract semua text blocks yang punya warna/highlighting
"""

import fitz
import json
from pathlib import Path

def extract_colored_text_simple(pdf_path):
    """Extract text yang ada warnanya (highlighted) dari PDF Turnitin"""
    
    doc = fitz.open(pdf_path)
    flagged_texts = []
    
    print(f"📖 Processing {len(doc)} pages...")
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        print(f"\n🔍 Page {page_num + 1}/{len(doc)}")
        
        # Get all text blocks with color info
        blocks = page.get_text("dict")["blocks"]
        
        for block in blocks:
            if "lines" not in block:
                continue
            
            for line in block["lines"]:
                for span in line["spans"]:
                    # Check if text has color (not black)
                    color = span.get("color", 0)
                    
                    # Color != 0 means it's not black (it's highlighted/colored)
                    if color != 0 and color != 16777215:  # Not black and not white
                        text = span["text"].strip()
                        
                        if len(text) > 5:  # Minimal 5 characters
                            print(f"   ✅ Found colored text: '{text[:50]}...' (color: {color})")
                            
                            flagged_texts.append({
                                "text": text,
                                "page": page_num + 1,
                                "color": color,
                                "bbox": span["bbox"],
                                "length": len(text)
                            })
    
    doc.close()
    
    print(f"\n✅ Total flagged texts: {len(flagged_texts)}")
    return flagged_texts

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python test_extract.py <pdf_file>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = Path(pdf_path).stem + "_flagged_simple.json"
    
    print(f"📂 Input: {pdf_path}")
    print(f"📂 Output: {output_path}")
    
    flagged_texts = extract_colored_text_simple(pdf_path)
    
    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(flagged_texts, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved to: {output_path}")
