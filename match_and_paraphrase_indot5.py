#!/usr/bin/env python3
"""
Complete Turnitin Pipeline: Extract → Match → Paraphrase with IndoT5
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

def paraphrase_with_indot5(text, tokenizer, model, device, max_length=512):
    """Paraphrase text using IndoT5"""
    input_text = f"paraphrase: {text}"
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=max_length,
        truncation=True,
        padding=True
    ).to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_length=max_length,
            num_beams=5,
            early_stopping=True,
            no_repeat_ngram_size=2
        )
    
    paraphrased = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return paraphrased

def add_unicode_substitution(text, percentage=0.1):
    """Add unicode lookalike substitution"""
    import random
    
    lookalikes = {
        'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р',
        'c': 'с', 'x': 'х', 'y': 'у'
    }
    
    chars = list(text)
    num_replacements = int(len(chars) * percentage)
    replaceable_indices = [i for i, c in enumerate(chars) if c.lower() in lookalikes]
    
    if replaceable_indices:
        indices = random.sample(replaceable_indices, min(num_replacements, len(replaceable_indices)))
        for idx in indices:
            char = chars[idx]
            replacement = lookalikes[char.lower()]
            if char.isupper():
                replacement = replacement.upper()
            chars[idx] = replacement
    
    return ''.join(chars)

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
            if i <= 3:
                print(f"   ✅ Match {i}: {best_ratio*100:.1f}%")
    
    print(f"\n✅ Total matches: {len(matches)}/{len(flagged_texts)}")
    return matches

def add_invisible_chars(text, density=0.3):
    """Add invisible zero-width characters"""
    import random
    
    invisible_chars = [
        '\u200B',  # Zero Width Space
        '\u200C',  # Zero Width Non-Joiner
        '\u200D',  # Zero Width Joiner
    ]
    
    chars = list(text)
    positions = []
    
    # Insert after each character with probability = density
    for i in range(len(chars)):
        if random.random() < density and chars[i] not in [' ', '\n', '\t']:
            positions.append(i)
    
    # Insert invisible chars (reverse order to maintain positions)
    for pos in reversed(positions):
        invisible = random.choice(invisible_chars)
        chars.insert(pos + 1, invisible)
    
    return ''.join(chars)

def is_short_text(text, max_words=5):
    """Check if text is short (header/title)"""
    words = text.split()
    return len(words) <= max_words

def categorize_and_process(matches):
    """Categorize matches into headers (short) vs content (long)"""
    headers = []
    contents = []
    
    for match in matches:
        text = match['matched_para']
        if is_short_text(text, max_words=5):
            headers.append(match)
        else:
            contents.append(match)
    
    return headers, contents

def generate_paraphrased_results(matches, use_indot5=True):
    """Generate paraphrased versions with smart categorization"""
    results = []
    
    # Categorize
    headers, contents = categorize_and_process(matches)
    
    print(f"\n📊 Categorization:")
    print(f"   Headers (≤5 words) : {len(headers)} → Use invisible chars")
    print(f"   Contents (>5 words): {len(contents)} → Use IndoT5 paraphrase")
    
    # Process headers with invisible chars
    print(f"\n🔤 Processing headers with invisible characters...")
    for match in tqdm(headers, desc="Headers"):
        original = match['matched_para']
        final = add_invisible_chars(original, density=0.3)
        
        result = {
            "original": original,
            "paraphrased": final,
            "method": "invisible_chars",
            "page": match['page'],
            "similarity_before": match['similarity'],
            "para_index": match['para_index']
        }
        results.append(result)
    
    # Process contents with IndoT5
    if contents and use_indot5:
        print(f"\n🎨 Paraphrasing contents with IndoT5...")
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
                        para = paraphrase_with_indot5(sent, tokenizer, model, device)
                        paraphrased_parts.append(para)
                paraphrased = ' '.join(paraphrased_parts)
            else:
                paraphrased = paraphrase_with_indot5(original, tokenizer, model, device)
            
            # Add unicode substitution
            final = add_unicode_substitution(paraphrased, percentage=0.1)
            
            result = {
                "original": original,
                "paraphrased": final,
                "method": "indot5_paraphrase",
                "page": match['page'],
                "similarity_before": match['similarity'],
                "para_index": match['para_index']
            }
            results.append(result)
    
    return results

def main():
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python match_and_paraphrase.py <flagged.json> <original.docx>")
        sys.exit(1)
    
    flagged_json = sys.argv[1]
    docx_path = sys.argv[2]
    
    print("="*70)
    print("🎓 TURNITIN MATCH & PARAPHRASE with IndoT5")
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
    
    # Step 2: Paraphrase with IndoT5
    paraphrased = generate_paraphrased_results(matches, use_indot5=True)
    
    # Save results
    output_file = "testing_paraphrased.json"
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
    print("="*70)

if __name__ == "__main__":
    main()
