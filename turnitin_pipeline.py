#!/usr/bin/env python3
"""
COMPLETE TURNITIN BYPASS PIPELINE
Run everything in one command!
"""

import subprocess
import sys
from pathlib import Path

def run_command(cmd, desc):
    """Run command and show progress"""
    print(f"\n{'='*70}")
    print(f"🚀 {desc}")
    print(f"{'='*70}")
    
    result = subprocess.run(cmd, shell=True, capture_output=False, text=True)
    
    if result.returncode != 0:
        print(f"❌ Failed: {desc}")
        return False
    
    print(f"✅ Completed: {desc}")
    return True

def main():
    if len(sys.argv) < 3:
        print("="*70)
        print("🎓 TURNITIN SMART BYPASS - Complete Pipeline")
        print("="*70)
        print("\nUsage: python turnitin_pipeline.py <turnitin.pdf> <original.docx>")
        print("\nExample:")
        print("  python turnitin_pipeline.py turnitin_report.pdf skripsi.docx")
        print("\nSteps executed:")
        print("  1. Extract flagged texts from PDF (OCR + color detection)")
        print("  2. Match flagged texts with DOCX paragraphs")
        print("  3. Paraphrase with IndoT5 + invisible chars")
        print("  4. Apply changes to DOCX")
        print("  5. Generate HTML report")
        print("="*70)
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    docx_file = sys.argv[2]
    
    # Validate files
    if not Path(pdf_file).exists():
        print(f"❌ PDF file not found: {pdf_file}")
        sys.exit(1)
    
    if not Path(docx_file).exists():
        print(f"❌ DOCX file not found: {docx_file}")
        sys.exit(1)
    
    # Get base names
    pdf_base = Path(pdf_file).stem
    docx_base = Path(docx_file).stem
    
    # Output files
    flagged_json = f"{pdf_base}_flagged.json"
    paraphrased_json = f"{pdf_base}_paraphrased.json"
    output_docx = f"{docx_base}_bypassed.docx"
    report_html = f"{pdf_base}_report.html"
    
    print("="*70)
    print("🎓 TURNITIN SMART BYPASS - Complete Pipeline")
    print("="*70)
    print(f"📥 Input PDF  : {pdf_file}")
    print(f"📥 Input DOCX : {docx_file}")
    print(f"📤 Output DOCX: {output_docx}")
    print(f"📤 HTML Report: {report_html}")
    print("="*70)
    
    # Step 1: Extract flagged texts
    if not run_command(
        f"python extract_turnitin_fixed.py {pdf_file}",
        "STEP 1: Extract flagged texts from PDF"
    ):
        sys.exit(1)
    
    # Step 2: Match and paraphrase
    if not run_command(
        f"python match_and_paraphrase_indot5.py {flagged_json} {docx_file}",
        "STEP 2: Match with DOCX and paraphrase"
    ):
        sys.exit(1)
    
    # Use the generated paraphrased.json (default name)
    paraphrased_json = "testing_paraphrased.json"
    
    # Step 3: Apply to DOCX
    if not run_command(
        f"python apply_to_docx.py {paraphrased_json} {docx_file} {output_docx}",
        "STEP 3: Apply changes to DOCX"
    ):
        sys.exit(1)
    
    # Step 4: Generate report
    if not run_command(
        f"python generate_report.py {paraphrased_json}",
        "STEP 4: Generate HTML report"
    ):
        sys.exit(1)
    
    # Final summary
    print("\n" + "="*70)
    print("🎉 PIPELINE COMPLETE!")
    print("="*70)
    print(f"✅ Flagged texts extracted: {flagged_json}")
    print(f"✅ Paraphrased results    : {paraphrased_json}")
    print(f"✅ Bypassed DOCX          : {output_docx}")
    print(f"✅ HTML Report            : {report_html}")
    print("="*70)
    print("\n💡 Next Steps:")
    print(f"   1. Open {output_docx} to review changes")
    print(f"   2. Open {report_html} to see comparison")
    print(f"   3. Upload {output_docx} to Turnitin")
    print("="*70)

if __name__ == "__main__":
    main()
