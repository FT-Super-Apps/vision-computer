#!/bin/bash
# Stop production services

set -e

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
echo "Stopping Turnitin Bypass API - Production"
echo "=========================================="

# Function to stop a service
stop_service() {
    local pid_file=$1
    local service_name=$2
    local signal=${3:-TERM}

    if [ ! -f "$pid_file" ]; then
        echo -e "${YELLOW}$service_name is not running (no PID file)${NC}"
        return 0
    fi

    local pid=$(cat "$pid_file")

    if ! ps -p $pid > /dev/null 2>&1; then
        echo -e "${YELLOW}$service_name is not running (stale PID file)${NC}"
        rm -f "$pid_file"
        return 0
    fi

    echo -e "${GREEN}Stopping $service_name (PID: $pid)...${NC}"
    kill -$signal $pid

    # Wait for process to stop
    local count=0
    while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
        sleep 1
        count=$((count + 1))
    done

    # Force kill if still running
    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${YELLOW}Force killing $service_name...${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi

    rm -f "$pid_file"
    echo -e "${GREEN}✓ $service_name stopped${NC}"
}

# Stop services in reverse order
echo -e "${YELLOW}Stopping all services...${NC}\n"

stop_service "$WORKER_PID_FILE" "Celery Workers"
echo ""
stop_service "$API_PID_FILE" "FastAPI"
echo ""
stop_service "$REDIS_PID_FILE" "Redis"

echo ""
echo -e "${GREEN}=========================================="
echo "All services stopped successfully!"
echo "==========================================${NC}"
