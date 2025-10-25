#!/bin/bash
# Restart production services

set -e

echo "=========================================="
echo "Restarting Turnitin Bypass API"
echo "=========================================="

# Stop services
echo "Stopping services..."
./stop_production.sh

echo ""
echo "Waiting 3 seconds..."
sleep 3
echo ""

# Start services
echo "Starting services..."
./start_production.sh
