#!/bin/bash
# devnolife interface untuk production scripts
# Usage: ./devnolife.sh [start|stop|restart|status|logs]
# Created by devnolife

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

COMMAND=$1

show_help() {
    clear
    echo -e "${MAGENTA}${BOLD}"
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
    echo "║                   ${WHITE}${BOLD}devnolife MANAGER v1.0${MAGENTA}${BOLD}                           ║"
    echo "║                                                                       ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${CYAN}${BOLD}              ⚡ Crafted with passion by devnolife ⚡${NC}"
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}📖 Usage:${NC}"
    echo -e "   ${YELLOW}./devnolife.sh ${WHITE}[command]${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}🚀 Available Commands:${NC}"
    echo -e "${DIM}├─${NC} ${GREEN}${BOLD}start${NC}        ${DIM}Start all services (Redis, FastAPI, Celery)${NC}"
    echo -e "${DIM}├─${NC} ${RED}${BOLD}stop${NC}         ${DIM}Stop all services gracefully${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}${BOLD}restart${NC}      ${DIM}Restart all services (stop + start)${NC}"
    echo -e "${DIM}├─${NC} ${CYAN}${BOLD}status${NC}       ${DIM}Show detailed service status and health${NC}"
    echo -e "${DIM}├─${NC} ${MAGENTA}${BOLD}logs${NC}         ${DIM}Show real-time logs from all services${NC}"
    echo -e "${DIM}├─${NC} ${BLUE}${BOLD}monit${NC}        ${DIM}Monitor services in real-time (auto-refresh)${NC}"
    echo -e "${DIM}└─${NC} ${WHITE}${BOLD}help${NC}         ${DIM}Show this help message${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}💡 Examples:${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./devnolife.sh start${NC}       ${DIM}Start all services${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./devnolife.sh status${NC}      ${DIM}Check service status${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./devnolife.sh logs${NC}        ${DIM}View live logs${NC}"
    echo -e "${DIM}└─${NC} ${YELLOW}./devnolife.sh monit${NC}       ${DIM}Monitor with auto-refresh${NC}"
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${DIM}${MAGENTA}                Made with ❤️  by devnolife | v1.0${NC}"
    echo ""
}

case "$COMMAND" in
    start)
        echo -e "${BOLD}${GREEN}🚀 Starting all services...${NC}"
        echo ""
        ./start_production.sh
        ;;
    stop)
        echo -e "${BOLD}${RED}🛑 Stopping all services...${NC}"
        echo ""
        ./stop_production.sh
        ;;
    restart)
        echo -e "${BOLD}${YELLOW}🔄 Restarting all services...${NC}"
        echo ""
        ./restart_production.sh
        ;;
    status)
        ./status_production.sh
        ;;
    logs)
        clear
        echo -e "${MAGENTA}${BOLD}"
        echo "╔═══════════════════════════════════════════════════════════════════════╗"
        echo "║                         📋 REAL-TIME LOGS 📋                          ║"
        echo "╚═══════════════════════════════════════════════════════════════════════╝"
        echo -e "${NC}"
        echo -e "${DIM}${YELLOW}Press Ctrl+C to exit${NC}"
        echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        tail -f logs/*.log
        ;;
    monit)
        clear
        echo -e "${BLUE}${BOLD}"
        echo "╔═══════════════════════════════════════════════════════════════════════╗"
        echo "║                     📊 SERVICE MONITORING 📊                          ║"
        echo "╚═══════════════════════════════════════════════════════════════════════╝"
        echo -e "${NC}"
        echo -e "${DIM}${YELLOW}Auto-refresh every 2 seconds | Press Ctrl+C to exit${NC}"
        echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        sleep 2
        watch -n 2 ./status_production.sh
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}${BOLD}❌ Error: Unknown command '$COMMAND'${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
