#!/bin/bash

# OPI-LC Management Script
# Usage: ./manage.sh [command]
# Commands: start, stop, test, status, restart, logs, health, help

set -e

# Configuration
API_DIR="/home/indexer/OPI-LC/brc20/api"
API_PORT="3003"
API_URL="http://127.0.0.1:3003"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_api_dir() {
    if [ ! -d "$API_DIR" ]; then
        log_error "API directory not found: $API_DIR"
        exit 1
    fi
}

check_dependencies() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
}

check_database() {
    log_info "Checking database connection..."
    if ! psql -d opi_lc -U indexer -c "SELECT 1;" &> /dev/null; then
        log_error "Database connection failed. Check PostgreSQL and credentials."
        return 1
    fi
    
    # Check if version table has data
    local count=$(psql -d opi_lc -U indexer -t -c "SELECT COUNT(*) FROM brc20_indexer_version;" 2>/dev/null | tr -d ' ')
    if [ "$count" = "0" ]; then
        log_warning "brc20_indexer_version table is empty. Inserting default data..."
        psql -d opi_lc -U indexer -c "INSERT INTO brc20_indexer_version (indexer_version, db_version, event_hash_version) VALUES ('1.0.0', 1, 1);" 2>/dev/null || log_error "Failed to insert version data"
    fi
    
    log_success "Database connection OK"
    return 0
}

is_api_running() {
    if curl -s "$API_URL/v1/brc20/ip" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

get_api_pid() {
    pgrep -f "node.*api.js" || echo ""
}

# Commands
start_api() {
    log_info "Starting OPI-LC API server..."
    
    check_api_dir
    check_dependencies
    
    if is_api_running; then
        log_warning "API is already running on port $API_PORT"
        return 0
    fi
    
    # Check database before starting
    if ! check_database; then
        log_error "Database check failed. Cannot start API."
        return 1
    fi
    
    cd "$API_DIR"
    export API_PORT="$API_PORT"
    
    # Start API in background
    nohup npm start > api.log 2>&1 &
    local pid=$!
    
    # Wait for API to start
    local attempts=0
    while [ $attempts -lt 30 ]; do
        if is_api_running; then
            log_success "API started successfully (PID: $pid)"
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    
    log_error "API failed to start within 30 seconds"
    return 1
}

stop_api() {
    log_info "Stopping OPI-LC API server..."
    
    local pid=$(get_api_pid)
    if [ -z "$pid" ]; then
        log_warning "No API process found"
        return 0
    fi
    
    kill "$pid" 2>/dev/null || true
    sleep 2
    
    # Force kill if still running
    if kill -0 "$pid" 2>/dev/null; then
        log_warning "Force killing API process..."
        kill -9 "$pid" 2>/dev/null || true
    fi
    
    log_success "API stopped"
}

restart_api() {
    log_info "Restarting OPI-LC API server..."
    stop_api
    sleep 2
    start_api
}

status_api() {
    log_info "Checking API status..."
    
    local pid=$(get_api_pid)
    if [ -z "$pid" ]; then
        log_warning "API is not running"
        return 1
    fi
    
    log_success "API is running (PID: $pid)"
    
    if is_api_running; then
        log_success "API is responding on port $API_PORT"
        
        # Test basic endpoints
        log_info "Testing endpoints..."
        
        # Test IP endpoint
        if curl -s "$API_URL/v1/brc20/ip" &> /dev/null; then
            log_success "✓ IP endpoint working"
        else
            log_error "✗ IP endpoint failed"
        fi
        
        # Test database version endpoint
        if curl -s "$API_URL/v1/brc20/db_version" &> /dev/null; then
            log_success "✓ Database version endpoint working"
        else
            log_error "✗ Database version endpoint failed"
        fi
        
        # Test block height endpoint
        if curl -s "$API_URL/v1/brc20/block_height" &> /dev/null; then
            log_success "✓ Block height endpoint working"
        else
            log_error "✗ Block height endpoint failed"
        fi
        
    else
        log_error "API is not responding on port $API_PORT"
        return 1
    fi
}

test_api() {
    log_info "Running API tests..."
    
    if ! is_api_running; then
        log_error "API is not running. Start it first with: ./manage.sh start"
        return 1
    fi
    
    cd "$API_DIR"
    
    if npm test; then
        log_success "All tests passed!"
    else
        log_error "Some tests failed"
        return 1
    fi
}

show_logs() {
    log_info "Showing API logs..."
    
    if [ -f "$API_DIR/api.log" ]; then
        tail -f "$API_DIR/api.log"
    else
        log_warning "No log file found. API may not have been started yet."
    fi
}

health_check() {
    log_info "Performing comprehensive health check..."
    
    # Check dependencies
    log_info "1. Checking dependencies..."
    check_dependencies
    log_success "✓ Dependencies OK"
    
    # Check database
    log_info "2. Checking database..."
    if check_database; then
        log_success "✓ Database OK"
    else
        log_error "✗ Database issues found"
        return 1
    fi
    
    # Check API status
    log_info "3. Checking API status..."
    if status_api; then
        log_success "✓ API OK"
    else
        log_error "✗ API issues found"
        return 1
    fi
    
    # Run tests
    log_info "4. Running tests..."
    if test_api; then
        log_success "✓ Tests OK"
    else
        log_error "✗ Test issues found"
        return 1
    fi
    
    log_success "All health checks passed! 🎉"
}

show_help() {
    echo "OPI-LC Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start the API server"
    echo "  stop      - Stop the API server"
    echo "  restart   - Restart the API server"
    echo "  status    - Check API status and test endpoints"
    echo "  test      - Run all tests (requires API to be running)"
    echo "  logs      - Show API logs"
    echo "  health    - Run comprehensive health check"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start     # Start the API"
    echo "  $0 status    # Check if API is working"
    echo "  $0 test      # Run tests"
    echo "  $0 health    # Full health check"
    echo ""
    echo "Note: Make sure you're in the correct directory: /home/indexer/OPI-LC"
}

# Main script logic
case "${1:-help}" in
    start)
        start_api
        ;;
    stop)
        stop_api
        ;;
    restart)
        restart_api
        ;;
    status)
        status_api
        ;;
    test)
        test_api
        ;;
    logs)
        show_logs
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 