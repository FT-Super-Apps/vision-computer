#!/bin/bash
# Check status of production services

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Directories
WORK_DIR="/workspaces/vision-computer"
PID_DIR="$WORK_DIR/pids"

# PID files
API_PID_FILE="$PID_DIR/api.pid"
WORKER_PID_FILE="$PID_DIR/celery_worker.pid"
REDIS_PID_FILE="$PID_DIR/redis.pid"

echo "=========================================="
echo "Service Status - Turnitin Bypass API"
echo "=========================================="
echo ""

# Function to check service status
check_service() {
    local pid_file=$1
    local service_name=$2

    printf "%-20s " "$service_name:"

    if [ ! -f "$pid_file" ]; then
        echo -e "${RED}NOT RUNNING${NC} (no PID file)"
        return 1
    fi

    local pid=$(cat "$pid_file")

    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${GREEN}RUNNING${NC} (PID: $pid)"
        return 0
    else
        echo -e "${RED}NOT RUNNING${NC} (stale PID: $pid)"
        return 1
    fi
}

# Check all services
check_service "$REDIS_PID_FILE" "Redis"
check_service "$API_PID_FILE" "FastAPI (Gunicorn)"
check_service "$WORKER_PID_FILE" "Celery Workers"

echo ""
echo "=========================================="
echo "System Information"
echo "=========================================="

# Check API endpoint
echo -n "API Health Check:    "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC} (http://localhost:8000)"
else
    echo -e "${RED}FAILED${NC}"
fi

# Check Redis
echo -n "Redis Connection:    "
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

echo ""
echo "Recent logs (last 5 lines):"
echo "-------------------------------------------"
if [ -f "$WORK_DIR/logs/api.log" ]; then
    echo -e "${YELLOW}API Log:${NC}"
    tail -n 5 "$WORK_DIR/logs/api.log" 2>/dev/null || echo "No logs available"
fi
echo ""

echo "To view full logs: tail -f logs/*.log"
