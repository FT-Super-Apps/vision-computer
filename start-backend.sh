#!/bin/bash

# Backend Startup Script
# Starts all required backend services

set -e

cd "$(dirname "$0")/backend"

echo "=========================================="
echo "  Starting Backend Services"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo ""
    echo "Please run setup first:"
    echo "  cd backend"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Check if Redis is running
echo "1️⃣ Checking Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Redis is not running${NC}"
    echo ""
    echo "Starting Redis..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start redis
        echo -e "${GREEN}✅ Redis started via systemd${NC}"
    else
        echo "Please start Redis manually in another terminal:"
        echo "  redis-server"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Redis is running${NC}"
fi

# Activate virtual environment
echo ""
echo "2️⃣ Activating virtual environment..."
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Create required directories
echo ""
echo "3️⃣ Creating required directories..."
mkdir -p uploads outputs temp
echo -e "${GREEN}✅ Directories created${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env with defaults..."
    cat > .env << EOF
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# API Configuration
PYTHON_API_KEY=dev-api-key-$(openssl rand -hex 16)
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
fi

echo ""
echo "=========================================="
echo "  Backend Services Ready!"
echo "=========================================="
echo ""
echo "Now start the services in separate terminals:"
echo ""
echo -e "${YELLOW}Terminal 1 - FastAPI Server:${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo -e "${YELLOW}Terminal 2 - Celery Worker:${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  celery -A app.celery_app worker --loglevel=info"
echo ""
echo -e "${YELLOW}Terminal 3 - Flower (Optional):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  celery -A app.celery_app flower --port=5555"
echo ""
echo "Or use tmux/screen to run all in background"
echo ""
