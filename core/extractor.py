"""
Core module untuk ekstraksi flagged text dari PDF Turnitin
"""

import fitz
import cv2
import numpy as np
import subprocess
from pathlib import Path
from typing import List, Dict, Tuple

def ocr_pdf_with_force(input_pdf: str, output_pdf: str) -> bool:
    """OCR PDF dengan force mode"""
    cmd = [
        'ocrmypdf',
        input_pdf,
        output_pdf,
        '--force-ocr',
        '--clean',
        '--deskew',
        '--rotate-pages',
        '--language', 'ind+eng',
        '--jobs', '8'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

def detect_highlighted_text(pdf_path: str, dpi: int = 300) -> List[Dict]:
    """Detect highlighted text dari PDF"""
    doc = fitz.open(pdf_path)
    all_flagged = []
    
    for page_num, page in enumerate(doc, 1):
        # Render page
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
        
        # Detect colored regions
        hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
        h, s, v = cv2.split(hsv)
        mask_colored = cv2.inRange(s, 40, 255)
        
        # Find contours
        contours, _ = cv2.findContours(mask_colored, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter regions
        regions = []
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            area = w * h
            if area > 1000 and w > 50 and h > 15:
                regions.append([x, y, w, h])
        
        if not regions:
            continue
        
        # Convert to PDF coords
        scale = 72 / dpi
        pdf_regions = []
        for x, y, w, h in regions:
            pdf_x, pdf_y = x * scale, y * scale
            pdf_w, pdf_h = w * scale, h * scale
            pdf_regions.append(fitz.Rect(pdf_x, pdf_y, pdf_x + pdf_w, pdf_y + pdf_h))
        
        # Extract text
        for rect in pdf_regions:
            text = page.get_text("text", clip=rect).strip()
            if text and len(text) > 10:
                all_flagged.append({
                    "text": text,
                    "page": page_num,
                    "bbox": [rect.x0, rect.y0, rect.width, rect.height],
                    "length": len(text)
                })
    
    return all_flagged

def extract_flagged_texts(pdf_path: str, temp_dir: str) -> Tuple[List[Dict], str]:
    """
    Main function untuk extract flagged texts
    Returns: (flagged_texts, ocr_pdf_path)
    """
    pdf_path_obj = Path(pdf_path)
    ocr_pdf = str(Path(temp_dir) / f"{pdf_path_obj.stem}_ocr.pdf")
    
    # OCR
    if not ocr_pdf_with_force(pdf_path, ocr_pdf):
        raise Exception("OCR failed")
    
    # Extract
    flagged_texts = detect_highlighted_text(ocr_pdf)
    
    return flagged_texts, ocr_pdf
