#!/bin/bash
# Stop production services
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

# Directories
WORK_DIR="/workspaces/vision-computer"
PID_DIR="$WORK_DIR/pids"

# PID files
API_PID_FILE="$PID_DIR/api.pid"
WORKER_PID_FILE="$PID_DIR/celery_worker.pid"
REDIS_PID_FILE="$PID_DIR/redis.pid"

# ASCII Art Banner
clear
echo -e "${RED}${BOLD}"
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
echo "║                  ${WHITE}${BOLD}STOP - Production Services${RED}${BOLD}                        ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${MAGENTA}${BOLD}           🛑 Crafted with passion by devnolife 🛑${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to stop a service
stop_service() {
    local pid_file=$1
    local service_name=$2
    local signal=${3:-TERM}
    local color=$4

    if [ ! -f "$pid_file" ]; then
        echo -e "${DIM}${YELLOW}      ⚠️  $service_name is not running ${NC}${DIM}(no PID file)${NC}"
        return 0
    fi

    local pid=$(cat "$pid_file")

    if ! ps -p $pid > /dev/null 2>&1; then
        echo -e "${DIM}${YELLOW}      ⚠️  $service_name is not running ${NC}${DIM}(stale PID file)${NC}"
        rm -f "$pid_file"
        return 0
    fi

    echo -e "${BOLD}${color}      🛑 Stopping $service_name ${NC}${DIM}(PID: $pid)${NC}"
    kill -$signal $pid

    # Wait for process to stop with animation
    local count=0
    echo -ne "${DIM}         Waiting"
    while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
        sleep 0.5
        echo -ne "."
        count=$((count + 1))
    done
    echo -e "${NC}"

    # Force kill if still running
    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${YELLOW}${BOLD}         ⚡ Force killing $service_name...${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 0.5
    fi

    rm -f "$pid_file"
    echo -e "${GREEN}${BOLD}      ✅ $service_name stopped successfully${NC}"
}

# Stop services in reverse order
echo -e "${BOLD}${YELLOW}[1/3] 🔥 Stopping Celery Workers...${NC}"
stop_service "$WORKER_PID_FILE" "Celery Workers" "TERM" "$YELLOW"

echo ""
echo -e "${BOLD}${MAGENTA}[2/3] 🌐 Stopping FastAPI...${NC}"
stop_service "$API_PID_FILE" "FastAPI" "TERM" "$MAGENTA"

echo ""
echo -e "${BOLD}${BLUE}[3/3] 💾 Stopping Redis Server...${NC}"
stop_service "$REDIS_PID_FILE" "Redis" "TERM" "$BLUE"

echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}${BOLD}   🎉 ALL SERVICES STOPPED SUCCESSFULLY! 🎉${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}${CYAN}💡 Tip:${NC} ${DIM}Use ${YELLOW}./start_production.sh${NC}${DIM} to start services again${NC}"
echo ""
echo -e "${DIM}${MAGENTA}                Made with ❤️  by devnolife | $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
