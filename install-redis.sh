#!/bin/bash

# Redis Installation Script
# For Ubuntu/Debian systems

set -e

echo "=========================================="
echo "  Redis Installation for Rumah Plagiasi  "
echo "=========================================="
echo ""

# Check if running on Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    echo "❌ Error: This script is for Ubuntu/Debian systems only"
    echo "For other systems, please install Redis manually:"
    echo "  - macOS: brew install redis"
    echo "  - Windows: Use WSL2 or Docker"
    exit 1
fi

# Check if Redis is already installed
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is already installed!"
    redis-server --version
    echo ""
    echo "To start Redis:"
    echo "  sudo systemctl start redis"
    echo "  sudo systemctl enable redis  # Auto-start on boot"
    exit 0
fi

echo "📦 Installing Redis..."
echo ""

# Update package list
echo "1️⃣ Updating package list..."
sudo apt update

# Install Redis
echo ""
echo "2️⃣ Installing Redis server..."
sudo apt install -y redis-server

# Configure Redis to start on boot
echo ""
echo "3️⃣ Configuring Redis..."
# Try different service names (redis or redis-server)
if sudo systemctl enable redis-server 2>/dev/null; then
    echo "✅ Enabled redis-server service"
elif sudo systemctl enable redis 2>/dev/null; then
    echo "✅ Enabled redis service"
else
    echo "⚠️  Could not enable auto-start (this is usually OK)"
fi

# Start Redis
echo ""
echo "4️⃣ Starting Redis..."
# Try different service names
if sudo systemctl start redis-server 2>/dev/null; then
    echo "✅ Started redis-server service"
    REDIS_SERVICE="redis-server"
elif sudo systemctl start redis 2>/dev/null; then
    echo "✅ Started redis service"
    REDIS_SERVICE="redis"
else
    echo "⚠️  Could not start via systemctl, trying direct start..."
    redis-server --daemonize yes
    REDIS_SERVICE="direct"
fi

# Wait a moment for Redis to start
sleep 2

# Check Redis status
echo ""
echo "5️⃣ Checking Redis status..."
if [ "$REDIS_SERVICE" = "redis-server" ]; then
    if sudo systemctl is-active --quiet redis-server; then
        echo "✅ Redis is running (redis-server)!"
    else
        echo "⚠️  Redis service status:"
        sudo systemctl status redis-server --no-pager
    fi
elif [ "$REDIS_SERVICE" = "redis" ]; then
    if sudo systemctl is-active --quiet redis; then
        echo "✅ Redis is running (redis)!"
    else
        echo "⚠️  Redis service status:"
        sudo systemctl status redis --no-pager
    fi
else
    echo "✅ Redis started in daemon mode"
fi

# Test Redis connection
echo ""
echo "6️⃣ Testing Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis connection successful! (PONG)"
else
    echo "❌ Cannot connect to Redis"
    echo "Try starting manually: sudo systemctl start redis"
    exit 1
fi

echo ""
echo "=========================================="
echo "  ✅ Redis Installation Complete!"
echo "=========================================="
echo ""
echo "📝 Useful Redis commands:"
echo ""
if [ "$REDIS_SERVICE" = "redis-server" ]; then
    echo "  # Check status"
    echo "  sudo systemctl status redis-server"
    echo ""
    echo "  # Start/Stop/Restart"
    echo "  sudo systemctl start redis-server"
    echo "  sudo systemctl stop redis-server"
    echo "  sudo systemctl restart redis-server"
elif [ "$REDIS_SERVICE" = "redis" ]; then
    echo "  # Check status"
    echo "  sudo systemctl status redis"
    echo ""
    echo "  # Start/Stop/Restart"
    echo "  sudo systemctl start redis"
    echo "  sudo systemctl stop redis"
    echo "  sudo systemctl restart redis"
else
    echo "  # Check if running"
    echo "  redis-cli ping"
    echo ""
    echo "  # Start manually"
    echo "  redis-server --daemonize yes"
    echo ""
    echo "  # Stop manually"
    echo "  redis-cli shutdown"
fi
echo ""
echo "  # Test connection"
echo "  redis-cli ping"
echo ""
echo "  # Redis CLI"
echo "  redis-cli"
echo ""
echo "  # Monitor Redis commands"
echo "  redis-cli monitor"
echo ""
echo "  # View all keys"
echo "  redis-cli keys '*'"
echo ""
echo "  # Flush all data (⚠️ DELETES EVERYTHING)"
echo "  redis-cli flushall"
echo ""
echo "You can now continue with the backend setup!"
echo ""
