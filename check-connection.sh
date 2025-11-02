#!/bin/bash

# Connection Check Script
# Verify all services are running and connected

echo "=========================================="
echo "  🔍 Checking System Connections"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
FAILED=0

# Function to check service
check_service() {
    local name=$1
    local test_command=$2
    local expected=$3

    echo -n "Checking $name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

# 1. Check Redis
echo "1️⃣ Redis Service"
check_service "Redis connection" "redis-cli ping | grep -q PONG"

# 2. Check PostgreSQL
echo ""
echo "2️⃣ PostgreSQL Service"
check_service "PostgreSQL running" "pg_isready -q"

# 3. Check Python Backend API
echo ""
echo "3️⃣ Python Backend API (Port 8000)"
check_service "Backend API health" "curl -s http://localhost:8000/health | grep -q 'healthy'"

if [ $? -eq 0 ]; then
    # Check API with key
    API_KEY=$(grep PYTHON_API_KEY frontend/.env 2>/dev/null | cut -d'=' -f2 | tr -d '"')
    if [ -n "$API_KEY" ]; then
        echo -n "   Testing API with key... "
        if curl -s -H "X-API-Key: $API_KEY" http://localhost:8000/health | grep -q 'healthy'; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ FAILED (API key invalid)${NC}"
        fi
    fi
fi

# 4. Check Celery Worker
echo ""
echo "4️⃣ Celery Worker"
echo -n "Checking Celery worker... "
if ps aux | grep -q "[c]elery.*worker"; then
    echo -e "${GREEN}✅ Running${NC}"
    ((SUCCESS++))

    # Check registered queues
    cd backend 2>/dev/null && source venv/bin/activate 2>/dev/null
    echo -n "   Checking queues... "
    if celery -A app.celery_app inspect active 2>/dev/null | grep -q "celery@"; then
        echo -e "${GREEN}✅ Active${NC}"

        # Check if listening to 'unified' queue
        echo -n "   Checking 'unified' queue... "
        if celery -A app.celery_app inspect active_queues 2>/dev/null | grep -q "unified"; then
            echo -e "${GREEN}✅ Configured${NC}"
        else
            echo -e "${RED}❌ Not listening to 'unified' queue${NC}"
            echo -e "${YELLOW}   Fix: Restart Celery with: celery -A app.celery_app worker -Q unified --loglevel=info${NC}"
        fi
    else
        echo -e "${RED}❌ Not responding${NC}"
    fi
else
    echo -e "${RED}❌ Not running${NC}"
    ((FAILED++))
fi

# 5. Check Frontend (Next.js)
echo ""
echo "5️⃣ Frontend Next.js (Port 3000)"
check_service "Frontend running" "curl -s http://localhost:3000 | grep -q 'Rumah Plagiasi'"

# 6. Check Environment Variables
echo ""
echo "6️⃣ Environment Variables"

# Backend .env
echo -n "Backend .env exists... "
if [ -f backend/.env ]; then
    echo -e "${GREEN}✅ OK${NC}"
    ((SUCCESS++))

    # Check API_KEY
    echo -n "   API_KEY set... "
    if grep -q "API_KEY=" backend/.env; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ Missing${NC}"
    fi
else
    echo -e "${RED}❌ Missing${NC}"
    ((FAILED++))
fi

# Frontend .env
echo -n "Frontend .env exists... "
if [ -f frontend/.env ]; then
    echo -e "${GREEN}✅ OK${NC}"
    ((SUCCESS++))

    # Check PYTHON_API_KEY
    echo -n "   PYTHON_API_KEY set... "
    if grep -q "PYTHON_API_KEY=" frontend/.env; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ Missing${NC}"
    fi

    # Check if keys match
    echo -n "   API keys match... "
    BACKEND_KEY=$(grep "^API_KEY=" backend/.env 2>/dev/null | cut -d'=' -f2)
    FRONTEND_KEY=$(grep "^PYTHON_API_KEY=" frontend/.env 2>/dev/null | cut -d'=' -f2)

    if [ "$BACKEND_KEY" = "$FRONTEND_KEY" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ Mismatch${NC}"
        echo -e "${YELLOW}   Backend: ${BACKEND_KEY:0:20}...${NC}"
        echo -e "${YELLOW}   Frontend: ${FRONTEND_KEY:0:20}...${NC}"
    fi
else
    echo -e "${RED}❌ Missing${NC}"
    ((FAILED++))
fi

# 7. Check Database Connection
echo ""
echo "7️⃣ Database Connection"
echo -n "Checking database... "
cd frontend 2>/dev/null
if npm run prisma -- db execute --stdin <<< "SELECT 1" 2>/dev/null | grep -q "1"; then
    echo -e "${GREEN}✅ Connected${NC}"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠️  Cannot verify (might need manual check)${NC}"
fi

# 8. Test Full Integration
echo ""
echo "8️⃣ Integration Test"
echo -n "Testing backend → frontend flow... "

# Create test job via backend
if [ -n "$API_KEY" ]; then
    TEST_RESPONSE=$(curl -s -H "X-API-Key: $API_KEY" http://localhost:8000/health)
    if echo "$TEST_RESPONSE" | grep -q "healthy"; then
        echo -e "${GREEN}✅ OK${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "   Response: $TEST_RESPONSE"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (no API key)${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo "  📊 Summary"
echo "=========================================="
echo -e "✅ Passed: ${GREEN}$SUCCESS${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All systems operational!${NC}"
    echo ""
    echo "You can now:"
    echo "  1. Access frontend: http://localhost:3000"
    echo "  2. Access backend API: http://localhost:8000/docs"
    echo "  3. Upload documents and monitor progress"
    exit 0
else
    echo -e "${RED}⚠️  Some services need attention${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Redis: sudo systemctl start redis-server"
    echo "  • Backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
    echo "  • Celery: cd backend && source venv/bin/activate && celery -A app.celery_app worker -Q unified --loglevel=info"
    echo "  • Frontend: cd frontend && npm run dev"
    echo ""
    echo "For detailed guide: see API_KEY_SETUP.md and QUICK_START.md"
    exit 1
fi
