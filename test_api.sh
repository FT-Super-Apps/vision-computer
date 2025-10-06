#!/bin/bash
# Script untuk test FastAPI Backend

BASE_URL="http://localhost:8000"

echo "========================================="
echo "Turnitin Bypass API Test Script"
echo "========================================="
echo ""

# Check if files exist
if [ ! -f "testing.pdf" ] || [ ! -f "testing.docx" ]; then
    echo "❌ Error: testing.pdf atau testing.docx tidak ditemukan!"
    echo "Letakkan file testing di directory /workspaces/vision-computer/"
    exit 1
fi

# 1. Health check
echo "1️⃣  Checking API health..."
HEALTH=$(curl -s $BASE_URL/)
echo "$HEALTH" | python -m json.tool
echo ""

# 2. Upload files
echo "2️⃣  Uploading files..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/process" \
  -F "pdf_file=@testing.pdf" \
  -F "docx_file=@testing.docx")

JOB_ID=$(echo $RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['job_id'])")
echo "✅ Job created: $JOB_ID"
echo ""

# 3. Poll status
echo "3️⃣  Processing (polling status every 5 seconds)..."
while true; do
  STATUS_RESPONSE=$(curl -s "$BASE_URL/api/v1/status/$JOB_ID")
  CURRENT_STATUS=$(echo $STATUS_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "unknown")
  PROGRESS=$(echo $STATUS_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin).get('progress', 0))" 2>/dev/null || echo "0")
  STAGE=$(echo $STATUS_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin).get('stage', 'N/A'))" 2>/dev/null || echo "N/A")
  
  echo "   Status: $CURRENT_STATUS | Stage: $STAGE | Progress: $PROGRESS%"
  
  if [ "$CURRENT_STATUS" = "completed" ]; then
    echo "✅ Processing completed!"
    break
  elif [ "$CURRENT_STATUS" = "failed" ]; then
    echo "❌ Processing failed!"
    ERROR=$(echo $STATUS_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin).get('error', 'Unknown error'))")
    echo "   Error: $ERROR"
    exit 1
  fi
  
  sleep 5
done
echo ""

# 4. Get result
echo "4️⃣  Getting result summary..."
RESULT=$(curl -s "$BASE_URL/api/v1/result/$JOB_ID")
echo "$RESULT" | python -m json.tool
echo ""

# 5. Download output
echo "5️⃣  Downloading bypassed DOCX..."
curl -s -o "testing_bypassed_api.docx" "$BASE_URL/api/v1/download/$JOB_ID"
SIZE=$(du -h testing_bypassed_api.docx | cut -f1)
echo "✅ Downloaded: testing_bypassed_api.docx ($SIZE)"
echo ""

# 6. Download JSON files
echo "6️⃣  Downloading intermediate JSON files..."
curl -s -o "flagged.json" "$BASE_URL/api/v1/download/$JOB_ID/json/flagged"
curl -s -o "matches.json" "$BASE_URL/api/v1/download/$JOB_ID/json/matches"
curl -s -o "paraphrased.json" "$BASE_URL/api/v1/download/$JOB_ID/json/paraphrased"
echo "✅ Downloaded: flagged.json, matches.json, paraphrased.json"
echo ""

echo "========================================="
echo "✅ Test completed successfully!"
echo "========================================="
echo ""
echo "Files generated:"
echo "  - testing_bypassed_api.docx (final output)"
echo "  - flagged.json (extracted flagged texts)"
echo "  - matches.json (matched with DOCX)"
echo "  - paraphrased.json (paraphrased results)"
echo ""
echo "Upload testing_bypassed_api.docx ke Turnitin!"
