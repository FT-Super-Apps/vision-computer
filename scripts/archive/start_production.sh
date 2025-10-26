#!/bin/bash
# Production startup script untuk Turnitin Bypass API
# Menggunakan nohup untuk background process yang persistent
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
echo "║             BYPASS API - Production Mode                  ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${MAGENTA}${BOLD}           ⚡ Crafted with passion by devnolife ⚡${NC}"
echo ""
echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Directories
WORK_DIR="/workspaces/vision-computer"
LOG_DIR="$WORK_DIR/logs"
PID_DIR="$WORK_DIR/pids"

# Create necessary directories
mkdir -p "$LOG_DIR"
mkdir -p "$PID_DIR"
mkdir -p "$WORK_DIR/uploads"
mkdir -p "$WORK_DIR/outputs"
mkdir -p "$WORK_DIR/temp"

# PID files
API_PID_FILE="$PID_DIR/api.pid"
WORKER_PID_FILE="$PID_DIR/celery_worker.pid"
REDIS_PID_FILE="$PID_DIR/redis.pid"

# Log files
API_LOG="$LOG_DIR/api.log"
WORKER_LOG="$LOG_DIR/celery_worker.log"
REDIS_LOG="$LOG_DIR/redis.log"

# Check if already running
check_running() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}${BOLD}⚠️  $service_name is already running ${NC}${CYAN}(PID: $pid)${NC}"
            return 0
        else
            echo -e "${DIM}${YELLOW}🧹 Removing stale PID file for $service_name${NC}"
            rm -f "$pid_file"
        fi
    fi
    return 1
}

# Start Redis
start_redis() {
    echo -e "${BOLD}${BLUE}[1/3] 🚀 Starting Redis Server...${NC}"
    if check_running "$REDIS_PID_FILE" "Redis"; then
        return 0
    fi

    nohup redis-server > "$REDIS_LOG" 2>&1 &
    echo $! > "$REDIS_PID_FILE"

    # Loading animation
    echo -ne "${DIM}      Loading"
    for i in {1..3}; do
        sleep 0.5
        echo -ne "."
    done
    echo -e "${NC}"
    sleep 0.5

    if ps -p $(cat "$REDIS_PID_FILE") > /dev/null 2>&1; then
        echo -e "${GREEN}${BOLD}      ✅ Redis started successfully ${NC}${DIM}(PID: $(cat $REDIS_PID_FILE))${NC}"
    else
        echo -e "${RED}${BOLD}      ❌ Failed to start Redis${NC}"
        exit 1
    fi
}

# Start FastAPI with Gunicorn
start_api() {
    echo -e "${BOLD}${MAGENTA}[2/3] 🌐 Starting FastAPI with Gunicorn...${NC}"
    if check_running "$API_PID_FILE" "FastAPI"; then
        return 0
    fi

    cd "$WORK_DIR"
    nohup gunicorn app.main:app \
        --workers 4 \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:8000 \
        --timeout 300 \
        --keep-alive 5 \
        --log-level info \
        --access-logfile "$LOG_DIR/access.log" \
        --error-logfile "$LOG_DIR/error.log" \
        --pid "$API_PID_FILE" \
        > "$API_LOG" 2>&1 &

    # Loading animation
    echo -ne "${DIM}      Loading"
    for i in {1..5}; do
        sleep 0.5
        echo -ne "."
    done
    echo -e "${NC}"
    sleep 0.5

    if [ -f "$API_PID_FILE" ] && ps -p $(cat "$API_PID_FILE") > /dev/null 2>&1; then
        echo -e "${GREEN}${BOLD}      ✅ FastAPI started successfully ${NC}${DIM}(PID: $(cat $API_PID_FILE))${NC}"
        echo -e "${DIM}${CYAN}      └─ Running on http://0.0.0.0:8000 with 4 workers${NC}"
    else
        echo -e "${RED}${BOLD}      ❌ Failed to start FastAPI${NC}"
        exit 1
    fi
}

# Start Celery Workers
start_celery() {
    echo -e "${BOLD}${YELLOW}[3/3] 🔥 Starting Celery Workers...${NC}"
    if check_running "$WORKER_PID_FILE" "Celery Workers"; then
        return 0
    fi

    cd "$WORK_DIR"
    nohup celery -A app.celery_app worker \
        --loglevel=info \
        --concurrency=4 \
        --pool=prefork \
        --queues=unified,analysis,matching,bypass \
        --max-tasks-per-child=10 \
        --time-limit=600 \
        --soft-time-limit=540 \
        --pidfile="$WORKER_PID_FILE" \
        --logfile="$WORKER_LOG" \
        > "$WORKER_LOG" 2>&1 &

    # Loading animation
    echo -ne "${DIM}      Loading"
    for i in {1..5}; do
        sleep 0.5
        echo -ne "."
    done
    echo -e "${NC}"
    sleep 1

    # Wait for PID file to be created by Celery
    local wait_count=0
    while [ ! -f "$WORKER_PID_FILE" ] && [ $wait_count -lt 10 ]; do
        sleep 0.5
        wait_count=$((wait_count + 1))
    done

    if [ -f "$WORKER_PID_FILE" ] && ps -p $(cat "$WORKER_PID_FILE") > /dev/null 2>&1; then
        echo -e "${GREEN}${BOLD}      ✅ Celery Workers started successfully ${NC}${DIM}(PID: $(cat $WORKER_PID_FILE))${NC}"
        echo -e "${DIM}${CYAN}      └─ Concurrency: 4 | Queues: unified, analysis, matching, bypass${NC}"
    else
        echo -e "${RED}${BOLD}      ❌ Failed to start Celery Workers${NC}"
        exit 1
    fi
}

# Main execution
main() {
    # Check if gunicorn is installed
    if ! command -v gunicorn &> /dev/null; then
        echo -e "${YELLOW}${BOLD}📦 Gunicorn not found. Installing...${NC}"
        pip install gunicorn
        echo ""
    fi

    # Check if redis-server is installed
    if ! command -v redis-server &> /dev/null; then
        echo -e "${RED}${BOLD}❌ Redis not found. Please install redis-server first${NC}"
        echo -e "${DIM}Ubuntu/Debian: sudo apt-get install redis-server${NC}"
        echo -e "${DIM}macOS: brew install redis${NC}"
        exit 1
    fi

    # Start services in order
    start_redis
    echo ""
    start_api
    echo ""
    start_celery

    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}${BOLD}   🎉 ALL SERVICES STARTED SUCCESSFULLY! 🎉${NC}"
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}📊 Service Status:${NC}"
    echo -e "${DIM}├─${NC} ${BLUE}Redis Server${NC}          ${GREEN}✓${NC} ${DIM}PID $(cat $REDIS_PID_FILE)${NC}"
    echo -e "${DIM}├─${NC} ${MAGENTA}FastAPI${NC}               ${GREEN}✓${NC} ${DIM}PID $(cat $API_PID_FILE)${NC}"
    echo -e "${DIM}└─${NC} ${YELLOW}Celery Workers${NC}        ${GREEN}✓${NC} ${DIM}PID $(cat $WORKER_PID_FILE)${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}📁 Log Files:${NC}"
    echo -e "${DIM}├─${NC} API:     ${DIM}$API_LOG${NC}"
    echo -e "${DIM}├─${NC} Access:  ${DIM}$LOG_DIR/access.log${NC}"
    echo -e "${DIM}├─${NC} Error:   ${DIM}$LOG_DIR/error.log${NC}"
    echo -e "${DIM}├─${NC} Worker:  ${DIM}$WORKER_LOG${NC}"
    echo -e "${DIM}└─${NC} Redis:   ${DIM}$REDIS_LOG${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}🌐 API Endpoint:${NC}"
    echo -e "   ${GREEN}${BOLD}http://localhost:8000${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}⚡ Quick Commands:${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./stop_production.sh${NC}      ${DIM}Stop all services${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./restart_production.sh${NC}   ${DIM}Restart all services${NC}"
    echo -e "${DIM}├─${NC} ${YELLOW}./status_production.sh${NC}    ${DIM}Check service status${NC}"
    echo -e "${DIM}└─${NC} ${YELLOW}tail -f logs/*.log${NC}        ${DIM}Monitor logs in real-time${NC}"
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${DIM}${MAGENTA}                Made with ❤️  by devnolife | $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
}

main
