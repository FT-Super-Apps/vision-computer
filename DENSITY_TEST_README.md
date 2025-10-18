# 🧪 HEADER BYPASS - DENSITY TESTING

## 📊 Test Files Created (5 variants)

| File | Density | Headers Modified | Strategy |
|------|---------|------------------|----------|
| `test_header_05percent.docx` | **5%** | 13 | ONLY invisible chars (ZWSP, ZWNJ, ZWJ) |
| `test_header_10percent.docx` | **10%** | 13 | ONLY invisible chars (ZWSP, ZWNJ, ZWJ) |
| `test_header_15percent.docx` | **15%** | 13 | ONLY invisible chars (ZWSP, ZWNJ, ZWJ) |
| `test_header_20percent.docx` | **20%** | 13 | ONLY invisible chars (ZWSP, ZWNJ, ZWJ) |
| `test_header_25percent.docx` | **25%** | 13 | ONLY invisible chars (ZWSP, ZWNJ, ZWJ) |

---

## ✅ Headers Detected (13 total):

1. **BAB I PENDAHULUAN**
2. **Latar Belakang**
3. **Rumusan Masalah**
4. **Tujuan Penelitian**
5. **Manfaat Penelitian**
6. **Secara Teoritis**
7. **Secara Praktis**
8. **Ruang Lingkup Penelitian**
9. Dan lainnya...

---

## 🎯 Testing Strategy

### **FOCUS:** Headers Only (NO IndoT5 paraphrase)

**Why?**
- Previous test: 30% invisible + 15% unicode → **OCR CORRUPT!**
- Headers masih ke-flag karena Turnitin re-OCR → text rusak
- Need to find **sweet spot** density

### **Changes from Previous:**
- ❌ **DISABLED:** Unicode substitution (Cyrillic lookalikes)
- ❌ **DISABLED:** IndoT5 content paraphrase
- ✅ **ENABLED:** ONLY invisible chars (ZWSP, ZWNJ, ZWJ)
- ✅ **TEST:** 5 different densities (5% - 25%)

---

## 📝 Testing Protocol

### **Upload Sequence:**

1. Upload **test_header_05percent.docx** → Check flags
2. Upload **test_header_10percent.docx** → Check flags
3. Upload **test_header_15percent.docx** → Check flags
4. Upload **test_header_20percent.docx** → Check flags
5. Upload **test_header_25percent.docx** → Check flags

### **What to Measure:**

| Metric | Expected Result |
|--------|----------------|
| **Headers flagged** | Should DECREASE as density increases |
| **OCR corruption** | Should be MINIMAL (no "Patar Belakang", etc) |
| **Sweet spot** | Headers bypass BUT text still readable by OCR |

### **Success Criteria:**

✅ Headers (BAB I, Latar Belakang, etc.) **NOT flagged**  
✅ OCR reads text correctly (no corruption)  
✅ Similarity score **decreases**

---

## 🔍 Expected Outcomes

### **Hypothesis:**

| Density | Headers Bypass | OCR Quality | Overall |
|---------|---------------|-------------|---------|
| **5%** | ❓ Maybe | ✅ Good | Low effectiveness |
| **10%** | ❓ Maybe | ✅ Good | **RECOMMENDED** |
| **15%** | ✅ Yes | ✅ Good | **OPTIMAL?** |
| **20%** | ✅ Yes | ⚠️ Maybe OK | Borderline |
| **25%** | ✅ Yes | ❌ Corrupt | Too aggressive |

**Target:** Find density where:
- Headers invisible to Turnitin
- OCR still reads text correctly

---

## 📤 Next Steps

1. **Upload all 5 files** to Turnitin (one by one)
2. **Download reports** for each
3. **Compare results:**
   - Which density bypasses headers?
   - Which density doesn't corrupt OCR?
4. **Select optimal density** (probably 10-15%)
5. **Apply to full pipeline** with content paraphrase

---

## 🎓 After Finding Optimal Density

Once we find sweet spot (e.g., 10%):

```bash
# Apply optimal density to headers
python enhanced_header_bypass.py original.docx output.docx 0.10 0.00

# Then add content paraphrase separately
python match_and_paraphrase_indot5.py turnitin_flagged.json output.docx
python apply_to_docx.py testing_paraphrased.json output.docx final.docx
```

---

## 📊 Previous Test Results (Reference)

| Test | Strategy | Result | Issue |
|------|----------|--------|-------|
| Test 1 | 30% invisible + 15% unicode | 38% similarity | OCR corrupt → MORE flags |
| Test 2 | Headers only (30% + 15%) | Headers still flagged | "Patar Belakang" OCR error |
| **Test 3** | **5-25% invisible ONLY** | **Testing now** | **Find optimal density** |

---

**Goal:** Solve header bypass **FIRST**, then add content paraphrase! 🎯
