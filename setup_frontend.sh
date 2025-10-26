#!/bin/bash

# Frontend Setup Script for Anti-Plagiasi System
# This script initializes the Next.js frontend with database and authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Anti-Plagiasi Frontend Setup                    "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}✗ Frontend directory not found!${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"

# Step 1: Install dependencies
echo -e "\n${BLUE}1. Installing dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Step 2: Check .env file
echo -e "\n${BLUE}2. Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo -e "  Creating from .env.example..."

    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from template${NC}"
        echo -e "${YELLOW}  Please update the following in .env:${NC}"
        echo "  - DATABASE_URL with your PostgreSQL connection string"
        echo "  - NEXTAUTH_SECRET with a secure random string"
        echo "  - PYTHON_API_KEY (should match backend API key)"
        echo ""
        read -p "Press Enter when you've updated .env file..."
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"

    # Verify required variables
    MISSING_VARS=()

    if ! grep -q "^DATABASE_URL=" .env; then
        MISSING_VARS+=("DATABASE_URL")
    fi

    if ! grep -q "^NEXTAUTH_SECRET=" .env; then
        MISSING_VARS+=("NEXTAUTH_SECRET")
    fi

    if ! grep -q "^PYTHON_API_URL=" .env; then
        MISSING_VARS+=("PYTHON_API_URL")
    fi

    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠ Missing required variables:${NC}"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        read -p "Press Enter to continue anyway or Ctrl+C to exit..."
    fi
fi

# Step 3: Generate Prisma client
echo -e "\n${BLUE}3. Generating Prisma client...${NC}"
if npm run db:generate; then
    echo -e "${GREEN}✓ Prisma client generated${NC}"
else
    echo -e "${RED}✗ Failed to generate Prisma client${NC}"
    exit 1
fi

# Step 4: Push database schema
echo -e "\n${BLUE}4. Pushing database schema...${NC}"
echo -e "${YELLOW}  This will create/update database tables${NC}"

if npm run db:push; then
    echo -e "${GREEN}✓ Database schema pushed${NC}"
else
    echo -e "${RED}✗ Failed to push database schema${NC}"
    echo -e "${YELLOW}  Make sure PostgreSQL is running and DATABASE_URL is correct${NC}"
    exit 1
fi

# Step 5: Seed database
echo -e "\n${BLUE}5. Seeding database with test data...${NC}"
if npm run db:seed; then
    echo -e "${GREEN}✓ Database seeded${NC}"
else
    echo -e "${YELLOW}⚠ Database seeding failed or partially completed${NC}"
    echo -e "  You can run 'npm run db:seed' manually later"
fi

# Step 6: Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Frontend setup completed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Test Credentials:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Admin Account:${NC}"
echo "  Email: admin@antiplagiasi.com"
echo "  Password: admin123"
echo ""
echo -e "${GREEN}Test User 1:${NC}"
echo "  Email: user1@test.com"
echo "  Password: user123"
echo ""
echo -e "${GREEN}Test User 2:${NC}"
echo "  Email: user2@test.com"
echo "  Password: user123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Start the development server:"
echo -e "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "2. Open your browser:"
echo -e "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo "3. Login as admin and explore:"
echo -e "   ${GREEN}http://localhost:3000/auth/login${NC}"
echo ""
echo "4. View admin dashboard:"
echo -e "   ${GREEN}http://localhost:3000/admin${NC}"
echo ""
echo "5. Optional - Open Prisma Studio to view database:"
echo -e "   ${GREEN}npm run db:studio${NC}"
echo ""
echo "6. Run integration verification:"
echo -e "   ${GREEN}cd .. && ./verify_integration.sh${NC}"
echo ""

echo -e "${YELLOW}Note: Make sure the Python backend is also running for full functionality${NC}"
echo -e "      Start backend with: ${GREEN}cd backend && uvicorn app.main:app --reload${NC}\n"

exit 0
