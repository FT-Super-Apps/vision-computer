#!/usr/bin/env python3
"""
Complete Pipeline: Extract → Match → Paraphrase → Save JSON
Using IndoT5 for high-quality paraphrasing
"""

import json
import docx
from difflib import SequenceMatcher
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from tqdm import tqdmn/env python3
"""
Complete Pipeline: Extract → Match → Paraphrase with IndoT5 → Save JSON
"""

import json
import docx
from difflib import SequenceMatcher
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from tqdm import tqdm

# Global model cache
_model_cache = None

def load_indot5_model(model_name="Wikidepia/IndoT5-base-paraphrase"):
    """Load IndoT5 model (cached)"""
    global _model_cache
    
    if _model_cache is not None:
        return _model_cache
    
    print(f"\n🔧 Loading IndoT5 model...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)
    
    print(f"✅ Model loaded on {device}!")
    
    _model_cache = (tokenizer, model, device)
    return _model_cache

def paraphrase_with_indot5(text, max_length=512):
    """Paraphrase menggunakan IndoT5"""
    tokenizer, model, device = load_indot5_model()
    
    # Prepare input
    input_text = f"paraphrase: {text}"
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=max_length,
        truncation=True,
        padding=True
    ).to(device)
    
    # Generate
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_length=max_length,
            num_beams=5,
            early_stopping=True,
            no_repeat_ngram_size=2,
            do_sample=False
        )
    
    paraphrased = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return paraphrased

def add_unicode_substitution(text, percentage=0.15):
    """Replace beberapa huruf dengan unicode lookalike"""
    # Cyrillic/Greek lookalikes
    lookalikes = {
        'a': 'а',  # Cyrillic a
        'e': 'е',  # Cyrillic e
        'o': 'о',  # Cyrillic o
        'p': 'р',  # Cyrillic p
        'c': 'с',  # Cyrillic c
        'x': 'х',  # Cyrillic x
        'y': 'у',  # Cyrillic y
    }
    
    import random
    chars = list(text)
    num_replacements = int(len(chars) * percentage)
    
    replaceable_indices = [i for i, c in enumerate(chars) if c.lower() in lookalikes]
    
    if replaceable_indices:
        indices_to_replace = random.sample(
            replaceable_indices, 
            min(num_replacements, len(replaceable_indices))
        )
        
        for idx in indices_to_replace:
            char = chars[idx]
            replacement = lookalikes[char.lower()]
            # Preserve case
            if char.isupper():
                replacement = replacement.upper()
            chars[idx] = replacement
    
    return ''.join(chars)

def match_flagged_with_docx(flagged_json, docx_path, threshold=0.3):
    """Match flagged texts dengan paragraphs di DOCX (lowered threshold for partial matches)"""
    # Load flagged texts
    with open(flagged_json, 'r', encoding='utf-8') as f:
        flagged_texts = json.load(f)
    
    # Load DOCX
    doc = docx.Document(docx_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    
    print(f"\n🔍 Matching {len(flagged_texts)} flagged texts with {len(paragraphs)} paragraphs...")
    print(f"   Threshold: {threshold*100}% (lowered for partial matches)")
    
    matches = []
    
    for i, flagged in enumerate(flagged_texts, 1):
        flagged_text = flagged['text']
        best_match = None
        best_ratio = 0
        best_idx = -1
        
        # Try exact similarity
        for idx, para in enumerate(paragraphs):
            ratio = SequenceMatcher(None, flagged_text.lower(), para.lower()).ratio()
            
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = para
                best_idx = idx
        
        # If no good match, try keyword search
        if best_ratio < 0.5:
            # Extract keywords from flagged text (words > 4 chars)
            keywords = [w.lower() for w in flagged_text.split() if len(w) > 4]
            
            for idx, para in enumerate(paragraphs):
                para_lower = para.lower()
                # Count keyword matches
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
            print(f"   ✅ Match {i}: {best_ratio*100:.1f}% similarity")
            print(f"      Flagged: {flagged_text[:60]}...")
            print(f"      Matched: {best_match[:60]}...")
        else:
            print(f"   ❌ No match {i}: Best {best_ratio*100:.1f}%")
            print(f"      Flagged: {flagged_text[:60]}...")
    
    print(f"\n✅ Total matches: {len(matches)}/{len(flagged_texts)}")
    return matches

def generate_paraphrased_results(matches):
    """Generate paraphrased versions dengan IndoT5"""
    results = []
    
    print(f"\n🎨 Generating paraphrased versions with IndoT5...")
    
    for i, match in enumerate(tqdm(matches, desc="Paraphrasing"), 1):
        original = match['matched_para']
        
        # Step 1: Paraphrase dengan IndoT5
        if len(original) > 400:
            # Split long text
            sentences = original.split('. ')
            paraphrased_parts = []
            for sent in sentences:
                if sent.strip():
                    if not sent.endswith('.'):
                        sent += '.'
                    para = paraphrase_with_indot5(sent)
                    paraphrased_parts.append(para)
            paraphrased = ' '.join(paraphrased_parts)
        else:
            paraphrased = paraphrase_with_indot5(original)
        
        # Step 2: Add unicode substitution (10% of chars)
        final = add_unicode_substitution(paraphrased, percentage=0.1)
        
        result = {
            "original": original,
            "paraphrased_indot5": paraphrased,
            "final": final,
            "page": match['page'],
            "similarity_before": match['similarity'],
            "para_index": match['para_index']
        }
        
        results.append(result)
        
        # Show preview untuk 3 pertama
        if i <= 3:
            print(f"\n   📝 Example {i}:")
            print(f"      Original: {original[:70]}...")
            print(f"      IndoT5:   {paraphrased[:70]}...")
            print(f"      Final:    {final[:70]}...")
    
    return results

def main():
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python match_and_paraphrase.py <flagged.json> <original.docx>")
        sys.exit(1)
    
    flagged_json = sys.argv[1]
    docx_path = sys.argv[2]
    
    print("="*70)
    print("🎓 TURNITIN MATCH & PARAPHRASE Pipeline")
    print("="*70)
    
    # Step 1: Match
    matches = match_flagged_with_docx(flagged_json, docx_path, threshold=0.5)
    
    if not matches:
        print("\n⚠️  No matches found! Try lowering threshold.")
        return
    
    # Save matches
    matches_file = "testing_matches.json"
    with open(matches_file, 'w', encoding='utf-8') as f:
        json.dump(matches, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Matches saved to: {matches_file}")
    
    # Step 2: Paraphrase
    paraphrased = generate_paraphrased_results(matches)
    
    # Save paraphrased results
    output_file = "testing_paraphrased.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(paraphrased, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Paraphrased results saved to: {output_file}")
    
    # Summary
    print("\n" + "="*70)
    print("📊 SUMMARY")
    print("="*70)
    print(f"   Flagged texts : {len(matches)}")
    print(f"   Matched       : {len(matches)}")
    print(f"   Paraphrased   : {len(paraphrased)}")
    print(f"   Output JSON   : {output_file}")
    print("="*70)

if __name__ == "__main__":
    main()
