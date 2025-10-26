#!/bin/bash

# Anti-Plagiasi System Integration Verification Script
# This script verifies that all components are properly integrated

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Anti-Plagiasi System Integration Verification  "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        if [ -n "$3" ]; then
            echo -e "  ${YELLOW}→${NC} $3"
        fi
    fi
}

# Function to check if service is running
check_service() {
    local service=$1
    local url=$2

    if curl -s -f "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

echo -e "\n${BLUE}1. Checking Prerequisites${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check PostgreSQL
if pg_isready > /dev/null 2>&1; then
    print_status 0 "PostgreSQL is running"
else
    print_status 1 "PostgreSQL is not running" "Start with: sudo systemctl start postgresql"
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    print_status 0 "Redis is running"
else
    print_status 1 "Redis is not running" "Start with: sudo systemctl start redis"
fi

# Check Node.js
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js is installed ($NODE_VERSION)"
else
    print_status 1 "Node.js is not installed"
fi

# Check Python
if command -v python3 > /dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    print_status 0 "Python is installed ($PYTHON_VERSION)"
else
    print_status 1 "Python is not installed"
fi

echo -e "\n${BLUE}2. Checking File Structure${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check backend directories
[ -d "$PROJECT_ROOT/backend" ] && print_status 0 "Backend directory exists" || print_status 1 "Backend directory missing"
[ -d "$PROJECT_ROOT/backend/app" ] && print_status 0 "Backend app directory exists" || print_status 1 "Backend app directory missing"
[ -d "$PROJECT_ROOT/backend/uploads" ] && print_status 0 "Backend uploads directory exists" || print_status 1 "Backend uploads directory missing"
[ -d "$PROJECT_ROOT/backend/outputs" ] && print_status 0 "Backend outputs directory exists" || print_status 1 "Backend outputs directory missing"

# Check frontend directories
[ -d "$PROJECT_ROOT/frontend" ] && print_status 0 "Frontend directory exists" || print_status 1 "Frontend directory missing"
[ -d "$PROJECT_ROOT/frontend/app" ] && print_status 0 "Frontend app directory exists" || print_status 1 "Frontend app directory missing"
[ -d "$PROJECT_ROOT/frontend/prisma" ] && print_status 0 "Frontend prisma directory exists" || print_status 1 "Frontend prisma directory missing"

# Check key files
[ -f "$PROJECT_ROOT/backend/app/database_client.py" ] && print_status 0 "Database client exists" || print_status 1 "Database client missing"
[ -f "$PROJECT_ROOT/frontend/lib/auth.ts" ] && print_status 0 "Auth configuration exists" || print_status 1 "Auth configuration missing"
[ -f "$PROJECT_ROOT/frontend/app/admin/page.tsx" ] && print_status 0 "Admin dashboard exists" || print_status 1 "Admin dashboard missing"
[ -f "$PROJECT_ROOT/frontend/prisma/seed.ts" ] && print_status 0 "Database seed script exists" || print_status 1 "Database seed script missing"

echo -e "\n${BLUE}3. Checking Environment Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check backend .env
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    print_status 0 "Backend .env exists"

    # Check important variables
    if grep -q "NEXTJS_API_URL" "$PROJECT_ROOT/backend/.env"; then
        NEXTJS_URL=$(grep "NEXTJS_API_URL" "$PROJECT_ROOT/backend/.env" | cut -d'=' -f2)
        print_status 0 "NEXTJS_API_URL configured: $NEXTJS_URL"
    else
        print_status 1 "NEXTJS_API_URL not configured"
    fi

    if grep -q "API_KEY" "$PROJECT_ROOT/backend/.env"; then
        print_status 0 "API_KEY configured"
    else
        print_status 1 "API_KEY not configured"
    fi
else
    print_status 1 "Backend .env missing" "Run devnolife.sh to generate"
fi

# Check frontend .env
if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
    print_status 0 "Frontend .env exists"

    # Check important variables
    if grep -q "DATABASE_URL" "$PROJECT_ROOT/frontend/.env"; then
        print_status 0 "DATABASE_URL configured"
    else
        print_status 1 "DATABASE_URL not configured"
    fi

    if grep -q "NEXTAUTH_SECRET" "$PROJECT_ROOT/frontend/.env"; then
        print_status 0 "NEXTAUTH_SECRET configured"
    else
        print_status 1 "NEXTAUTH_SECRET not configured"
    fi

    if grep -q "PYTHON_API_URL" "$PROJECT_ROOT/frontend/.env"; then
        PYTHON_URL=$(grep "PYTHON_API_URL" "$PROJECT_ROOT/frontend/.env" | cut -d'=' -f2)
        print_status 0 "PYTHON_API_URL configured: $PYTHON_URL"
    else
        print_status 1 "PYTHON_API_URL not configured"
    fi
else
    print_status 1 "Frontend .env missing" "Copy from .env.example"
fi

echo -e "\n${BLUE}4. Checking Running Services${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Python API
if check_service "Python API" "http://localhost:8000/"; then
    print_status 0 "Python API is running (http://localhost:8000)"

    # Get API info
    API_INFO=$(curl -s http://localhost:8000/ 2>/dev/null)
    if [ -n "$API_INFO" ]; then
        VERSION=$(echo "$API_INFO" | jq -r '.version' 2>/dev/null || echo "unknown")
        echo -e "  ${BLUE}→${NC} Version: $VERSION"
    fi
else
    print_status 1 "Python API is not running" "Start with: cd backend && uvicorn app.main:app --reload"
fi

# Check Next.js Frontend
if check_service "Next.js Frontend" "http://localhost:3000/"; then
    print_status 0 "Next.js Frontend is running (http://localhost:3000)"
else
    print_status 1 "Next.js Frontend is not running" "Start with: cd frontend && npm run dev"
fi

echo -e "\n${BLUE}5. Checking Database${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_ROOT/frontend"

# Check Prisma client generation
if [ -d "node_modules/.prisma/client" ]; then
    print_status 0 "Prisma client is generated"
else
    print_status 1 "Prisma client not generated" "Run: cd frontend && npm run db:generate"
fi

# Try to connect to database
if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
    print_status 0 "Database connection successful"

    # Check if tables exist
    TABLE_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | tail -n 1 || echo "0")

    if [ "$TABLE_COUNT" -gt 0 ]; then
        print_status 0 "Database tables exist (count: $TABLE_COUNT)"

        # Check if seed data exists
        USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM users" 2>/dev/null | tail -n 1 || echo "0")
        if [ "$USER_COUNT" -gt 0 ]; then
            print_status 0 "Database has users (count: $USER_COUNT)"
        else
            print_status 1 "Database has no users" "Run: cd frontend && npm run db:seed"
        fi
    else
        print_status 1 "Database tables don't exist" "Run: cd frontend && npm run db:push"
    fi
else
    print_status 1 "Database connection failed" "Check DATABASE_URL in frontend/.env"
fi

echo -e "\n${BLUE}6. Checking API Endpoints${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Next.js health endpoint
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3000/api/health)
    STATUS=$(echo "$HEALTH" | jq -r '.status' 2>/dev/null || echo "unknown")

    if [ "$STATUS" = "healthy" ]; then
        print_status 0 "Next.js health check passed"

        DB_STATUS=$(echo "$HEALTH" | jq -r '.database.connected' 2>/dev/null)
        if [ "$DB_STATUS" = "true" ]; then
            print_status 0 "Next.js database connection working"
        else
            print_status 1 "Next.js database connection failed"
        fi
    else
        print_status 1 "Next.js health check failed"
    fi
else
    print_status 1 "Next.js health endpoint not responding" "Is Next.js running?"
fi

# Check admin stats endpoint (should require auth)
STATS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/stats 2>/dev/null || echo "000")
if [ "$STATS_RESPONSE" = "403" ] || [ "$STATS_RESPONSE" = "401" ]; then
    print_status 0 "Admin endpoint authorization working (returned $STATS_RESPONSE)"
else
    print_status 1 "Admin endpoint authorization issue (returned $STATS_RESPONSE)"
fi

echo -e "\n${BLUE}7. Integration Status Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count checks
TOTAL_CHECKS=20
PASSED_CHECKS=0

# Re-run critical checks silently
pg_isready > /dev/null 2>&1 && ((PASSED_CHECKS++))
redis-cli ping > /dev/null 2>&1 && ((PASSED_CHECKS++))
[ -d "$PROJECT_ROOT/backend/app" ] && ((PASSED_CHECKS++))
[ -d "$PROJECT_ROOT/frontend/app" ] && ((PASSED_CHECKS++))
[ -f "$PROJECT_ROOT/backend/app/database_client.py" ] && ((PASSED_CHECKS++))
[ -f "$PROJECT_ROOT/frontend/lib/auth.ts" ] && ((PASSED_CHECKS++))
[ -f "$PROJECT_ROOT/frontend/app/admin/page.tsx" ] && ((PASSED_CHECKS++))
[ -f "$PROJECT_ROOT/backend/.env" ] && ((PASSED_CHECKS++))
[ -f "$PROJECT_ROOT/frontend/.env" ] && ((PASSED_CHECKS++))
check_service "Python API" "http://localhost:8000/" && ((PASSED_CHECKS++))
check_service "Next.js" "http://localhost:3000/" && ((PASSED_CHECKS++))

PASS_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo ""
echo -e "Checks Passed: ${GREEN}$PASSED_CHECKS${NC} / $TOTAL_CHECKS (${PASS_PERCENTAGE}%)"

if [ $PASS_PERCENTAGE -ge 80 ]; then
    echo -e "\n${GREEN}✓ System integration looks good!${NC}"
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo "  1. Review TESTING_GUIDE.md for detailed testing"
    echo "  2. Login as admin: http://localhost:3000/auth/login"
    echo "     - Email: admin@antiplagiasi.com"
    echo "     - Password: admin123"
    echo "  3. Test document upload via Python API"
    echo "  4. Monitor progress in admin dashboard"
elif [ $PASS_PERCENTAGE -ge 50 ]; then
    echo -e "\n${YELLOW}⚠ System partially configured${NC}"
    echo "  Review failed checks above and fix issues"
else
    echo -e "\n${RED}✗ System needs configuration${NC}"
    echo "  1. Run devnolife.sh to set up the system"
    echo "  2. Fix failed checks above"
    echo "  3. Run this script again"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

exit 0
