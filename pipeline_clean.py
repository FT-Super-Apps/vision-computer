#!/usr/bin/env python3
"""
COMPLETE CLEAN PIPELINE for Turnitin Bypass
No tricks, just pure high-quality paraphrasing
"""

import subprocess
import sys
import json
from pathlib import Path

def run_command(cmd, description):
    """Run a shell command and print output"""
    print(f"\n{'='*70}")
    print(f"🚀 {description}")
    print(f"{'='*70}")
    
    result = subprocess.run(cmd, shell=True, capture_output=False, text=True)
    
    if result.returncode != 0:
        print(f"❌ Error: Command failed with exit code {result.returncode}")
        return False
    
    return True

def main():
    if len(sys.argv) < 3:
        print("""
╔══════════════════════════════════════════════════════════════════════╗
║                  TURNITIN BYPASS - CLEAN PIPELINE                     ║
║                  (No Invisible Chars, Pure Paraphrase)               ║
╚══════════════════════════════════════════════════════════════════════╝

Usage: python pipeline_clean.py <turnitin_report.pdf> <original.docx>

Example:
    python pipeline_clean.py testing.pdf testing.docx

Output:
    - testing_flagged.json          : Extracted flagged texts
    - testing_matches.json          : Matched paragraphs
    - testing_paraphrased_clean.json: Paraphrased results
    - testing_clean_bypassed.docx   : Final bypassed document
    - testing_report.html           : Visual comparison report

⚡ NEW APPROACH:
   ✅ Pure IndoT5 paraphrase with HIGH diversity
   ✅ Multiple paraphrase attempts (choose best)
   ✅ Clean text layer (no tricks)
   ✅ No invisible characters
   ✅ No unicode substitution
   
   This approach keeps text layer clean so Turnitin won't re-OCR!
        """)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    docx_path = sys.argv[2]
    
    # Validate inputs
    if not Path(pdf_path).exists():
        print(f"❌ Error: PDF not found: {pdf_path}")
        sys.exit(1)
    
    if not Path(docx_path).exists():
        print(f"❌ Error: DOCX not found: {docx_path}")
        sys.exit(1)
    
    # Generate filenames
    pdf_stem = Path(pdf_path).stem
    docx_stem = Path(docx_path).stem
    
    flagged_json = f"{pdf_stem}_flagged.json"
    paraphrased_json = f"{pdf_stem}_paraphrased_clean.json"
    output_docx = f"{docx_stem}_clean_bypassed.docx"
    
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║                  🎓 TURNITIN BYPASS - CLEAN PIPELINE                 ║
║                     Pure Paraphrase Strategy                          ║
╚══════════════════════════════════════════════════════════════════════╝
""")
    
    print(f"📄 Input PDF  : {pdf_path}")
    print(f"📄 Input DOCX : {docx_path}")
    print(f"📄 Output     : {output_docx}")
    
    # Step 1: Extract flagged texts
    if not run_command(
        f"python extract_turnitin_fixed.py {pdf_path}",
        "STEP 1: Extract Flagged Texts from Turnitin PDF"
    ):
        sys.exit(1)
    
    # Verify extraction
    if not Path(flagged_json).exists():
        print(f"❌ Error: Flagged JSON not created: {flagged_json}")
        sys.exit(1)
    
    with open(flagged_json) as f:
        flagged = json.load(f)
    
    print(f"\n✅ Extracted {len(flagged)} flagged texts")
    
    # Step 2: Match and paraphrase with CLEAN approach
    if not run_command(
        f"python paraphrase_clean.py {flagged_json} {docx_path}",
        "STEP 2: Match & Paraphrase (CLEAN - No Tricks)"
    ):
        sys.exit(1)
    
    # Verify paraphrasing
    if not Path(paraphrased_json).exists():
        print(f"❌ Error: Paraphrased JSON not created: {paraphrased_json}")
        sys.exit(1)
    
    # Step 3: Apply to DOCX
    if not run_command(
        f"python apply_clean.py {paraphrased_json} {docx_path}",
        "STEP 3: Apply Clean Paraphrased Texts to DOCX"
    ):
        sys.exit(1)
    
    # Verify output
    if not Path(output_docx).exists():
        print(f"❌ Error: Output DOCX not created: {output_docx}")
        sys.exit(1)
    
    # Step 4: Generate report
    if Path("generate_report.py").exists():
        run_command(
            f"python generate_report.py {paraphrased_json}",
            "STEP 4: Generate Visual Comparison Report"
        )
    
    # Final summary
    print(f"\n{'='*70}")
    print("🎉 PIPELINE COMPLETED SUCCESSFULLY!")
    print(f"{'='*70}")
    print(f"\n📊 Output Files:")
    print(f"   1. {flagged_json} - Extracted flagged texts")
    print(f"   2. testing_matches.json - Matched paragraphs")
    print(f"   3. {paraphrased_json} - Paraphrased results")
    print(f"   4. {output_docx} - ⭐ FINAL BYPASSED DOCUMENT")
    
    if Path(f"{pdf_stem}_report.html").exists():
        print(f"   5. {pdf_stem}_report.html - Visual comparison")
    
    print(f"\n{'='*70}")
    print("📋 NEXT STEPS:")
    print(f"{'='*70}")
    print(f"   1. Open: {output_docx}")
    print(f"   2. Review the changes")
    print(f"   3. Upload to Turnitin")
    print(f"   4. Check similarity score")
    print(f"\n⚡ KEY DIFFERENCES from previous attempt:")
    print(f"   ❌ NO invisible characters (causes OCR)")
    print(f"   ❌ NO unicode substitution (causes OCR)")  
    print(f"   ✅ Pure IndoT5 with HIGH diversity")
    print(f"   ✅ Clean text layer (Turnitin won't re-OCR)")
    print(f"   ✅ Expected result: 50-70% similarity reduction")
    print(f"\n🎯 This approach should work because:")
    print(f"   - Text layer stays clean and readable")
    print(f"   - Turnitin won't detect anything suspicious")
    print(f"   - Paraphrasing is natural and diverse")
    print(f"   - No OCR errors will be introduced")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()
