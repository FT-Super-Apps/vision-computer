#!/bin/bash
# Script untuk start/stop FastAPI server

ACTION=${1:-start}
PID_FILE="/tmp/turnitin_api.pid"

case "$ACTION" in
  start)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat $PID_FILE)
      if ps -p $PID > /dev/null 2>&1; then
        echo "❌ Server already running (PID: $PID)"
        echo "Use './run_api.sh stop' to stop it first"
        exit 1
      fi
    fi
    
    echo "🚀 Starting Turnitin Bypass API..."
    cd /workspaces/vision-computer
    nohup python api/main.py > /tmp/api.log 2>&1 & echo $! > $PID_FILE
    sleep 2
    
    PID=$(cat $PID_FILE)
    if ps -p $PID > /dev/null 2>&1; then
      echo "✅ Server started successfully (PID: $PID)"
      echo "📡 API running at: http://localhost:8000"
      echo "📚 API Docs: http://localhost:8000/docs"
      echo "📋 Logs: tail -f /tmp/api.log"
    else
      echo "❌ Failed to start server"
      echo "Check logs: cat /tmp/api.log"
      rm -f $PID_FILE
      exit 1
    fi
    ;;
    
  stop)
    if [ ! -f "$PID_FILE" ]; then
      echo "❌ Server not running (no PID file)"
      exit 1
    fi
    
    PID=$(cat $PID_FILE)
    if ps -p $PID > /dev/null 2>&1; then
      echo "🛑 Stopping server (PID: $PID)..."
      kill $PID
      sleep 1
      
      if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Force killing..."
        kill -9 $PID
      fi
      
      rm -f $PID_FILE
      echo "✅ Server stopped"
    else
      echo "❌ Server not running (PID $PID not found)"
      rm -f $PID_FILE
    fi
    ;;
    
  restart)
    $0 stop
    sleep 1
    $0 start
    ;;
    
  status)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat $PID_FILE)
      if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Server is running (PID: $PID)"
        echo "📡 API: http://localhost:8000"
        echo ""
        curl -s http://localhost:8000/ | python -m json.tool
      else
        echo "❌ Server not running (stale PID file)"
        rm -f $PID_FILE
      fi
    else
      echo "❌ Server not running"
    fi
    ;;
    
  logs)
    if [ -f "/tmp/api.log" ]; then
      tail -f /tmp/api.log
    else
      echo "❌ No log file found"
    fi
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the API server"
    echo "  stop    - Stop the API server"
    echo "  restart - Restart the API server"
    echo "  status  - Check server status"
    echo "  logs    - Show server logs (tail -f)"
    exit 1
    ;;
esac
