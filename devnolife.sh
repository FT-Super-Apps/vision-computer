#!/bin/bash
# Anti-Plagiasi System - Master Control Script
# One script to rule them all!
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
PID_DIR="$PROJECT_ROOT/pids"
LOG_DIR="$PROJECT_ROOT/logs"

# Functions
show_banner() {
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
    echo "║                 ${WHITE}${BOLD}MASTER CONTROL PANEL v2.1.0${CYAN}${BOLD}                       ║"
    echo "║                                                                       ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${MAGENTA}${BOLD}           ⚡ Crafted with passion by devnolife ⚡${NC}"
    echo ""
}

show_menu() {
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}🎯 Main Menu:${NC}"
    echo ""
    echo -e "  ${GREEN}${BOLD}[1]${NC} 🚀 ${WHITE}Initialize Project${NC}           ${DIM}Setup everything from scratch${NC}"
    echo -e "  ${GREEN}${BOLD}[2]${NC} ▶️  ${WHITE}Start Backend Services${NC}       ${DIM}Start API + Celery + Redis${NC}"
    echo -e "  ${GREEN}${BOLD}[3]${NC} 🌐 ${WHITE}Start Frontend${NC}                ${DIM}Start Next.js dev server${NC}"
    echo -e "  ${GREEN}${BOLD}[4]${NC} 🚀 ${WHITE}Start All (Backend + Frontend)${NC} ${DIM}Start everything${NC}"
    echo ""
    echo -e "  ${YELLOW}${BOLD}[5]${NC} ⏸️  ${WHITE}Stop Backend Services${NC}        ${DIM}Stop all backend services${NC}"
    echo -e "  ${YELLOW}${BOLD}[6]${NC} 🔄 ${WHITE}Restart Backend Services${NC}     ${DIM}Restart all backend services${NC}"
    echo ""
    echo -e "  ${BLUE}${BOLD}[7]${NC} 📊 ${WHITE}Check Status${NC}                  ${DIM}View service status${NC}"
    echo -e "  ${BLUE}${BOLD}[8]${NC} 📋 ${WHITE}View Logs${NC}                     ${DIM}Real-time logs monitoring${NC}"
    echo -e "  ${BLUE}${BOLD}[9]${NC} 📈 ${WHITE}Monitor Services${NC}              ${DIM}Auto-refresh monitoring${NC}"
    echo ""
    echo -e "  ${MAGENTA}${BOLD}[10]${NC} 🔑 ${WHITE}Generate New API Key${NC}       ${DIM}Create new secure API key${NC}"
    echo -e "  ${MAGENTA}${BOLD}[11]${NC} 🗄️  ${WHITE}Database Management${NC}        ${DIM}Prisma Studio${NC}"
    echo -e "  ${MAGENTA}${BOLD}[12]${NC} 📚 ${WHITE}View Documentation${NC}          ${DIM}Open README${NC}"
    echo -e "  ${MAGENTA}${BOLD}[13]${NC} ℹ️  ${WHITE}System Information${NC}         ${DIM}Show system info${NC}"
    echo ""
    echo -e "  ${RED}${BOLD}[0]${NC} 🚪 ${WHITE}Exit${NC}"
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

press_enter() {
    echo ""
    echo -e "${DIM}Press Enter to continue...${NC}"
    read
}

# Option 1: Initialize Project
option_init() {
    show_banner
    echo -e "${BOLD}${GREEN}[1] 🚀 Initialize Project${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$PROJECT_ROOT/init.sh" ]; then
        bash "$PROJECT_ROOT/init.sh"
    else
        echo -e "${RED}${BOLD}❌ init.sh not found!${NC}"
    fi
    
    press_enter
}

# Option 2: Start Backend
option_start_backend() {
    show_banner
    echo -e "${BOLD}${GREEN}[2] ▶️  Start Backend Services${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$PROJECT_ROOT/start_production.sh" ]; then
        bash "$PROJECT_ROOT/start_production.sh"
    else
        echo -e "${RED}${BOLD}❌ start_production.sh not found!${NC}"
    fi
    
    press_enter
}

# Option 3: Start Frontend
option_start_frontend() {
    show_banner
    echo -e "${BOLD}${GREEN}[3] 🌐 Start Frontend${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}${BOLD}❌ Frontend directory not found!${NC}"
        press_enter
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}${BOLD}⚠️  Node modules not found. Installing...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}${BOLD}🚀 Starting Next.js dev server...${NC}"
    echo -e "${DIM}Access at: ${CYAN}http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}${BOLD}Press Ctrl+C to stop${NC}"
    echo ""
    
    npm run dev
}

# Option 4: Start All
option_start_all() {
    show_banner
    echo -e "${BOLD}${GREEN}[4] 🚀 Start All Services${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${CYAN}${BOLD}Step 1/2: Starting Backend...${NC}"
    if [ -f "$PROJECT_ROOT/start_production.sh" ]; then
        bash "$PROJECT_ROOT/start_production.sh"
    else
        echo -e "${RED}${BOLD}❌ start_production.sh not found!${NC}"
        press_enter
        return
    fi
    
    echo ""
    echo -e "${CYAN}${BOLD}Step 2/2: Starting Frontend...${NC}"
    echo -e "${YELLOW}${BOLD}⚠️  Frontend will start in a new terminal session.${NC}"
    echo -e "${DIM}Or you can run manually: cd frontend && npm run dev${NC}"
    echo ""
    
    press_enter
}

# Option 5: Stop Backend
option_stop_backend() {
    show_banner
    echo -e "${BOLD}${YELLOW}[5] ⏸️  Stop Backend Services${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$PROJECT_ROOT/stop_production.sh" ]; then
        bash "$PROJECT_ROOT/stop_production.sh"
    else
        echo -e "${RED}${BOLD}❌ stop_production.sh not found!${NC}"
    fi
    
    press_enter
}

# Option 6: Restart Backend
option_restart_backend() {
    show_banner
    echo -e "${BOLD}${YELLOW}[6] 🔄 Restart Backend Services${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$PROJECT_ROOT/restart_production.sh" ]; then
        bash "$PROJECT_ROOT/restart_production.sh"
    else
        echo -e "${RED}${BOLD}❌ restart_production.sh not found!${NC}"
    fi
    
    press_enter
}

# Option 7: Check Status
option_status() {
    show_banner
    echo -e "${BOLD}${BLUE}[7] 📊 Check Status${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$PROJECT_ROOT/status_production.sh" ]; then
        bash "$PROJECT_ROOT/status_production.sh"
    else
        echo -e "${RED}${BOLD}❌ status_production.sh not found!${NC}"
    fi
    
    press_enter
}

# Option 8: View Logs
option_logs() {
    show_banner
    echo -e "${BOLD}${BLUE}[8] 📋 View Logs${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -d "$LOG_DIR" ]; then
        echo -e "${YELLOW}${BOLD}⚠️  Logs directory not found!${NC}"
        press_enter
        return
    fi
    
    echo -e "${CYAN}${BOLD}📋 Real-time Logs Monitoring${NC}"
    echo -e "${DIM}Press Ctrl+C to exit${NC}"
    echo ""
    
    tail -f "$LOG_DIR"/*.log 2>/dev/null || echo -e "${YELLOW}No log files found${NC}"
}

# Option 9: Monitor Services
option_monitor() {
    show_banner
    echo -e "${BOLD}${BLUE}[9] 📈 Monitor Services${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$PROJECT_ROOT/status_production.sh" ]; then
        echo -e "${CYAN}${BOLD}📊 Service Monitoring (Auto-refresh every 2s)${NC}"
        echo -e "${DIM}Press Ctrl+C to exit${NC}"
        echo ""
        sleep 2
        
        watch -n 2 "$PROJECT_ROOT/status_production.sh"
    else
        echo -e "${RED}${BOLD}❌ status_production.sh not found!${NC}"
        press_enter
    fi
}

# Option 10: Generate API Key
option_generate_key() {
    show_banner
    echo -e "${BOLD}${MAGENTA}[10] 🔑 Generate New API Key${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$PROJECT_ROOT/generate_api_key.py" ]; then
        python3 "$PROJECT_ROOT/generate_api_key.py"
    else
        echo -e "${RED}${BOLD}❌ generate_api_key.py not found!${NC}"
    fi
    
    press_enter
}

# Option 11: Database Management
option_database() {
    show_banner
    echo -e "${BOLD}${MAGENTA}[11] 🗄️  Database Management${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}${BOLD}❌ Frontend directory not found!${NC}"
        press_enter
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    echo -e "${CYAN}${BOLD}🗄️  Opening Prisma Studio...${NC}"
    echo -e "${DIM}Access at: ${CYAN}http://localhost:5555${NC}"
    echo ""
    echo -e "${YELLOW}${BOLD}Press Ctrl+C to close${NC}"
    echo ""
    
    npx prisma studio
}

# Option 12: Documentation
option_docs() {
    show_banner
    echo -e "${BOLD}${MAGENTA}[12] 📚 View Documentation${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$PROJECT_ROOT/README.md" ]; then
        if command -v bat &> /dev/null; then
            bat "$PROJECT_ROOT/README.md"
        elif command -v less &> /dev/null; then
            less "$PROJECT_ROOT/README.md"
        else
            cat "$PROJECT_ROOT/README.md"
        fi
    else
        echo -e "${RED}${BOLD}❌ README.md not found!${NC}"
    fi
    
    press_enter
}

# Option 13: System Info
option_sysinfo() {
    show_banner
    echo -e "${BOLD}${MAGENTA}[13] ℹ️  System Information${NC}"
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${BOLD}${CYAN}🖥️  System:${NC}"
    echo -e "${DIM}├─${NC} OS: $(uname -s)"
    echo -e "${DIM}├─${NC} Kernel: $(uname -r)"
    echo -e "${DIM}└─${NC} Architecture: $(uname -m)"
    echo ""
    
    echo -e "${BOLD}${CYAN}🔧 Software:${NC}"
    if command -v python3 &> /dev/null; then
        echo -e "${DIM}├─${NC} ${GREEN}✓${NC} Python: $(python3 --version | awk '{print $2}')"
    else
        echo -e "${DIM}├─${NC} ${RED}✗${NC} Python: Not installed"
    fi
    
    if command -v node &> /dev/null; then
        echo -e "${DIM}├─${NC} ${GREEN}✓${NC} Node.js: $(node --version)"
    else
        echo -e "${DIM}├─${NC} ${RED}✗${NC} Node.js: Not installed"
    fi
    
    if command -v npm &> /dev/null; then
        echo -e "${DIM}├─${NC} ${GREEN}✓${NC} npm: v$(npm --version)"
    else
        echo -e "${DIM}├─${NC} ${RED}✗${NC} npm: Not installed"
    fi
    
    if command -v redis-server &> /dev/null; then
        echo -e "${DIM}├─${NC} ${GREEN}✓${NC} Redis: $(redis-server --version | awk '{print $3}')"
    else
        echo -e "${DIM}├─${NC} ${YELLOW}⚠${NC} Redis: Not installed (optional)"
    fi
    
    if command -v psql &> /dev/null; then
        echo -e "${DIM}└─${NC} ${GREEN}✓${NC} PostgreSQL: $(psql --version | awk '{print $3}')"
    else
        echo -e "${DIM}└─${NC} ${YELLOW}⚠${NC} PostgreSQL: Not installed (optional)"
    fi
    
    echo ""
    echo -e "${BOLD}${CYAN}📊 Project Status:${NC}"
    
    if [ -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${DIM}├─${NC} ${GREEN}✓${NC} Backend .env configured"
    else
        echo -e "${DIM}├─${NC} ${RED}✗${NC} Backend .env not found"
    fi
    
    if [ -f "$FRONTEND_DIR/.env" ]; then
        echo -e "${DIM}├─${NC} ${GREEN}✓${NC} Frontend .env configured"
    else
        echo -e "${DIM}├─${NC} ${RED}✗${NC} Frontend .env not found"
    fi
    
    if [ -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${DIM}├─${NC} ${GREEN}✓${NC} Frontend dependencies installed"
    else
        echo -e "${DIM}├─${NC} ${YELLOW}⚠${NC} Frontend dependencies not installed"
    fi
    
    if [ -d "$PROJECT_ROOT/uploads" ]; then
        echo -e "${DIM}└─${NC} ${GREEN}✓${NC} Backend directories created"
    else
        echo -e "${DIM}└─${NC} ${YELLOW}⚠${NC} Backend directories not created"
    fi
    
    echo ""
    echo -e "${BOLD}${CYAN}🌐 Service URLs:${NC}"
    echo -e "${DIM}├─${NC} Backend API:  ${CYAN}http://localhost:8000${NC}"
    echo -e "${DIM}├─${NC} API Docs:     ${CYAN}http://localhost:8000/docs${NC}"
    echo -e "${DIM}├─${NC} Frontend:     ${CYAN}http://localhost:3000${NC}"
    echo -e "${DIM}└─${NC} Prisma Studio: ${CYAN}http://localhost:5555${NC}"
    
    echo ""
    press_enter
}

# Main loop
main() {
    while true; do
        show_banner
        show_menu
        
        echo -ne "${BOLD}${WHITE}Select option [0-13]: ${NC}"
        read -r choice
        
        case $choice in
            1) option_init ;;
            2) option_start_backend ;;
            3) option_start_frontend ;;
            4) option_start_all ;;
            5) option_stop_backend ;;
            6) option_restart_backend ;;
            7) option_status ;;
            8) option_logs ;;
            9) option_monitor ;;
            10) option_generate_key ;;
            11) option_database ;;
            12) option_docs ;;
            13) option_sysinfo ;;
            0)
                show_banner
                echo -e "${GREEN}${BOLD}👋 Thank you for using Anti-Plagiasi System!${NC}"
                echo ""
                echo -e "${MAGENTA}${BOLD}⚡ Made with ❤️  by devnolife${NC}"
                echo ""
                exit 0
                ;;
            *)
                echo ""
                echo -e "${RED}${BOLD}❌ Invalid option. Please choose 0-13.${NC}"
                sleep 2
                ;;
        esac
    done
}

# Run main function
main
