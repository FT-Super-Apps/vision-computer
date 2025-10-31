#!/bin/bash

# Redis Stop Script
# Gracefully stops Redis server

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Stopping Redis...${NC}"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Try graceful shutdown first
if [ -f "$PROJECT_DIR/redis-cli" ]; then
    $PROJECT_DIR/redis-cli shutdown 2>/dev/null
fi

# Wait a moment
sleep 1

# Check if still running and force kill if necessary
if pgrep -x "redis-server" > /dev/null; then
    echo -e "${BLUE}Forcing Redis shutdown...${NC}"
    pkill -9 redis-server
    sleep 1
fi

# Verify stopped
if pgrep -x "redis-server" > /dev/null; then
    echo -e "${RED}❌ Failed to stop Redis${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Redis stopped successfully${NC}"
fi
