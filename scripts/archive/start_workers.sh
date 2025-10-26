#!/bin/bash
# Start Celery workers for concurrent processing
# Run this in separate terminal or background
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
echo "║                   ${WHITE}${BOLD}CELERY WORKERS - Standalone${YELLOW}${BOLD}                      ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${MAGENTA}${BOLD}           🔥 Crafted with passion by devnolife 🔥${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Configuration
echo -e "${BOLD}${CYAN}⚙️  Worker Configuration:${NC}"
echo -e "${DIM}├─${NC} ${YELLOW}Concurrency:${NC}        ${BOLD}4 workers${NC}"
echo -e "${DIM}├─${NC} ${YELLOW}Pool Type:${NC}          ${BOLD}prefork${NC}"
echo -e "${DIM}├─${NC} ${YELLOW}Queues:${NC}             ${BOLD}unified, analysis, matching, bypass${NC}"
echo -e "${DIM}├─${NC} ${YELLOW}Max Tasks/Child:${NC}    ${BOLD}10${NC}"
echo -e "${DIM}├─${NC} ${YELLOW}Time Limit:${NC}         ${BOLD}600s (hard) / 540s (soft)${NC}"
echo -e "${DIM}└─${NC} ${YELLOW}Log Level:${NC}          ${BOLD}info${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Loading animation
echo -e "${BOLD}${BLUE}🚀 Initializing Celery Workers...${NC}"
echo -ne "${DIM}   Loading"
for i in {1..5}; do
    sleep 0.3
    echo -ne "."
done
echo -e " Ready!${NC}"
echo ""

echo -e "${BOLD}${GREEN}✨ Starting Celery Workers...${NC}"
echo ""
echo -e "${DIM}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━ WORKER LOGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start worker with 4 concurrent workers
celery -A app.celery_app worker \
  --loglevel=info \
  --concurrency=4 \
  --pool=prefork \
  --queues=unified,analysis,matching,bypass \
  --max-tasks-per-child=10 \
  --time-limit=600 \
  --soft-time-limit=540

# Alternative: Start with autoscale (min 2, max 8 workers)
# celery -A app.celery_app worker --loglevel=info --autoscale=8,2
