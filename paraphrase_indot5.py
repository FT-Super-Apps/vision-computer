#!/usr/bin/env python3
"""
Paraphrase menggunakan IndoT5 dari Hugging Face
Model: Wikidepia/IndoT5-base-paraphrase
"""

import json
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from tqdm import tqdm

def load_indot5_model(model_name="Wikidepia/IndoT5-base-paraphrase"):
    """Load IndoT5 paraphrase model"""
    print(f"🔧 Loading model: {model_name}")
    print("   (First time will download ~900MB, please wait...)")
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    
    # Use GPU if available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)
    
    print(f"✅ Model loaded successfully on {device}!")
    return tokenizer, model, device

def paraphrase_with_indot5(text, tokenizer, model, device, max_length=512, num_beams=5):
    """
    Paraphrase text menggunakan IndoT5
    
    Args:
        text: Text yang akan di-paraphrase
        tokenizer: IndoT5 tokenizer
        model: IndoT5 model
        device: cuda atau cpu
        max_length: Max length untuk generation
        num_beams: Beam search untuk kualitas lebih baik
    
    Returns:
        Paraphrased text
    """
    # Prepare input
    input_text = f"paraphrase: {text}"
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=max_length,
        truncation=True,
        padding=True
    ).to(device)
    
    # Generate paraphrase
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_length=max_length,
            num_beams=num_beams,
            early_stopping=True,
            no_repeat_ngram_size=2,
            temperature=0.8,
            do_sample=False  # Deterministic untuk consistency
        )
    
    # Decode output
    paraphrased = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return paraphrased

def add_unicode_substitution(text, percentage=0.15):
    """Tambahan: Replace beberapa huruf dengan unicode lookalike"""
    import random
    
    lookalikes = {
        'a': 'а',  # Cyrillic a
        'e': 'е',  # Cyrillic e
        'o': 'о',  # Cyrillic o
        'p': 'р',  # Cyrillic p
        'c': 'с',  # Cyrillic c
        'x': 'х',  # Cyrillic x
        'y': 'у',  # Cyrillic y
    }
    
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
            if char.isupper():
                replacement = replacement.upper()
            chars[idx] = replacement
    
    return ''.join(chars)

def paraphrase_matches(matches_json, output_json, use_unicode=True):
    """
    Paraphrase semua matched texts menggunakan IndoT5
    
    Args:
        matches_json: File JSON hasil matching
        output_json: Output file untuk hasil paraphrase
        use_unicode: Apakah tambahkan unicode substitution
    """
    # Load matches
    with open(matches_json, 'r', encoding='utf-8') as f:
        matches = json.load(f)
    
    print(f"\n📊 Total matches to paraphrase: {len(matches)}")
    
    # Load model
    tokenizer, model, device = load_indot5_model()
    
    print("\n🎨 Starting paraphrase process...")
    print("="*70)
    
    results = []
    
    for i, match in enumerate(tqdm(matches, desc="Paraphrasing"), 1):
        original = match['matched_para']
        
        # Skip if too long (split jika perlu)
        if len(original) > 400:
            # Split into sentences
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
            # Paraphrase langsung
            paraphrased = paraphrase_with_indot5(original, tokenizer, model, device)
        
        # Optional: Add unicode substitution untuk extra protection
        if use_unicode:
            final_text = add_unicode_substitution(paraphrased, percentage=0.1)
        else:
            final_text = paraphrased
        
        result = {
            "original": original,
            "paraphrased_indot5": paraphrased,
            "final": final_text,
            "page": match['page'],
            "similarity_before": match['similarity'],
            "para_index": match['para_index']
        }
        
        results.append(result)
        
        # Show preview
        if i <= 3:
            print(f"\n📝 Example {i}:")
            print(f"   Original  : {original[:80]}...")
            print(f"   IndoT5    : {paraphrased[:80]}...")
            print(f"   Final     : {final_text[:80]}...")
    
    # Save results
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*70)
    print("✅ PARAPHRASE COMPLETE!")
    print("="*70)
    print(f"📊 Total paraphrased: {len(results)}")
    print(f"💾 Output saved to: {output_json}")
    print("="*70)

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python paraphrase_indot5.py <matches.json> [output.json]")
        print("\nExample:")
        print("  python paraphrase_indot5.py testing_matches.json testing_indot5.json")
        sys.exit(1)
    
    matches_json = sys.argv[1]
    output_json = sys.argv[2] if len(sys.argv) > 2 else "paraphrased_indot5.json"
    
    print("="*70)
    print("🎓 TURNITIN PARAPHRASE with IndoT5")
    print("="*70)
    print(f"Input  : {matches_json}")
    print(f"Output : {output_json}")
    print(f"Model  : Wikidepia/IndoT5-base-paraphrase")
    print("="*70)
    
    paraphrase_matches(matches_json, output_json, use_unicode=True)

if __name__ == "__main__":
    main()
