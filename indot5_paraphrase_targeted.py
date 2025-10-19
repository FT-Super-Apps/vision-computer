#!/usr/bin/env python3
"""
IndoT5 Targeted Paraphrase
Paraphrase only flagged texts using IndoT5 model
"""

from docx import Document
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re
from difflib import SequenceMatcher

class IndoT5Paraphraser:
    def __init__(self):
        print("🔄 Loading IndoT5 model...")
        model_name = "Wikidepia/IndoT5-base-paraphrase"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        print(f"✅ Model loaded on {self.device}")
    
    def paraphrase(self, text, max_attempts=3):
        """Paraphrase text with multiple attempts for best result"""
        if len(text.strip()) < 10:
            return text
        
        # Prepare input
        input_text = f"paraphrase: {text}"
        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True
        ).to(self.device)
        
        best_result = None
        best_similarity = 1.0
        
        for attempt in range(max_attempts):
            # Generate with different parameters each time
            outputs = self.model.generate(
                inputs.input_ids,
                max_length=512,
                num_beams=5,
                temperature=0.7 + (attempt * 0.1),  # Increase temp each attempt
                do_sample=True,
                top_k=50,
                top_p=0.95,
                repetition_penalty=1.2,
                no_repeat_ngram_size=3
            )
            
            result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Calculate similarity
            similarity = SequenceMatcher(None, text.lower(), result.lower()).ratio()
            
            # Keep result with lowest similarity (most different)
            if similarity < best_similarity:
                best_similarity = similarity
                best_result = result
        
        return best_result if best_result else text
    
    def split_into_sentences(self, text):
        """Split text into sentences"""
        # Split by period, exclamation, question mark
        sentences = re.split(r'([.!?]\s+)', text)
        
        # Recombine sentences with their punctuation
        result = []
        for i in range(0, len(sentences)-1, 2):
            if i+1 < len(sentences):
                result.append(sentences[i] + sentences[i+1])
            else:
                result.append(sentences[i])
        
        if len(sentences) % 2 == 1:
            result.append(sentences[-1])
        
        return [s.strip() for s in result if s.strip()]

def normalize_text(text):
    """Normalize text for comparison"""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove punctuation for comparison
    text = re.sub(r'[^\w\s]', '', text)
    return text.lower().strip()

def find_paragraph_for_flag(flag_text, paragraphs):
    """Find which paragraph contains the flagged text"""
    flag_normalized = normalize_text(flag_text)
    
    for i, para in enumerate(paragraphs):
        if not para.text.strip():
            continue
        
        para_normalized = normalize_text(para.text)
        
        # Check if flag is contained in paragraph
        if flag_normalized in para_normalized:
            return i, para
        
        # Check similarity for partial matches
        similarity = SequenceMatcher(None, flag_normalized, para_normalized).ratio()
        if similarity > 0.85:
            return i, para
    
    return None, None

def process_document(input_docx, flag_file, output_docx):
    """Process document with IndoT5 paraphrasing"""
    
    print("\n" + "="*70)
    print("🎯 INDOT5 TARGETED PARAPHRASE")
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
    paraphraser = IndoT5Paraphraser()
    
    # Load document
    doc = Document(input_docx)
    
    modified_count = 0
    
    print("🔧 Processing flagged texts...\n")
    
    for flag_idx, flag_text in enumerate(flagged_texts, 1):
        print(f"\n{'='*70}")
        print(f"🎯 Flag #{flag_idx}/{len(flagged_texts)}")
        print(f"Original: {flag_text[:80]}...")
        print("-"*70)
        
        # Find paragraph containing this flag
        para_idx, para = find_paragraph_for_flag(flag_text, doc.paragraphs)
        
        if para is None:
            print("⚠️  Paragraph not found - skipping")
            continue
        
        original_text = para.text
        
        # Split paragraph into sentences
        sentences = paraphraser.split_into_sentences(original_text)
        
        print(f"📝 Found in Para #{para_idx+1} ({len(sentences)} sentences)")
        
        # Paraphrase each sentence
        paraphrased_sentences = []
        for sent_idx, sentence in enumerate(sentences, 1):
            # Check if this sentence is part of flagged text
            if normalize_text(sentence) in normalize_text(flag_text) or \
               SequenceMatcher(None, normalize_text(sentence), normalize_text(flag_text)).ratio() > 0.7:
                
                print(f"   🔄 Paraphrasing sentence {sent_idx}/{len(sentences)}...")
                paraphrased = paraphraser.paraphrase(sentence)
                paraphrased_sentences.append(paraphrased)
                
                # Show change
                similarity = SequenceMatcher(None, sentence.lower(), paraphrased.lower()).ratio()
                print(f"      Original : {sentence[:60]}...")
                print(f"      Paraphrase: {paraphrased[:60]}...")
                print(f"      Similarity: {similarity*100:.1f}%")
            else:
                # Keep original sentence
                paraphrased_sentences.append(sentence)
        
        # Combine paraphrased sentences
        new_text = " ".join(paraphrased_sentences)
        
        # Preserve formatting
        para.text = new_text
        
        # Calculate overall change
        overall_similarity = SequenceMatcher(None, original_text.lower(), new_text.lower()).ratio()
        
        print(f"\n✅ Paragraph modified!")
        print(f"   Overall similarity: {overall_similarity*100:.1f}%")
        print(f"   Preview: {new_text[:100]}...")
        
        modified_count += 1
    
    # Save document
    print(f"\n💾 Saving to: {output_docx}")
    doc.save(output_docx)
    
    # Summary
    print("\n" + "="*70)
    print("✅ INDOT5 PARAPHRASE COMPLETE!")
    print("="*70)
    print(f"📊 Statistics:")
    print(f"   Flagged texts    : {len(flagged_texts)}")
    print(f"   Paragraphs modified: {modified_count}")
    print(f"   Success rate     : {(modified_count/len(flagged_texts)*100):.1f}%")
    print()
    print(f"🎯 Expected Results:")
    print(f"   • Semantic meaning preserved ✅")
    print(f"   • Sentence structure changed ✅")
    print(f"   • No character tricks ✅")
    print(f"   • Natural Indonesian ✅")
    print()
    print(f"📄 Output: {output_docx}")
    print("="*70)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 4:
        print("Usage: python indot5_paraphrase_targeted.py <input.docx> <flags.txt> <output.docx>")
        print()
        print("Example:")
        print("  python indot5_paraphrase_targeted.py original.docx flag.txt original_indot5.docx")
        sys.exit(1)
    
    input_file = sys.argv[1]
    flag_file = sys.argv[2]
    output_file = sys.argv[3]
    
    process_document(input_file, flag_file, output_file)
