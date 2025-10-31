#!/bin/bash

# Redis Starter Script
# Starts Redis server if not already running

set -e

REDIS_PORT=6379
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
REDIS_SERVER="$PROJECT_DIR/redis-server"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking Redis status...${NC}"

# Check if Redis is already running
if pgrep -x "redis-server" > /dev/null; then
    echo -e "${GREEN}✅ Redis is already running${NC}"
    $PROJECT_DIR/redis-cli ping
    exit 0
fi

# Check if redis-server binary exists
if [ ! -f "$REDIS_SERVER" ]; then
    echo -e "${RED}❌ Redis server not found at $REDIS_SERVER${NC}"
    echo -e "${BLUE}Please run the installation first${NC}"
    exit 1
fi

# Start Redis
echo -e "${BLUE}🚀 Starting Redis server...${NC}"
$REDIS_SERVER --daemonize yes --port $REDIS_PORT

# Wait a moment for Redis to start
sleep 1

# Test connection
if $PROJECT_DIR/redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis started successfully on port $REDIS_PORT${NC}"
else
    echo -e "${RED}❌ Redis failed to start${NC}"
    exit 1
fi
