#!/usr/bin/env python3
"""
NEW APPROACH: Better Paraphrase Strategy
- No invisible chars (causes OCR issues)
- No unicode substitution (causes OCR issues)  
- Pure IndoT5 paraphrase with HIGHER DIVERSITY
- Multiple paraphrase attempts
- Choose best result
"""

import json
import docx
from difflib import SequenceMatcher
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from tqdm import tqdm

def load_indot5_model(model_name="Wikidepia/IndoT5-base-paraphrase"):
    """Load IndoT5 paraphrase model"""
    print(f"\n🔧 Loading IndoT5 model: {model_name}")
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)
    
    print(f"✅ Model loaded on {device}!")
    return tokenizer, model, device

def paraphrase_with_diversity(text, tokenizer, model, device, num_attempts=3, max_length=512):
    """
    Generate multiple paraphrases and choose the most different one
    
    Args:
        text: Original text
        tokenizer: IndoT5 tokenizer
        model: IndoT5 model
        device: cuda/cpu
        num_attempts: Number of paraphrase attempts
        max_length: Max token length
    
    Returns:
        Best paraphrased text (most different from original)
    """
    input_text = f"paraphrase: {text}"
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=max_length,
        truncation=True,
        padding=True
    ).to(device)
    
    candidates = []
    
    for attempt in range(num_attempts):
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_length=max_length,
                num_beams=5,
                early_stopping=True,
                no_repeat_ngram_size=2,
                temperature=0.7 + (attempt * 0.15),  # Increase diversity each attempt
                do_sample=True,  # Enable sampling for diversity
                top_k=50,
                top_p=0.95
            )
        
        paraphrased = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Calculate difference from original
        similarity = SequenceMatcher(None, text.lower(), paraphrased.lower()).ratio()
        difference = 1 - similarity
        
        candidates.append({
            'text': paraphrased,
            'difference': difference,
            'similarity': similarity
        })
    
    # Choose the most different (but not too different)
    # We want difference between 0.3 - 0.7 (sweet spot)
    best = max(candidates, key=lambda x: x['difference'] if 0.3 <= x['difference'] <= 0.7 else 0)
    
    return best['text'], best['similarity']

def is_short_text(text, max_words=5):
    """Check if text is short (header/title)"""
    words = text.split()
    return len(words) <= max_words

def categorize_matches(matches):
    """Categorize matches into headers vs content"""
    headers = []
    contents = []
    
    for match in matches:
        text = match['matched_para']
        if is_short_text(text, max_words=5):
            headers.append(match)
        else:
            contents.append(match)
    
    return headers, contents

def paraphrase_headers_light(text):
    """
    Light paraphrase for headers - just case changes and minor reordering
    NO invisible chars, NO unicode substitution
    """
    # Just normalize case
    words = text.split()
    
    # Title case instead of all caps
    if text.isupper():
        result = ' '.join(word.capitalize() for word in words)
    else:
        result = text
    
    return result

def match_flagged_with_docx(flagged_json, docx_path, threshold=0.5):
    """Match flagged texts with DOCX paragraphs"""
    with open(flagged_json, 'r', encoding='utf-8') as f:
        flagged_texts = json.load(f)
    
    doc = docx.Document(docx_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    
    print(f"\n🔍 Matching {len(flagged_texts)} flagged texts with {len(paragraphs)} paragraphs...")
    
    matches = []
    
    for i, flagged in enumerate(flagged_texts, 1):
        flagged_text = flagged['text']
        best_match = None
        best_ratio = 0
        best_idx = -1
        
        for idx, para in enumerate(paragraphs):
            ratio = SequenceMatcher(None, flagged_text.lower(), para.lower()).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = para
                best_idx = idx
        
        # Keyword search fallback
        if best_ratio < 0.5:
            keywords = [w.lower() for w in flagged_text.split() if len(w) > 4]
            for idx, para in enumerate(paragraphs):
                para_lower = para.lower()
                keyword_matches = sum(1 for kw in keywords if kw in para_lower)
                keyword_ratio = keyword_matches / len(keywords) if keywords else 0
                if keyword_ratio > best_ratio:
                    best_ratio = keyword_ratio
                    best_match = para
                    best_idx = idx
        
        if best_ratio >= threshold:
            match_data = {
                "flagged_text": flagged_text,
                "matched_para": best_match,
                "similarity": round(best_ratio * 100, 2),
                "para_index": best_idx,
                "page": flagged['page']
            }
            matches.append(match_data)
    
    print(f"✅ Total matches: {len(matches)}/{len(flagged_texts)}")
    return matches

def generate_paraphrased_results(matches):
    """Generate paraphrased versions with NEW strategy"""
    results = []
    
    # Categorize
    headers, contents = categorize_matches(matches)
    
    print(f"\n📊 Categorization:")
    print(f"   Headers (≤5 words) : {len(headers)} → Light paraphrase (case only)")
    print(f"   Contents (>5 words): {len(contents)} → IndoT5 with HIGH diversity")
    
    # Process headers - LIGHT paraphrase only (no invisible chars)
    print(f"\n🔤 Processing headers with light paraphrase...")
    for match in tqdm(headers, desc="Headers"):
        original = match['matched_para']
        final = paraphrase_headers_light(original)
        
        result = {
            "original": original,
            "paraphrased": final,
            "method": "light_paraphrase",
            "page": match['page'],
            "similarity_before": match['similarity'],
            "para_index": match['para_index']
        }
        results.append(result)
    
    # Process contents - HIGH DIVERSITY IndoT5
    if contents:
        print(f"\n🎨 Paraphrasing contents with HIGH DIVERSITY IndoT5...")
        tokenizer, model, device = load_indot5_model()
        
        for match in tqdm(contents, desc="Contents"):
            original = match['matched_para']
            
            # Split long text
            if len(original) > 400:
                sentences = original.split('. ')
                paraphrased_parts = []
                for sent in sentences:
                    if sent.strip():
                        if not sent.endswith('.'):
                            sent += '.'
                        para, sim = paraphrase_with_diversity(sent, tokenizer, model, device, num_attempts=3)
                        paraphrased_parts.append(para)
                paraphrased = ' '.join(paraphrased_parts)
                avg_similarity = 0.5  # Approximate
            else:
                # Multiple attempts for best diversity
                paraphrased, avg_similarity = paraphrase_with_diversity(
                    original, tokenizer, model, device, num_attempts=3
                )
            
            result = {
                "original": original,
                "paraphrased": paraphrased,
                "method": "indot5_high_diversity",
                "diversity_score": round((1 - avg_similarity) * 100, 2),
                "page": match['page'],
                "similarity_before": match['similarity'],
                "para_index": match['para_index']
            }
            results.append(result)
    
    return results

def main():
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python paraphrase_clean.py <flagged.json> <original.docx>")
        sys.exit(1)
    
    flagged_json = sys.argv[1]
    docx_path = sys.argv[2]
    
    print("="*70)
    print("🎓 TURNITIN BYPASS - CLEAN APPROACH (No Invisible Chars)")
    print("="*70)
    
    # Step 1: Match
    matches = match_flagged_with_docx(flagged_json, docx_path, threshold=0.5)
    
    if not matches:
        print("\n⚠️  No matches found!")
        return
    
    # Save matches
    matches_file = "testing_matches.json"
    with open(matches_file, 'w', encoding='utf-8') as f:
        json.dump(matches, f, ensure_ascii=False, indent=2)
    print(f"💾 Matches saved: {matches_file}")
    
    # Step 2: Paraphrase with HIGH DIVERSITY
    paraphrased = generate_paraphrased_results(matches)
    
    # Save results
    output_file = "testing_paraphrased_clean.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(paraphrased, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Paraphrased results: {output_file}")
    
    # Summary
    print("\n" + "="*70)
    print("📊 SUMMARY")
    print("="*70)
    print(f"   Flagged texts : {len(matches)}")
    print(f"   Matched       : {len(matches)}")
    print(f"   Paraphrased   : {len(paraphrased)}")
    print("\n⚡ KEY DIFFERENCES from previous approach:")
    print("   ❌ NO invisible characters (causes OCR issues)")
    print("   ❌ NO unicode substitution (causes OCR issues)")
    print("   ✅ Pure IndoT5 with HIGH diversity (3 attempts)")
    print("   ✅ Clean text layer (Turnitin won't re-OCR)")
    print("="*70)

if __name__ == "__main__":
    main()
