#!/bin/bash
# Production startup script untuk Turnitin Bypass API
# Menggunakan nohup untuk background process yang persistent

set -e

echo "=========================================="
echo "Starting Turnitin Bypass API - Production"
echo "=========================================="

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
            echo -e "${YELLOW}$service_name is already running (PID: $pid)${NC}"
            return 0
        else
            echo -e "${YELLOW}Removing stale PID file for $service_name${NC}"
            rm -f "$pid_file"
        fi
    fi
    return 1
}

# Start Redis
start_redis() {
    echo -e "${GREEN}Starting Redis...${NC}"
    if check_running "$REDIS_PID_FILE" "Redis"; then
        return 0
    fi

    nohup redis-server > "$REDIS_LOG" 2>&1 &
    echo $! > "$REDIS_PID_FILE"
    sleep 2

    if ps -p $(cat "$REDIS_PID_FILE") > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis started (PID: $(cat $REDIS_PID_FILE))${NC}"
    else
        echo -e "${RED}✗ Failed to start Redis${NC}"
        exit 1
    fi
}

# Start FastAPI with Gunicorn
start_api() {
    echo -e "${GREEN}Starting FastAPI with Gunicorn...${NC}"
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

    sleep 3

    if [ -f "$API_PID_FILE" ] && ps -p $(cat "$API_PID_FILE") > /dev/null 2>&1; then
        echo -e "${GREEN}✓ FastAPI started (PID: $(cat $API_PID_FILE))${NC}"
    else
        echo -e "${RED}✗ Failed to start FastAPI${NC}"
        exit 1
    fi
}

# Start Celery Workers
start_celery() {
    echo -e "${GREEN}Starting Celery Workers...${NC}"
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

    echo $! > "$WORKER_PID_FILE"
    sleep 3

    if ps -p $(cat "$WORKER_PID_FILE") > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Celery Workers started (PID: $(cat $WORKER_PID_FILE))${NC}"
    else
        echo -e "${RED}✗ Failed to start Celery Workers${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}Starting all services...${NC}\n"

    # Check if gunicorn is installed
    if ! command -v gunicorn &> /dev/null; then
        echo -e "${RED}Gunicorn not found. Installing...${NC}"
        pip install gunicorn
    fi

    # Check if redis-server is installed
    if ! command -v redis-server &> /dev/null; then
        echo -e "${RED}Redis not found. Please install redis-server first${NC}"
        echo "Ubuntu/Debian: sudo apt-get install redis-server"
        echo "macOS: brew install redis"
        exit 1
    fi

    # Start services in order
    start_redis
    echo ""
    start_api
    echo ""
    start_celery

    echo ""
    echo -e "${GREEN}=========================================="
    echo "All services started successfully!"
    echo "==========================================${NC}"
    echo ""
    echo "Service Status:"
    echo "  Redis:          PID $(cat $REDIS_PID_FILE)"
    echo "  FastAPI:        PID $(cat $API_PID_FILE)"
    echo "  Celery Workers: PID $(cat $WORKER_PID_FILE)"
    echo ""
    echo "Log files:"
    echo "  API:     $API_LOG"
    echo "  Worker:  $WORKER_LOG"
    echo "  Redis:   $REDIS_LOG"
    echo ""
    echo "API URL: http://localhost:8000"
    echo ""
    echo "Useful commands:"
    echo "  ./stop_production.sh     - Stop all services"
    echo "  ./restart_production.sh  - Restart all services"
    echo "  ./status_production.sh   - Check service status"
    echo "  tail -f logs/*.log       - Monitor logs"
}

main
