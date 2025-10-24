#!/usr/bin/env python3
"""
Complete Turnitin Bypass Pipeline
Combines:
1. Enhanced header bypass (invisible chars + unicode)
2. IndoT5 paraphrase for flagged content
"""

import sys
import subprocess
import os

def run_complete_bypass(turnitin_pdf, original_docx, output_docx):
    """
    Complete bypass pipeline:
    1. Extract flagged texts from Turnitin PDF
    2. Match & paraphrase content with IndoT5
    3. Apply enhanced header bypass
    4. Combine both results
    """
    
    print(f"\n{'='*70}")
    print(f"🎓 COMPLETE TURNITIN BYPASS PIPELINE")
    print(f"{'='*70}")
    print(f"Turnitin PDF : {turnitin_pdf}")
    print(f"Original DOCX: {original_docx}")
    print(f"Output DOCX  : {output_docx}")
    print(f"{'='*70}\n")
    
    base_name = turnitin_pdf.replace('.pdf', '')
    
    # Step 1: Extract flagged texts
    print(f"📖 Step 1: Extracting flagged texts...")
    cmd1 = f"python extract_turnitin_fixed.py {turnitin_pdf}"
    subprocess.run(cmd1, shell=True)
    
    flagged_json = f"{base_name}_flagged.json"
    if not os.path.exists(flagged_json):
        print(f"❌ Error: {flagged_json} not found!")
        return
    
    # Step 2: Match & paraphrase content
    print(f"\n🎨 Step 2: Matching & paraphrasing content...")
    cmd2 = f"python match_and_paraphrase_indot5.py {flagged_json} {original_docx}"
    subprocess.run(cmd2, shell=True)
    
    paraphrased_json = "testing_paraphrased.json"
    if not os.path.exists(paraphrased_json):
        print(f"❌ Error: {paraphrased_json} not found!")
        return
    
    # Step 3: Apply paraphrased content
    print(f"\n✏️  Step 3: Applying paraphrased content...")
    temp_content = "temp_content_bypassed.docx"
    cmd3 = f"python apply_to_docx.py {paraphrased_json} {original_docx} {temp_content}"
    subprocess.run(cmd3, shell=True)
    
    if not os.path.exists(temp_content):
        print(f"❌ Error: {temp_content} not found!")
        return
    
    # Step 4: Apply enhanced header bypass
    print(f"\n🔤 Step 4: Applying enhanced header bypass...")
    cmd4 = f"python enhanced_header_bypass.py {temp_content} {output_docx} 0.30 0.15"
    subprocess.run(cmd4, shell=True)
    
    # Cleanup temp file
    if os.path.exists(temp_content):
        os.remove(temp_content)
    
    print(f"\n{'='*70}")
    print(f"🎉 COMPLETE!")
    print(f"{'='*70}")
    print(f"📄 Output: {output_docx}")
    print(f"\n🎯 Applied Strategies:")
    print(f"   ✅ Headers: Invisible chars (30%) + Unicode (15%)")
    print(f"   ✅ Content: IndoT5 AI paraphrase")
    print(f"\n📤 Next: Upload {output_docx} to Turnitin!")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python complete_bypass.py turnitin.pdf original.docx [output.docx]")
        print("\nExample:")
        print("  python complete_bypass.py testing_form_turnitin.pdf original.docx final_bypassed.docx")
        sys.exit(1)
    
    turnitin_pdf = sys.argv[1]
    original_docx = sys.argv[2]
    output_docx = sys.argv[3] if len(sys.argv) > 3 else "complete_bypassed.docx"
    
    run_complete_bypass(turnitin_pdf, original_docx, output_docx)
