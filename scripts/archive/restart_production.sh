#!/bin/bash
# Restart production services
# Created by devnolife

set -e

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

# ASCII Art Banner
clear
echo -e "${YELLOW}${BOLD}"
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
echo "║                  ${WHITE}${BOLD}RESTART - Production Services${YELLOW}${BOLD}                     ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${MAGENTA}${BOLD}           🔄 Crafted with passion by devnolife 🔄${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Stop services
echo -e "${BOLD}${RED}[1/2] 🛑 Stopping all services...${NC}"
echo ""
./stop_production.sh

# Countdown
echo ""
echo -e "${BOLD}${BLUE}⏳ Waiting for services to shutdown completely...${NC}"
echo -ne "${DIM}   "
for i in {3..1}; do
    echo -ne "$i... "
    sleep 1
done
echo -e "Ready!${NC}"
echo ""

# Start services
echo -e "${BOLD}${GREEN}[2/2] 🚀 Starting all services...${NC}"
echo ""
./start_production.sh

echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}${BOLD}   🎊 RESTART COMPLETED SUCCESSFULLY! 🎊${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${DIM}${MAGENTA}                Made with ❤️  by devnolife | $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
