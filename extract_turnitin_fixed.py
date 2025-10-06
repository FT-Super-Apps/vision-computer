#!/usr/bin/env python3
"""
Fixed Turnitin Extractor:
1. OCR PDF dengan ocrmypdf → SIMPAN hasil
2. Detect warna highlight di hasil OCR
3. Extract text dari text layer hasil OCR (bukan OCR ulang!)
"""

import fitz
import cv2
import numpy as np
import json
import subprocess
from pathlib import Path

def ocr_pdf_with_force(input_pdf, output_pdf):
    """OCR PDF dan simpan hasilnya"""
    print(f"\n🔧 Running OCR with --force-ocr...")
    print(f"   Input : {input_pdf}")
    print(f"   Output: {output_pdf}")
    
    cmd = [
        'ocrmypdf',
        input_pdf,
        output_pdf,
        '--force-ocr',  # Force OCR even if text exists
        '--clean',
        '--deskew',
        '--rotate-pages',
        '--language', 'ind+eng',
        '--jobs', '8'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ OCR failed: {result.stderr}")
        return False
    
    print(f"✅ OCR completed successfully!")
    return True

def detect_highlighted_text(pdf_path, dpi=300):
    """
    Detect highlighted text dari PDF yang sudah di-OCR
    Menggunakan:
    1. Color detection untuk find highlight regions
    2. Text extraction dari text layer (bukan OCR ulang!)
    """
    doc = fitz.open(pdf_path)
    all_flagged = []
    
    print(f"\n📖 Extracting highlighted text from {len(doc)} pages...")
    print("="*70)
    
    for page_num, page in enumerate(doc, 1):
        # Render page ke image untuk color detection
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
        
        # Detect colored regions (highlights)
        hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
        
        # Detect highlights dengan saturation threshold
        # Turnitin biasanya pakai yellow/orange/red highlights
        # Saturation > 40 = ada warna (not grayscale)
        h, s, v = cv2.split(hsv)
        mask_colored = cv2.inRange(s, 40, 255)  # Any colored region
        
        # Find contours
        contours, _ = cv2.findContours(mask_colored, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter and merge nearby regions
        regions = []
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            area = w * h
            # Filter: area > 1000, width > 50, height > 15
            if area > 1000 and w > 50 and h > 15:
                regions.append([x, y, w, h])
        
        if not regions:
            continue
        
        print(f"\n📄 Page {page_num}: Found {len(regions)} highlighted regions")
        
        # Convert pixel coords to PDF coords
        scale = 72 / dpi
        pdf_regions = []
        for x, y, w, h in regions:
            # Convert to PDF coordinate system
            pdf_x = x * scale
            pdf_y = y * scale
            pdf_w = w * scale
            pdf_h = h * scale
            pdf_regions.append(fitz.Rect(pdf_x, pdf_y, pdf_x + pdf_w, pdf_y + pdf_h))
        
        # Extract text dari text layer untuk setiap region
        for i, rect in enumerate(pdf_regions):
            # Get text dalam region ini
            text = page.get_text("text", clip=rect).strip()
            
            if text and len(text) > 10:
                flagged_data = {
                    "text": text,
                    "page": page_num,
                    "bbox": [rect.x0, rect.y0, rect.width, rect.height],
                    "length": len(text)
                }
                all_flagged.append(flagged_data)
                
                # Preview
                preview = text.replace('\n', ' ')[:80]
                print(f"   ✅ Region {i+1}: {preview}...")
    
    return all_flagged

def merge_overlapping_texts(flagged_texts):
    """Merge texts yang overlap atau sangat dekat"""
    if not flagged_texts:
        return []
    
    # Group by page
    by_page = {}
    for text in flagged_texts:
        page = text['page']
        if page not in by_page:
            by_page[page] = []
        by_page[page].append(text)
    
    merged = []
    
    for page, texts in by_page.items():
        # Sort by y position
        texts.sort(key=lambda t: t['bbox'][1])
        
        # Merge texts that are close
        current = texts[0]
        
        for next_text in texts[1:]:
            curr_bbox = current['bbox']
            next_bbox = next_text['bbox']
            
            # Check vertical distance
            y_distance = abs(next_bbox[1] - (curr_bbox[1] + curr_bbox[3]))
            
            # If close (< 20 points), merge
            if y_distance < 20:
                current['text'] += ' ' + next_text['text']
                # Expand bbox
                current['bbox'][2] = max(curr_bbox[2], next_bbox[2])
                current['bbox'][3] = next_bbox[1] + next_bbox[3] - curr_bbox[1]
                current['length'] = len(current['text'])
            else:
                merged.append(current)
                current = next_text
        
        merged.append(current)
    
    return merged

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python extract_turnitin_fixed.py <pdf_file>")
        print("\nOutput files:")
        print("  - <pdf_file>_ocr.pdf     : OCR result")
        print("  - <pdf_file>_flagged.json: Extracted flagged texts")
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    input_path = Path(input_pdf)
    
    # Output files
    ocr_pdf = str(input_path.parent / f"{input_path.stem}_ocr.pdf")
    output_json = str(input_path.parent / f"{input_path.stem}_flagged.json")
    
    print("="*70)
    print("🎓 TURNITIN FLAGGED TEXT EXTRACTOR - FIXED VERSION")
    print("="*70)
    print(f"Input PDF  : {input_pdf}")
    print(f"OCR Output : {ocr_pdf}")
    print(f"JSON Output: {output_json}")
    
    # Step 1: OCR PDF
    if not ocr_pdf_with_force(input_pdf, ocr_pdf):
        print("❌ OCR failed, exiting...")
        return
    
    # Step 2: Extract highlighted text dari OCR result
    flagged_texts = detect_highlighted_text(ocr_pdf)
    
    print(f"\n📊 Raw flagged texts: {len(flagged_texts)}")
    
    # Step 3: Merge overlapping/nearby texts
    merged_texts = merge_overlapping_texts(flagged_texts)
    
    print(f"📊 After merging: {len(merged_texts)}")
    
    # Step 4: Save to JSON
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(merged_texts, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*70)
    print("✅ EXTRACTION COMPLETE!")
    print("="*70)
    print(f"📄 OCR Result: {ocr_pdf}")
    print(f"💾 Flagged texts: {output_json}")
    print(f"📊 Total texts: {len(merged_texts)}")
    print("="*70)
    
    # Show summary
    if merged_texts:
        print("\n📋 Summary of flagged texts:")
        for i, text in enumerate(merged_texts[:5], 1):
            preview = text['text'].replace('\n', ' ')[:100]
            print(f"{i}. [Page {text['page']}] {preview}...")
        
        if len(merged_texts) > 5:
            print(f"... and {len(merged_texts) - 5} more texts")

if __name__ == "__main__":
    main()
