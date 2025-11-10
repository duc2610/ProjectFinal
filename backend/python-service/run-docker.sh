#!/bin/bash

# Script helper để chạy Python services với Docker
# Usage: ./run-docker.sh [command] [service]
# Commands: start, stop, restart, logs, status, rebuild

set -e

COMMAND=${1:-start}
SERVICE=${2:-all}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect Docker Compose command (v1: docker-compose, v2: docker compose)
detect_docker_compose() {
    # Try docker compose (v2) first
    if command -v docker &> /dev/null; then
        if docker compose version &> /dev/null; then
            echo "docker compose"
            return 0
        fi
    fi
    
    # Try docker-compose (v1)
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
        return 0
    fi
    
    return 1
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH!"
        echo ""
        echo "Please install Docker from: https://www.docker.com/get-started"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker ps &> /dev/null; then
        print_error "Docker daemon is not running!"
        echo ""
        echo "Please start Docker and try again."
        exit 1
    fi
    
    # Check Docker Compose
    DOCKER_COMPOSE_CMD=$(detect_docker_compose)
    if [ $? -ne 0 ]; then
        print_error "Docker Compose is not available!"
        echo ""
        echo "Docker Compose should be included with Docker."
        echo "If you're using Docker Compose v2, make sure Docker is up to date."
        exit 1
    fi
    
    print_info "Using: $DOCKER_COMPOSE_CMD"
    export DOCKER_COMPOSE_CMD
}

# Check if .env file exists
check_env() {
    if [ ! -f "../.env" ]; then
        print_warn ".env file not found!"
        echo "Please create .env file in the backend root directory with:"
        echo "  - GEMINI_API_KEY"
        echo "  - AZURE_SPEECH_KEY (for speaking-api)"
        echo "  - AZURE_SPEECH_REGION (for speaking-api)"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Start services
start_services() {
    print_info "Starting Python services..."
    check_env
    check_docker
    
    cd ..
    
    if [ "$SERVICE" = "all" ]; then
        $DOCKER_COMPOSE_CMD up -d
        if [ $? -ne 0 ]; then
            print_error "Failed to start services!"
            exit 1
        fi
        print_info "All services started!"
    elif [ "$SERVICE" = "writing" ]; then
        $DOCKER_COMPOSE_CMD up -d writing-api
        if [ $? -ne 0 ]; then
            print_error "Failed to start writing-api!"
            exit 1
        fi
        print_info "Writing API started!"
    elif [ "$SERVICE" = "speaking" ]; then
        $DOCKER_COMPOSE_CMD up -d speaking-api
        if [ $? -ne 0 ]; then
            print_error "Failed to start speaking-api!"
            exit 1
        fi
        print_info "Speaking API started!"
    else
        print_error "Unknown service: $SERVICE"
        echo "Available services: all, writing, speaking"
        exit 1
    fi
    
    echo ""
    print_info "Services status:"
    $DOCKER_COMPOSE_CMD ps
}

# Stop services
stop_services() {
    print_info "Stopping Python services..."
    check_docker
    cd ..
    
    if [ "$SERVICE" = "all" ]; then
        $DOCKER_COMPOSE_CMD down
        print_info "All services stopped!"
    elif [ "$SERVICE" = "writing" ]; then
        $DOCKER_COMPOSE_CMD stop writing-api
        print_info "Writing API stopped!"
    elif [ "$SERVICE" = "speaking" ]; then
        $DOCKER_COMPOSE_CMD stop speaking-api
        print_info "Speaking API stopped!"
    else
        print_error "Unknown service: $SERVICE"
        exit 1
    fi
}

# Restart services
restart_services() {
    print_info "Restarting Python services..."
    check_docker
    cd ..
    
    if [ "$SERVICE" = "all" ]; then
        $DOCKER_COMPOSE_CMD restart
        print_info "All services restarted!"
    elif [ "$SERVICE" = "writing" ]; then
        $DOCKER_COMPOSE_CMD restart writing-api
        print_info "Writing API restarted!"
    elif [ "$SERVICE" = "speaking" ]; then
        $DOCKER_COMPOSE_CMD restart speaking-api
        print_info "Speaking API restarted!"
    else
        print_error "Unknown service: $SERVICE"
        exit 1
    fi
}

# Show logs
show_logs() {
    check_docker
    cd ..
    
    if [ "$SERVICE" = "all" ]; then
        $DOCKER_COMPOSE_CMD logs -f
    elif [ "$SERVICE" = "writing" ]; then
        $DOCKER_COMPOSE_CMD logs -f writing-api
    elif [ "$SERVICE" = "speaking" ]; then
        $DOCKER_COMPOSE_CMD logs -f speaking-api
    else
        print_error "Unknown service: $SERVICE"
        exit 1
    fi
}

# Show status
show_status() {
    check_docker
    cd ..
    print_info "Services status:"
    $DOCKER_COMPOSE_CMD ps
    echo ""
    print_info "Health checks:"
    echo "Writing API: http://localhost:8002/health"
    echo "Speaking API: http://localhost:8001/health"
}

# Rebuild services
rebuild_services() {
    print_info "Rebuilding Python services..."
    check_env
    check_docker
    cd ..
    
    if [ "$SERVICE" = "all" ]; then
        $DOCKER_COMPOSE_CMD up -d --build
        if [ $? -ne 0 ]; then
            print_error "Failed to rebuild services!"
            exit 1
        fi
        print_info "All services rebuilt and started!"
    elif [ "$SERVICE" = "writing" ]; then
        $DOCKER_COMPOSE_CMD up -d --build writing-api
        if [ $? -ne 0 ]; then
            print_error "Failed to rebuild writing-api!"
            exit 1
        fi
        print_info "Writing API rebuilt and started!"
    elif [ "$SERVICE" = "speaking" ]; then
        $DOCKER_COMPOSE_CMD up -d --build speaking-api
        if [ $? -ne 0 ]; then
            print_error "Failed to rebuild speaking-api!"
            exit 1
        fi
        print_info "Speaking API rebuilt and started!"
    else
        print_error "Unknown service: $SERVICE"
        exit 1
    fi
}

# Show help
show_help() {
    echo "Usage: ./run-docker.sh [command] [service]"
    echo ""
    echo "Commands:"
    echo "  start     Start services (default)"
    echo "  stop      Stop services"
    echo "  restart   Restart services"
    echo "  logs      Show logs (follow mode)"
    echo "  status    Show services status"
    echo "  rebuild   Rebuild and start services"
    echo "  help      Show this help message"
    echo ""
    echo "Services:"
    echo "  all       All services (default)"
    echo "  writing   Writing API only"
    echo "  speaking  Speaking API only"
    echo ""
    echo "Examples:"
    echo "  ./run-docker.sh start              # Start all services"
    echo "  ./run-docker.sh start writing       # Start writing API only"
    echo "  ./run-docker.sh logs speaking       # Show speaking API logs"
    echo "  ./run-docker.sh rebuild all         # Rebuild all services"
}

# Main
case $COMMAND in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    rebuild)
        rebuild_services
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac

