#!/usr/bin/env python3
"""
Improved Turnitin Text Extractor dengan:
- Better OCR preprocessing
- Error correction
- Multiple OCR attempts
"""

import fitz
import cv2
import numpy as np
import pytesseract
from PIL import Image
import json
from pathlib import Path

def preprocess_image(image_np):
    """Preprocess image untuk OCR lebih baik"""
    # Convert to grayscale
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray)
    
    # Increase contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(denoised)
    
    # Threshold
    _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return binary

def detect_highlighted_regions(page, page_num, dpi=300):
    """Detect highlighted regions dengan color detection"""
    # Render page ke image
    mat = fitz.Matrix(dpi/72, dpi/72)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
    
    # Convert RGB to HSV
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    
    # Detect colors (red, yellow, orange highlights)
    mask_red = cv2.inRange(hsv, np.array([0, 100, 100]), np.array([10, 255, 255]))
    mask_yellow = cv2.inRange(hsv, np.array([20, 100, 100]), np.array([30, 255, 255]))
    mask_orange = cv2.inRange(hsv, np.array([10, 100, 100]), np.array([20, 255, 255]))
    
    # Combine masks
    mask_all = cv2.bitwise_or(mask_red, cv2.bitwise_or(mask_yellow, mask_orange))
    
    # Find contours
    contours, _ = cv2.findContours(mask_all, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter small contours
    min_area = 500  # Minimum area untuk dianggap text
    regions = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        if area >= min_area and w > 50 and h > 10:  # Filter size minimum
            regions.append((x, y, w, h))
    
    print(f"📖 Page {page_num}: Found {len(regions)} highlighted regions (filtered)")
    
    return regions, img_np

def extract_text_from_region(img_np, region, attempts=3):
    """Extract text dengan multiple attempts dan preprocessing"""
    x, y, w, h = region
    
    # Crop region
    roi = img_np[y:y+h, x:x+w]
    
    # Try multiple configs
    configs = [
        '--oem 3 --psm 6',  # Uniform text block
        '--oem 3 --psm 7',  # Single line
        '--oem 3 --psm 11', # Sparse text
    ]
    
    best_text = ""
    best_conf = 0
    
    for config in configs:
        # Preprocess
        processed = preprocess_image(roi)
        
        # OCR
        data = pytesseract.image_to_data(processed, lang='ind+eng', config=config, output_type=pytesseract.Output.DICT)
        
        # Get text with confidence
        text_parts = []
        confs = []
        for i, word in enumerate(data['text']):
            if word.strip() and data['conf'][i] > 30:  # Confidence threshold
                text_parts.append(word)
                confs.append(data['conf'][i])
        
        if text_parts:
            text = ' '.join(text_parts)
            avg_conf = sum(confs) / len(confs)
            
            if avg_conf > best_conf:
                best_conf = avg_conf
                best_text = text
    
    return best_text, best_conf

def merge_nearby_regions(regions, merge_threshold=50):
    """Merge regions yang berdekatan"""
    if not regions:
        return []
    
    # Sort by y, then x
    regions = sorted(regions, key=lambda r: (r[1], r[0]))
    
    merged = [regions[0]]
    
    for curr in regions[1:]:
        prev = merged[-1]
        prev_x, prev_y, prev_w, prev_h = prev
        curr_x, curr_y, curr_w, curr_h = curr
        
        # Check if on same line (y overlap) and close (x distance)
        y_overlap = abs(prev_y - curr_y) < prev_h * 0.5
        x_close = curr_x - (prev_x + prev_w) < merge_threshold
        
        if y_overlap and x_close:
            # Merge
            new_x = min(prev_x, curr_x)
            new_y = min(prev_y, curr_y)
            new_w = max(prev_x + prev_w, curr_x + curr_w) - new_x
            new_h = max(prev_y + prev_h, curr_y + curr_h) - new_y
            merged[-1] = (new_x, new_y, new_w, new_h)
        else:
            merged.append(curr)
    
    return merged

def extract_flagged_texts(pdf_path, output_json="flagged_improved.json"):
    """Main extraction function"""
    doc = fitz.open(pdf_path)
    
    all_flagged = []
    
    for page_num, page in enumerate(doc, 1):
        # Detect highlighted regions
        regions, img_np = detect_highlighted_regions(page, page_num)
        
        if not regions:
            continue
        
        # Merge nearby regions
        merged_regions = merge_nearby_regions(regions, merge_threshold=30)
        print(f"   Merged to {len(merged_regions)} regions")
        
        # Extract text from each merged region
        for region in merged_regions:
            text, conf = extract_text_from_region(img_np, region)
            
            # Lower thresholds for better detection
            if text and len(text) > 5 and conf > 20:  # Min length & confidence (lowered)
                flagged_data = {
                    "text": text,
                    "page": page_num,
                    "bbox": list(region),
                    "confidence": round(conf, 2),
                    "length": len(text)
                }
                all_flagged.append(flagged_data)
                print(f"   ✅ Extracted (conf={conf:.1f}%): {text[:80]}...")
            elif text:
                print(f"   ⚠️  Skipped (conf={conf:.1f}%, len={len(text)}): {text[:60]}...")
    
    # Save to JSON
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(all_flagged, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Total flagged texts: {len(all_flagged)}")
    print(f"💾 Saved to: {output_json}")
    
    return all_flagged

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python extract_turnitin_improved.py <pdf_file>")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    extract_flagged_texts(pdf_file)
