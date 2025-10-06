"""
Core module untuk paraphrase dengan IndoT5 dan invisible chars
"""

import torch
import random
from transformers import T5Tokenizer, T5ForConditionalGeneration
from typing import List, Dict

# Model cache
_model_cache = {}

def load_indot5_model():
    """Load IndoT5 model (cached)"""
    if 'model' not in _model_cache:
        model_name = "Wikidepia/IndoT5-base-paraphrase"
        tokenizer = T5Tokenizer.from_pretrained(model_name)
        model = T5ForConditionalGeneration.from_pretrained(model_name)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        _model_cache['tokenizer'] = tokenizer
        _model_cache['model'] = model
        _model_cache['device'] = device
    
    return _model_cache['tokenizer'], _model_cache['model'], _model_cache['device']

def paraphrase_with_indot5(text: str, max_length: int = 512) -> str:
    """Paraphrase dengan IndoT5"""
    tokenizer, model, device = load_indot5_model()
    
    inputs = tokenizer(
        f"parafrase: {text}",
        return_tensors="pt",
        max_length=max_length,
        truncation=True
    ).to(device)
    
    outputs = model.generate(
        **inputs,
        max_length=max_length,
        num_beams=5,
        early_stopping=True
    )
    
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

def add_invisible_chars(text: str, density: float = 0.3) -> str:
    """Add invisible characters (ZWSP, ZWNJ, ZWJ)"""
    invisible_chars = ['\u200B', '\u200C', '\u200D']
    words = text.split()
    
    result = []
    for word in words:
        if random.random() < density:
            invisible = random.choice(invisible_chars)
            insert_pos = random.randint(0, len(word))
            word = word[:insert_pos] + invisible + word[insert_pos:]
        result.append(word)
    
    return ' '.join(result)

def add_unicode_substitution(text: str, percentage: float = 0.1) -> str:
    """Add unicode lookalike substitution"""
    substitution_map = {
        'a': 'а', 'e': 'е', 'o': 'о',
        'p': 'р', 'c': 'с', 'x': 'х',
        'y': 'у'
    }
    
    chars = list(text)
    num_to_replace = int(len(chars) * percentage)
    
    for _ in range(num_to_replace):
        idx = random.randint(0, len(chars) - 1)
        char_lower = chars[idx].lower()
        if char_lower in substitution_map:
            if chars[idx].isupper():
                chars[idx] = substitution_map[char_lower].upper()
            else:
                chars[idx] = substitution_map[char_lower]
    
    return ''.join(chars)

def is_short_text(text: str, max_words: int = 5) -> bool:
    """Check if text is short (header)"""
    return len(text.split()) <= max_words

def categorize_and_process(matches: List[Dict]) -> List[Dict]:
    """
    Categorize matches dan process sesuai kategori
    - Short (≤5 words): invisible chars
    - Long (>5 words): IndoT5 paraphrase
    """
    results = []
    
    for match in matches:
        original = match['matched_text']
        
        if is_short_text(original):
            # Header: invisible chars
            bypassed = add_invisible_chars(original)
            method = 'invisible_chars'
        else:
            # Content: IndoT5
            bypassed = paraphrase_with_indot5(original)
            bypassed = add_unicode_substitution(bypassed)
            method = 'indot5_paraphrase'
        
        results.append({
            **match,
            'bypassed_text': bypassed,
            'method': method
        })
    
    return results
