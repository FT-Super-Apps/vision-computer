#!/usr/bin/env python3
"""
IndoT5 Aggressive Paraphrase
Multiple paraphrase rounds for maximum difference
"""

from docx import Document
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re
from difflib import SequenceMatcher

class AggressiveParaphraser:
    def __init__(self):
        print("🔄 Loading IndoT5 model...")
        model_name = "Wikidepia/IndoT5-base-paraphrase"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        print(f"✅ Model loaded on {self.device}")
    
    def paraphrase_aggressive(self, text, rounds=2):
        """Multiple rounds of paraphrasing for maximum change"""
        if len(text.strip()) < 10:
            return text
        
        current_text = text
        
        for round_num in range(rounds):
            # Prepare input
            input_text = f"paraphrase: {current_text}"
            inputs = self.tokenizer(
                input_text,
                return_tensors="pt",
                max_length=512,
                truncation=True
            ).to(self.device)
            
            # Generate with high diversity
            outputs = self.model.generate(
                inputs.input_ids,
                max_length=512,
                num_beams=10,
                num_return_sequences=5,  # Generate 5 candidates
                temperature=1.2,  # High temperature for diversity
                do_sample=True,
                top_k=100,
                top_p=0.95,
                repetition_penalty=1.5,
                no_repeat_ngram_size=2,
                early_stopping=False
            )
            
            # Get all candidates
            candidates = []
            for output in outputs:
                candidate = self.tokenizer.decode(output, skip_special_tokens=True)
                similarity = SequenceMatcher(None, text.lower(), candidate.lower()).ratio()
                candidates.append((candidate, similarity))
            
            # Sort by similarity (ascending - pick most different)
            candidates.sort(key=lambda x: x[1])
            
            # Pick most different candidate
            current_text = candidates[0][0]
            
            print(f"      Round {round_num+1}: similarity={candidates[0][1]*100:.1f}%")
        
        return current_text

def normalize_text(text):
    """Normalize text - remove Cyrillic and special chars"""
    # Convert Cyrillic to Latin
    cyrillic_map = {
        'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'К': 'K', 
        'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X', 'У': 'Y',
        'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y',
        'І': 'I', 'і': 'i'
    }
    
    for cyr, lat in cyrillic_map.items():
        text = text.replace(cyr, lat)
    
    # Remove invisible chars
    text = text.replace('\u200B', '').replace('\u200C', '').replace('\u200D', '')
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove punctuation for comparison
    text = re.sub(r'[^\w\s]', '', text)
    
    return text.lower().strip()

def find_paragraph_for_flag(flag_text, paragraphs):
    """Find paragraph containing flagged text"""
    flag_normalized = normalize_text(flag_text)
    
    # Skip if too short
    if len(flag_normalized) < 5:
        return None, None
    
    best_match = None
    best_similarity = 0.0
    
    for i, para in enumerate(paragraphs):
        if not para.text.strip():
            continue
        
        para_normalized = normalize_text(para.text)
        
        # Check if flag is contained in paragraph
        if flag_normalized in para_normalized:
            return i, para
        
        # Check similarity
        similarity = SequenceMatcher(None, flag_normalized, para_normalized).ratio()
        
        if similarity > best_similarity:
            best_similarity = similarity
            best_match = (i, para)
    
    # Return if similarity > 60%
    if best_similarity > 0.6:
        return best_match
    
    return None, None

def process_document(input_docx, flag_file, output_docx):
    """Process document with aggressive paraphrasing"""
    
    print("\n" + "="*70)
    print("🎯 INDOT5 AGGRESSIVE PARAPHRASE")
    print("="*70)
    print(f"Input  : {input_docx}")
    print(f"Flags  : {flag_file}")
    print(f"Output : {output_docx}")
    print("="*70 + "\n")
    
    # Load flagged texts
    with open(flag_file, 'r', encoding='utf-8') as f:
        flagged_texts = [line.strip() for line in f if line.strip()]
    
    print(f"📋 Loaded {len(flagged_texts)} flagged texts\n")
    
    # Initialize paraphraser
    paraphraser = AggressiveParaphraser()
    
    # Load document
    doc = Document(input_docx)
    
    modified_paras = set()  # Track modified paragraphs
    
    print("🔧 Processing flagged texts...\n")
    
    for flag_idx, flag_text in enumerate(flagged_texts, 1):
        print(f"\n{'='*70}")
        print(f"🎯 Flag #{flag_idx}/{len(flagged_texts)}")
        print(f"Text: {flag_text[:80]}...")
        print("-"*70)
        
        # Find paragraph containing this flag
        para_idx, para = find_paragraph_for_flag(flag_text, doc.paragraphs)
        
        if para is None:
            print("⚠️  Paragraph not found - skipping")
            continue
        
        # Skip if already modified
        if para_idx in modified_paras:
            print(f"ℹ️  Para #{para_idx+1} already modified - skipping")
            continue
        
        original_text = para.text
        
        print(f"📝 Found in Para #{para_idx+1}")
        print(f"   Original ({len(original_text)} chars): {original_text[:80]}...")
        
        # Aggressive paraphrase (2 rounds)
        print(f"   🔄 Aggressive paraphrasing (2 rounds)...")
        paraphrased = paraphraser.paraphrase_aggressive(original_text, rounds=2)
        
        # Calculate change
        similarity = SequenceMatcher(None, original_text.lower(), paraphrased.lower()).ratio()
        
        print(f"\n✅ Paragraph modified!")
        print(f"   Final similarity: {similarity*100:.1f}%")
        print(f"   Paraphrased ({len(paraphrased)} chars): {paraphrased[:80]}...")
        
        # Update paragraph
        para.text = paraphrased
        modified_paras.add(para_idx)
    
    # Save document
    print(f"\n💾 Saving to: {output_docx}")
    doc.save(output_docx)
    
    # Summary
    print("\n" + "="*70)
    print("✅ AGGRESSIVE PARAPHRASE COMPLETE!")
    print("="*70)
    print(f"📊 Statistics:")
    print(f"   Flagged texts       : {len(flagged_texts)}")
    print(f"   Paragraphs modified : {len(modified_paras)}")
    print(f"   Success rate        : {(len(modified_paras)/len(flagged_texts)*100):.1f}%")
    print()
    print(f"🎯 Strategy:")
    print(f"   • 2 rounds of paraphrasing per paragraph")
    print(f"   • 5 candidates generated per round")
    print(f"   • Pick most different result each round")
    print(f"   • High temperature (1.2) for diversity")
    print()
    print(f"📄 Output: {output_docx}")
    print("="*70)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 4:
        print("Usage: python indot5_aggressive_paraphrase.py <input.docx> <flags.txt> <output.docx>")
        print()
        print("Example:")
        print("  python indot5_aggressive_paraphrase.py original.docx flag_new.txt original_indot5_aggressive.docx")
        sys.exit(1)
    
    input_file = sys.argv[1]
    flag_file = sys.argv[2]
    output_file = sys.argv[3]
    
    process_document(input_file, flag_file, output_file)
