#!/bin/bash
# PM2-like interface untuk production scripts
# Usage: ./pm2-like.sh [start|stop|restart|status|logs]

COMMAND=$1

show_help() {
    echo "=========================================="
    echo "Turnitin Bypass API - PM2-like Manager"
    echo "=========================================="
    echo ""
    echo "Usage: ./pm2-like.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs        Show real-time logs"
    echo "  monit       Monitor services"
    echo "  help        Show this help"
    echo ""
    echo "Examples:"
    echo "  ./pm2-like.sh start"
    echo "  ./pm2-like.sh logs"
    echo "  ./pm2-like.sh status"
}

case "$COMMAND" in
    start)
        echo "Starting services..."
        ./start_production.sh
        ;;
    stop)
        echo "Stopping services..."
        ./stop_production.sh
        ;;
    restart)
        echo "Restarting services..."
        ./restart_production.sh
        ;;
    status)
        ./status_production.sh
        ;;
    logs)
        echo "Showing real-time logs (Ctrl+C to exit)..."
        echo "=========================================="
        tail -f logs/*.log
        ;;
    monit)
        echo "Monitoring services (Ctrl+C to exit)..."
        echo "=========================================="
        watch -n 2 ./status_production.sh
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo ""
        show_help
        exit 1
        ;;
esac
