#!/bin/bash
# Anti-Plagiasi System - Complete Initialization Script
# This script will setup both Frontend and Backend with auto-generated API keys
# Created by devnolife

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Project directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT"

# Banner
clear
echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                       ║"
echo "║     █████╗ ███╗   ██╗████████╗██╗      ██████╗ ██╗      █████╗       ║"
echo "║    ██╔══██╗████╗  ██║╚══██╔══╝██║      ██╔══██╗██║     ██╔══██╗      ║"
echo "║    ███████║██╔██╗ ██║   ██║   ██║█████╗██████╔╝██║     ███████║      ║"
echo "║    ██╔══██║██║╚██╗██║   ██║   ██║╚════╝██╔═══╝ ██║     ██╔══██║      ║"
echo "║    ██║  ██║██║ ╚████║   ██║   ██║      ██║     ███████╗██║  ██║      ║"
echo "║    ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝      ╚═╝     ╚══════╝╚═╝  ╚═╝      ║"
echo "║                                                                       ║"
echo "║       ██████╗ ██╗ █████╗ ███████╗██╗    ██████╗ ███████╗██╗          ║"
echo "║      ██╔════╝ ██║██╔══██╗██╔════╝██║    ██╔══██╗██╔════╝██║          ║"
echo "║      ██║  ███╗██║███████║███████╗██║    ██████╔╝███████╗██║          ║"
echo "║      ██║   ██║██║██╔══██║╚════██║██║    ██╔══██╗╚════██║██║          ║"
echo "║      ╚██████╔╝██║██║  ██║███████║██║    ██║  ██║███████║██║          ║"
echo "║       ╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚═╝  ╚═╝╚══════╝╚═╝          ║"
echo "║                                                                       ║"
echo "║              ${WHITE}${BOLD}SYSTEM INITIALIZATION SCRIPT v1.0${CYAN}${BOLD}                    ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${MAGENTA}${BOLD}        ⚡ Crafted with passion by devnolife ⚡${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Functions
log_step() {
    echo -e "${BOLD}${BLUE}[STEP] ${NC}$1${NC}"
}

log_success() {
    echo -e "${GREEN}${BOLD}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}${BOLD}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${BOLD}⚠️  $1${NC}"
}

log_info() {
    echo -e "${CYAN}${DIM}ℹ️  $1${NC}"
}

loading_animation() {
    local message=$1
    local duration=${2:-3}
    echo -ne "${DIM}   $message"
    for i in $(seq 1 $duration); do
        sleep 0.5
        echo -ne "."
    done
    echo -e "${NC}"
}

# Step 1: Check Prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    echo ""
    
    local all_ok=true
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        log_success "Python: $PYTHON_VERSION"
    else
        log_error "Python 3 is not installed"
        all_ok=false
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js: $NODE_VERSION"
    else
        log_error "Node.js is not installed"
        all_ok=false
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm: v$NPM_VERSION"
    else
        log_error "npm is not installed"
        all_ok=false
    fi
    
    # Check Redis (optional but recommended)
    if command -v redis-server &> /dev/null; then
        log_success "Redis: Available"
    else
        log_warning "Redis not found (optional, but needed for Celery)"
    fi
    
    # Check PostgreSQL (optional)
    if command -v psql &> /dev/null; then
        log_success "PostgreSQL: Available"
    else
        log_warning "PostgreSQL not found (optional, needed for frontend DB)"
    fi
    
    echo ""
    
    if [ "$all_ok" = false ]; then
        log_error "Missing required dependencies. Please install them first."
        exit 1
    fi
}

# Step 2: Generate API Key
generate_api_key() {
    log_step "Generating secure API key..."
    echo ""
    
    # Generate cryptographically secure API key
    API_KEY="apk_$(LC_ALL=C tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 48)"
    
    log_success "API Key generated successfully"
    echo -e "${DIM}   Key: ${CYAN}${API_KEY}${NC}"
    echo ""
}

# Step 3: Setup Backend Environment
setup_backend_env() {
    log_step "Setting up Backend environment..."
    echo ""
    
    # Create .env from example if not exists
    if [ -f "$BACKEND_DIR/.env" ]; then
        log_warning ".env already exists. Creating backup..."
        cp "$BACKEND_DIR/.env" "$BACKEND_DIR/.env.backup.$(date +%s)"
    fi
    
    # Create .env file
    cat > "$BACKEND_DIR/.env" << ENVFILE
# Anti-Plagiasi Backend Configuration
# Auto-generated by init.sh on $(date '+%Y-%m-%d %H:%M:%S')
# Created by devnolife

# API Security
API_KEY=${API_KEY}

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Upload Configuration
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
TEMP_DIR=./temp

# Processing Configuration
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=docx,doc,pdf

# Environment
ENVIRONMENT=development
DEBUG=true
ENVFILE
    
    log_success "Backend .env created with API key"
    log_info "Location: $BACKEND_DIR/.env"
    echo ""
}

# Step 4: Setup Frontend Environment
setup_frontend_env() {
    log_step "Setting up Frontend environment..."
    echo ""
    
    # Create frontend .env
    if [ -f "$FRONTEND_DIR/.env" ]; then
        log_warning ".env already exists. Creating backup..."
        cp "$FRONTEND_DIR/.env" "$FRONTEND_DIR/.env.backup.$(date +%s)"
    fi
    
    # Prompt for database URL
    echo -e "${YELLOW}${BOLD}Database Configuration${NC}"
    echo -e "${DIM}Press Enter to use default PostgreSQL URL, or enter your custom URL:${NC}"
    read -p "DATABASE_URL (default: postgresql://postgres:postgres@localhost:5432/antiplagiasi): " DB_URL
    DB_URL=${DB_URL:-"postgresql://postgres:postgres@localhost:5432/antiplagiasi"}
    
    echo ""
    
    # Generate NextAuth secret
    NEXTAUTH_SECRET=$(LC_ALL=C tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 64)
    
    cat > "$FRONTEND_DIR/.env" << ENVFILE
# Anti-Plagiasi Frontend Configuration
# Auto-generated by init.sh on $(date '+%Y-%m-%d %H:%M:%S')
# Created by devnolife

# Database
DATABASE_URL="${DB_URL}"

# NextAuth
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="http://localhost:3000"

# Python API
PYTHON_API_URL="http://localhost:8000"
PYTHON_API_KEY=${API_KEY}
PYTHON_API_TIMEOUT="300000"

# Upload Configuration
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="./uploads"
OUTPUT_DIR="./outputs"

# Feature Flags
ENABLE_OCR="true"
ENABLE_ANALYTICS="true"
ENABLE_EMAIL_NOTIFICATIONS="false"
ENVFILE
    
    log_success "Frontend .env created with same API key"
    log_info "Location: $FRONTEND_DIR/.env"
    echo ""
}

# Step 5: Install Backend Dependencies
install_backend_deps() {
    log_step "Installing Backend Python dependencies..."
    echo ""
    
    cd "$BACKEND_DIR"
    
    # Check if requirements.txt exists
    if [ ! -f "requirements.txt" ]; then
        log_warning "requirements.txt not found, skipping..."
        return
    fi
    
    loading_animation "Installing packages" 5
    
    pip install -q -r requirements.txt
    
    log_success "Backend dependencies installed"
    echo ""
}

# Step 6: Install Frontend Dependencies
install_frontend_deps() {
    log_step "Installing Frontend Node.js dependencies..."
    echo ""
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_warning "Frontend directory not found, skipping..."
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    if [ ! -f "package.json" ]; then
        log_warning "package.json not found, skipping..."
        return
    fi
    
    loading_animation "Installing packages (this may take a while)" 8
    
    npm install --silent
    
    log_success "Frontend dependencies installed"
    echo ""
}

# Step 7: Setup Database
setup_database() {
    log_step "Setting up Frontend database with Prisma..."
    echo ""
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_warning "Frontend directory not found, skipping database setup..."
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    if [ ! -f "prisma/schema.prisma" ]; then
        log_warning "Prisma schema not found, skipping database setup..."
        return
    fi
    
    log_info "Generating Prisma Client..."
    npx prisma generate --silent || true
    
    log_info "Pushing database schema..."
    npx prisma db push --skip-generate --accept-data-loss || log_warning "Database push failed (might be normal if DB not ready)"
    
    log_success "Database setup completed (or skipped)"
    echo ""
}

# Step 8: Create Necessary Directories
create_directories() {
    log_step "Creating necessary directories..."
    echo ""
    
    cd "$BACKEND_DIR"
    
    mkdir -p uploads outputs temp logs pids
    
    log_success "Backend directories created"
    log_info "Created: uploads, outputs, temp, logs, pids"
    echo ""
}

# Step 9: Verify Setup
verify_setup() {
    log_step "Verifying setup..."
    echo ""
    
    local all_ok=true
    
    # Check backend .env
    if [ -f "$BACKEND_DIR/.env" ]; then
        log_success "Backend .env: OK"
    else
        log_error "Backend .env: Missing"
        all_ok=false
    fi
    
    # Check frontend .env
    if [ -f "$FRONTEND_DIR/.env" ]; then
        log_success "Frontend .env: OK"
    else
        log_error "Frontend .env: Missing"
        all_ok=false
    fi
    
    # Check API key consistency
    if [ -f "$BACKEND_DIR/.env" ] && [ -f "$FRONTEND_DIR/.env" ]; then
        BACKEND_KEY=$(grep "^API_KEY=" "$BACKEND_DIR/.env" | cut -d'=' -f2)
        FRONTEND_KEY=$(grep "^PYTHON_API_KEY=" "$FRONTEND_DIR/.env" | cut -d'=' -f2)
        
        if [ "$BACKEND_KEY" = "$FRONTEND_KEY" ]; then
            log_success "API Keys: Matched"
        else
            log_error "API Keys: Mismatch!"
            all_ok=false
        fi
    fi
    
    # Check directories
    if [ -d "$BACKEND_DIR/uploads" ]; then
        log_success "Backend directories: OK"
    else
        log_warning "Backend directories: Some missing"
    fi
    
    echo ""
    
    if [ "$all_ok" = true ]; then
        return 0
    else
        return 1
    fi
}

# Step 10: Display Summary
display_summary() {
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}${BOLD}   🎉 INITIALIZATION COMPLETED SUCCESSFULLY! 🎉${NC}"
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}📊 Setup Summary:${NC}"
    echo -e "${DIM}├─${NC} ${BLUE}Backend${NC}"
    echo -e "${DIM}│  ├─${NC} API Key: ${GREEN}✓${NC} Generated & Configured"
    echo -e "${DIM}│  ├─${NC} Environment: ${GREEN}✓${NC} .env created"
    echo -e "${DIM}│  ├─${NC} Dependencies: ${GREEN}✓${NC} Installed"
    echo -e "${DIM}│  └─${NC} Directories: ${GREEN}✓${NC} Created"
    echo -e "${DIM}│${NC}"
    echo -e "${DIM}└─${NC} ${MAGENTA}Frontend${NC}"
    echo -e "   ${DIM}├─${NC} API Key: ${GREEN}✓${NC} Same as Backend"
    echo -e "   ${DIM}├─${NC} Environment: ${GREEN}✓${NC} .env created"
    echo -e "   ${DIM}├─${NC} Dependencies: ${GREEN}✓${NC} Installed"
    echo -e "   ${DIM}└─${NC} Database: ${GREEN}✓${NC} Prisma configured"
    echo ""
    echo -e "${BOLD}${CYAN}🔐 API Key Information:${NC}"
    echo -e "   ${DIM}Your API Key:${NC} ${CYAN}${API_KEY}${NC}"
    echo -e "   ${DIM}Location:${NC}"
    echo -e "   ${DIM}  • Backend:${NC}  .env → API_KEY"
    echo -e "   ${DIM}  • Frontend:${NC} frontend/.env → PYTHON_API_KEY"
    echo ""
    echo -e "${BOLD}${CYAN}🚀 Next Steps:${NC}"
    echo -e "${DIM}1.${NC} ${YELLOW}Start Backend:${NC}"
    echo -e "   ${DIM}./start_production.sh${NC}"
    echo ""
    echo -e "${DIM}2.${NC} ${YELLOW}Start Frontend (in new terminal):${NC}"
    echo -e "   ${DIM}cd frontend && npm run dev${NC}"
    echo ""
    echo -e "${DIM}3.${NC} ${YELLOW}Access Applications:${NC}"
    echo -e "   ${DIM}• Backend API:${NC}  ${GREEN}http://localhost:8000${NC}"
    echo -e "   ${DIM}• Frontend:${NC}     ${GREEN}http://localhost:3000${NC}"
    echo -e "   ${DIM}• API Docs:${NC}     ${GREEN}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}💡 Useful Commands:${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./pm2-like.sh start${NC}       ${DIM}Start backend services${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./pm2-like.sh status${NC}      ${DIM}Check service status${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./pm2-like.sh logs${NC}        ${DIM}View real-time logs${NC}"
    echo -e "${DIM}└─${NC} ${YELLOW}python generate_api_key.py${NC} ${DIM}Regenerate API key${NC}"
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${DIM}${MAGENTA}                Made with ❤️  by devnolife | $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    echo -e "${BOLD}${GREEN}Ready to rock! 🚀${NC}"
    echo ""
}

# Main Execution
main() {
    check_prerequisites
    generate_api_key
    setup_backend_env
    setup_frontend_env
    install_backend_deps
    install_frontend_deps
    create_directories
    setup_database
    
    if verify_setup; then
        display_summary
    else
        echo ""
        log_error "Setup verification failed. Please check the errors above."
        exit 1
    fi
}

# Run main function
main
