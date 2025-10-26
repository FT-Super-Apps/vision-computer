#!/bin/bash
# Check status of production services
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

# Directories
WORK_DIR="/workspaces/vision-computer"
PID_DIR="$WORK_DIR/pids"

# PID files
API_PID_FILE="$PID_DIR/api.pid"
WORKER_PID_FILE="$PID_DIR/celery_worker.pid"
REDIS_PID_FILE="$PID_DIR/redis.pid"

# ASCII Art Banner
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
echo "║                  ${WHITE}${BOLD}STATUS - Production Services${CYAN}${BOLD}                      ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${MAGENTA}${BOLD}           📊 Crafted with passion by devnolife 📊${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to check service status
check_service() {
    local pid_file=$1
    local service_name=$2
    local icon=$3
    local color=$4

    if [ ! -f "$pid_file" ]; then
        echo -e "${DIM}├─${NC} $icon ${color}${service_name}${NC}$(printf '%*s' $((30-${#service_name})) '')${RED}${BOLD}⭘ NOT RUNNING${NC} ${DIM}(no PID file)${NC}"
        return 1
    fi

    local pid=$(cat "$pid_file")

    if ps -p $pid > /dev/null 2>&1; then
        # Get CPU and memory usage
        local cpu_mem=$(ps -p $pid -o %cpu,%mem --no-headers 2>/dev/null | awk '{print $1"% CPU, "$2"% MEM"}')
        echo -e "${DIM}├─${NC} $icon ${color}${service_name}${NC}$(printf '%*s' $((30-${#service_name})) '')${GREEN}${BOLD}● RUNNING${NC} ${DIM}(PID: $pid | $cpu_mem)${NC}"
        return 0
    else
        echo -e "${DIM}├─${NC} $icon ${color}${service_name}${NC}$(printf '%*s' $((30-${#service_name})) '')${RED}${BOLD}⭘ NOT RUNNING${NC} ${DIM}(stale PID: $pid)${NC}"
        return 1
    fi
}

# Check all services
echo -e "${BOLD}${CYAN}🖥️  Service Status:${NC}"
check_service "$REDIS_PID_FILE" "Redis Server" "💾" "$BLUE"
check_service "$API_PID_FILE" "FastAPI (Gunicorn)" "🌐" "$MAGENTA"
check_service "$WORKER_PID_FILE" "Celery Workers" "🔥" "$YELLOW"

echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}${CYAN}🔌 System Health:${NC}"

# Check API endpoint
echo -n -e "${DIM}├─${NC} 🌐 ${MAGENTA}API Health Check${NC}$(printf '%*s' 18 '')"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}${BOLD}✓ OK${NC} ${DIM}(http://localhost:8000)${NC}"
else
    echo -e "${RED}${BOLD}✗ FAILED${NC} ${DIM}(API not responding)${NC}"
fi

# Check Redis connection
echo -n -e "${DIM}├─${NC} 💾 ${BLUE}Redis Connection${NC}$(printf '%*s' 17 '')"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}${BOLD}✓ OK${NC} ${DIM}(PONG received)${NC}"
else
    echo -e "${RED}${BOLD}✗ FAILED${NC} ${DIM}(No response)${NC}"
fi

# Check disk space
echo -n -e "${DIM}├─${NC} 💿 ${YELLOW}Disk Space${NC}$(printf '%*s' 23 '')"
disk_usage=$(df -h "$WORK_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    echo -e "${GREEN}${BOLD}✓ OK${NC} ${DIM}($disk_usage% used)${NC}"
elif [ "$disk_usage" -lt 90 ]; then
    echo -e "${YELLOW}${BOLD}⚠ WARNING${NC} ${DIM}($disk_usage% used)${NC}"
else
    echo -e "${RED}${BOLD}✗ CRITICAL${NC} ${DIM}($disk_usage% used)${NC}"
fi

# Check log directory
echo -n -e "${DIM}└─${NC} 📁 ${CYAN}Log Directory${NC}$(printf '%*s' 20 '')"
if [ -d "$WORK_DIR/logs" ]; then
    log_count=$(ls -1 "$WORK_DIR/logs" 2>/dev/null | wc -l)
    echo -e "${GREEN}${BOLD}✓ OK${NC} ${DIM}($log_count log files)${NC}"
else
    echo -e "${RED}${BOLD}✗ NOT FOUND${NC}"
fi

echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}${CYAN}📝 Recent Logs (Last 5 lines):${NC}"

if [ -f "$WORK_DIR/logs/api.log" ]; then
    echo -e "${DIM}╭─ ${MAGENTA}API Log:${NC}"
    tail -n 5 "$WORK_DIR/logs/api.log" 2>/dev/null | while IFS= read -r line; do
        echo -e "${DIM}│${NC}  $line"
    done
    echo -e "${DIM}╰─────────────────────────────────────────────────────────────────────${NC}"
else
    echo -e "${DIM}╰─${NC} ${YELLOW}No API logs available${NC}"
fi

echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}${CYAN}💡 Useful Commands:${NC}"
echo -e "${DIM}├─${NC} ${YELLOW}tail -f logs/*.log${NC}          ${DIM}Monitor all logs in real-time${NC}"
echo -e "${DIM}├─${NC} ${YELLOW}./start_production.sh${NC}      ${DIM}Start all services${NC}"
echo -e "${DIM}├─${NC} ${YELLOW}./stop_production.sh${NC}       ${DIM}Stop all services${NC}"
echo -e "${DIM}└─${NC} ${YELLOW}./restart_production.sh${NC}    ${DIM}Restart all services${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${DIM}${MAGENTA}                Made with ❤️  by devnolife | $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
