#!/bin/bash

# Backend Setup Script for Vision Computer
# Creates virtual environment and installs dependencies

set -e

echo "🚀 Setting up Backend Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${BLUE}Python version:${NC}"
python3 --version

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if python3-venv is installed
if ! python3 -m venv --help &> /dev/null; then
    echo -e "${RED}Error: python3-venv is not installed.${NC}"
    echo -e "${BLUE}Install it with:${NC} sudo apt install python3-venv python3-full"
    exit 1
fi

# Remove old venv if exists
if [ -d "venv" ]; then
    echo -e "${BLUE}Removing old virtual environment...${NC}"
    rm -rf venv
fi

# Create virtual environment
echo -e "${BLUE}Creating virtual environment...${NC}"
python3 -m venv venv

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${BLUE}Upgrading pip...${NC}"
pip install --upgrade pip

# Install requirements
echo -e "${BLUE}Installing dependencies from requirements.txt...${NC}"
pip install -r requirements.txt

echo -e "${GREEN}✅ Backend setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}To activate the virtual environment, run:${NC}"
echo -e "  cd backend && source venv/bin/activate"
echo ""
echo -e "${BLUE}To deactivate, run:${NC}"
echo -e "  deactivate"
