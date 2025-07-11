# OPI-LC Monitoring Guide

This guide provides comprehensive monitoring strategies for OPI-LC deployments, including health checks, alerting, and troubleshooting procedures.

## Monitoring Overview

Effective monitoring of OPI-LC involves tracking:
- **System Health**: Database connectivity, process status
- **Performance Metrics**: Block processing rate, API response times
- **Data Integrity**: Hash validation, event processing accuracy
- **Resource Usage**: CPU, memory, disk space, network

## Monitoring Components

### 1. System Health Monitoring

#### Process Status Monitoring

**Check Light Client Process:**
```bash
# Check if light client is running
ps aux | grep "brc20_light_client"

# Check screen sessions
screen -ls | grep opi-light-client

# Check systemd service (if using systemd)
sudo systemctl status opi-light-client.service
```

**Check API Service Process:**
```bash
# Check if API service is running
ps aux | grep "api.js"

# Check screen sessions
screen -ls | grep opi-api

# Check systemd service (if using systemd)
sudo systemctl status opi-api.service
```

#### Database Health Monitoring

**PostgreSQL Health Check:**
```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# Test database connection
cd OPI-LC/brc20/psql
python3 -c "
import psycopg2
from dotenv import load_dotenv
import os
load_dotenv()
try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_DATABASE'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWD')
    )
    print('Database connection: OK')
    conn.close()
except Exception as e:
    print(f'Database connection: FAILED - {e}')
"
```

**SQLite Health Check:**
```bash
# Check SQLite database file
cd OPI-LC/brc20/sqlite
ls -la db.sqlite3

# Test database connection
python3 -c "
import sqlite3
from dotenv import load_dotenv
import os
load_dotenv()
try:
    conn = sqlite3.connect(os.getenv('DB_DATABASE_FILE'))
    print('Database connection: OK')
    conn.close()
except Exception as e:
    print(f'Database connection: FAILED - {e}')
"
```

### 2. API Health Monitoring

#### Basic Health Checks

**Test API Endpoints:**
```bash
# Test block height endpoint
curl -s http://127.0.0.1:8000/v1/brc20/block_height

# Test IP endpoint
curl -s http://127.0.0.1:8000/v1/brc20/ip

# Test database version
curl -s http://127.0.0.1:8000/v1/brc20/db_version

# Test event hash version
curl -s http://127.0.0.1:8000/v1/brc20/event_hash_version
```

#### Response Time Monitoring

**API Performance Test:**
```bash
# Test API response time
time curl -s http://127.0.0.1:8000/v1/brc20/block_height

# Load test (install apache2-utils first)
ab -n 100 -c 10 http://127.0.0.1:8000/v1/brc20/block_height
```

### 3. Data Integrity Monitoring

#### Hash Validation Monitoring

**Check Hash Consistency:**
```bash
# Monitor light client logs for hash validation
tail -f /path/to/light-client.log | grep "hash"

# Check for hash mismatch errors
grep -i "hash.*mismatch" /path/to/light-client.log
```

#### Block Processing Monitoring

**Monitor Block Processing:**
```bash
# Check current block height
curl -s http://127.0.0.1:8000/v1/brc20/block_height

# Monitor block processing rate
watch -n 5 'curl -s http://127.0.0.1:8000/v1/brc20/block_height'
```

### 4. Resource Monitoring

#### System Resource Monitoring

**CPU and Memory Usage:**
```bash
# Install htop for better monitoring
sudo apt install htop

# Monitor system resources
htop

# Check specific process resource usage
ps aux | grep "brc20_light_client"
ps aux | grep "api.js"
```

**Disk Space Monitoring:**
```bash
# Check disk usage
df -h

# Check database size (PostgreSQL)
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('postgres'));"

# Check database size (SQLite)
ls -lh OPI-LC/brc20/sqlite/db.sqlite3
```

**Network Monitoring:**
```bash
# Monitor network connections
netstat -tlnp | grep :8000

# Check network I/O
iftop -i eth0
```

## Automated Monitoring Scripts

### 1. Health Check Script

Create a comprehensive health check script:

```bash
#!/bin/bash
# health_check.sh

# Configuration
API_URL="http://127.0.0.1:8000"
LOG_FILE="/var/log/opi-health.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check light client process
if pgrep -f "brc20_light_client" > /dev/null; then
    log_message "Light client: RUNNING"
else
    log_message "Light client: STOPPED"
    exit 1
fi

# Check API service process
if pgrep -f "api.js" > /dev/null; then
    log_message "API service: RUNNING"
else
    log_message "API service: STOPPED"
    exit 1
fi

# Check API endpoints
if curl -s "$API_URL/v1/brc20/block_height" > /dev/null; then
    log_message "API endpoints: RESPONDING"
else
    log_message "API endpoints: NOT RESPONDING"
    exit 1
fi

# Check database connection
cd /home/indexer/OPI-LC/brc20/psql
if python3 -c "
import psycopg2
from dotenv import load_dotenv
import os
load_dotenv()
try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_DATABASE'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWD')
    )
    conn.close()
    print('OK')
except:
    print('FAILED')
" | grep -q "OK"; then
    log_message "Database: CONNECTED"
else
    log_message "Database: CONNECTION FAILED"
    exit 1
fi

log_message "Health check: PASSED"
```

### 2. Performance Monitoring Script

```bash
#!/bin/bash
# performance_monitor.sh

# Configuration
LOG_FILE="/var/log/opi-performance.log"
API_URL="http://127.0.0.1:8000"

# Get current metrics
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
BLOCK_HEIGHT=$(curl -s "$API_URL/v1/brc20/block_height" 2>/dev/null || echo "ERROR")
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

# Log metrics
echo "$TIMESTAMP - Block Height: $BLOCK_HEIGHT, CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%" >> $LOG_FILE

# Alert if thresholds exceeded
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "$TIMESTAMP - ALERT: High CPU usage: ${CPU_USAGE}%" >> $LOG_FILE
fi

if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    echo "$TIMESTAMP - ALERT: High memory usage: ${MEMORY_USAGE}%" >> $LOG_FILE
fi

if [ "$DISK_USAGE" -gt 85 ]; then
    echo "$TIMESTAMP - ALERT: High disk usage: ${DISK_USAGE}%" >> $LOG_FILE
fi
```

### 3. Setup Cron Jobs

```bash
# Add to crontab
crontab -e

# Add these lines:
# Health check every 5 minutes
*/5 * * * * /path/to/health_check.sh

# Performance monitoring every minute
* * * * * /path/to/performance_monitor.sh

# Log rotation daily
0 0 * * * /usr/sbin/logrotate /etc/logrotate.d/opi-logs
```

## Alerting Setup

### 1. Email Alerts

**Install and Configure Postfix:**
```bash
# Install postfix
sudo apt install postfix

# Configure for local delivery
sudo dpkg-reconfigure postfix
```

**Create Alert Script:**
```bash
#!/bin/bash
# send_alert.sh

ALERT_EMAIL="admin@yourdomain.com"
SUBJECT="$1"
MESSAGE="$2"

echo "$MESSAGE" | mail -s "$SUBJECT" "$ALERT_EMAIL"
```

### 2. Slack/Discord Alerts

**Slack Webhook Script:**
```bash
#!/bin/bash
# slack_alert.sh

WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
MESSAGE="$1"

curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$MESSAGE\"}" \
    "$WEBHOOK_URL"
```

### 3. Systemd Service Monitoring

**Create Service Monitor:**
```bash
# Create service monitor script
sudo nano /usr/local/bin/opi-service-monitor.sh
```

```bash
#!/bin/bash
# Monitor systemd services and send alerts

SERVICES=("opi-light-client.service" "opi-api.service")

for service in "${SERVICES[@]}"; do
    if ! systemctl is-active --quiet "$service"; then
        /path/to/send_alert.sh "OPI-LC Alert" "Service $service is down"
        systemctl restart "$service"
    fi
done
```

## Log Management

### 1. Log Configuration

**Create Logrotate Configuration:**
```bash
sudo nano /etc/logrotate.d/opi-logs
```

```
/var/log/opi-*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload rsyslog >/dev/null 2>&1 || true
    endscript
}
```

### 2. Centralized Logging

**Setup rsyslog for Centralized Logging:**
```bash
# Configure rsyslog
sudo nano /etc/rsyslog.d/opi-logs.conf
```

```
# OPI-LC application logs
local0.* /var/log/opi-light-client.log
local1.* /var/log/opi-api.log
```

### 3. Log Analysis

**Create Log Analysis Script:**
```bash
#!/bin/bash
# log_analyzer.sh

LOG_FILE="/var/log/opi-light-client.log"

# Count errors in last hour
ERROR_COUNT=$(grep "$(date -d '1 hour ago' '+%Y-%m-%d %H:')" "$LOG_FILE" | grep -i error | wc -l)

# Count hash mismatches
HASH_MISMATCHES=$(grep "$(date -d '1 hour ago' '+%Y-%m-%d %H:')" "$LOG_FILE" | grep -i "hash.*mismatch" | wc -l)

echo "Errors in last hour: $ERROR_COUNT"
echo "Hash mismatches in last hour: $HASH_MISMATCHES"
```

## Troubleshooting Guide

### 1. Common Issues and Solutions

#### Light Client Not Processing Blocks

**Symptoms:**
- Block height not increasing
- No new log entries
- Process appears stuck

**Diagnosis:**
```bash
# Check if process is running
ps aux | grep "brc20_light_client"

# Check recent logs
tail -n 50 /var/log/opi-light-client.log

# Check database connection
cd OPI-LC/brc20/psql
python3 -c "import psycopg2; print('DB OK')"
```

**Solutions:**
1. Restart the light client process
2. Check database connectivity
3. Verify OPI Network API access
4. Check for hash validation errors

#### API Service Not Responding

**Symptoms:**
- HTTP 500 errors
- Connection timeouts
- No response from endpoints

**Diagnosis:**
```bash
# Check if API process is running
ps aux | grep "api.js"

# Test API endpoints
curl -v http://127.0.0.1:8000/v1/brc20/block_height

# Check API logs
tail -n 50 /var/log/opi-api.log
```

**Solutions:**
1. Restart the API service
2. Check database connection
3. Verify port availability
4. Check Node.js dependencies

#### Database Connection Issues

**Symptoms:**
- Connection refused errors
- Query timeouts
- Data inconsistency

**Diagnosis:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -c "SELECT version();"

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('postgres'));"
```

**Solutions:**
1. Restart PostgreSQL service
2. Check disk space
3. Verify connection parameters
4. Optimize database settings

### 2. Performance Issues

#### High CPU Usage

**Diagnosis:**
```bash
# Check CPU usage by process
top -p $(pgrep -f "brc20_light_client")

# Check system load
uptime

# Monitor CPU usage over time
sar -u 1 10
```

**Solutions:**
1. Optimize database queries
2. Increase system resources
3. Tune PostgreSQL settings
4. Consider database indexing

#### High Memory Usage

**Diagnosis:**
```bash
# Check memory usage
free -h

# Check process memory usage
ps aux --sort=-%mem | head -10

# Monitor memory over time
vmstat 1 10
```

**Solutions:**
1. Increase system memory
2. Optimize Node.js memory settings
3. Tune PostgreSQL memory parameters
4. Implement connection pooling

#### Slow API Response Times

**Diagnosis:**
```bash
# Test API response time
time curl -s http://127.0.0.1:8000/v1/brc20/block_height

# Check database query performance
sudo -u postgres psql -c "EXPLAIN ANALYZE SELECT * FROM brc20_events LIMIT 1000;"
```

**Solutions:**
1. Add database indexes
2. Optimize API queries
3. Implement caching
4. Scale horizontally

### 3. Data Integrity Issues

#### Hash Mismatch Errors

**Diagnosis:**
```bash
# Check for hash mismatch logs
grep -i "hash.*mismatch" /var/log/opi-light-client.log

# Verify block hashes
curl -s "https://api.opi.network/v1/brc20/block_hash?block_height=800000"
```

**Solutions:**
1. Check OPI Network connectivity
2. Verify event processing logic
3. Recalculate hashes if needed
4. Report issues to OPI Network

#### Missing Events

**Diagnosis:**
```bash
# Check event count for a block
sudo -u postgres psql -c "SELECT COUNT(*) FROM brc20_events WHERE block_height = 800000;"

# Compare with OPI Network
curl -s "https://api.opi.network/v1/brc20/events?block_height=800000" | jq '.result | length'
```

**Solutions:**
1. Re-index the specific block
2. Check event processing logic
3. Verify API responses
4. Report to OPI Network

## Monitoring Dashboard

### 1. Simple Dashboard Script

```bash
#!/bin/bash
# dashboard.sh

clear
echo "=== OPI-LC Monitoring Dashboard ==="
echo "Timestamp: $(date)"
echo

# System status
echo "=== System Status ==="
echo "Light Client: $(pgrep -f 'brc20_light_client' > /dev/null && echo 'RUNNING' || echo 'STOPPED')"
echo "API Service: $(pgrep -f 'api.js' > /dev/null && echo 'RUNNING' || echo 'STOPPED')"
echo "PostgreSQL: $(systemctl is-active postgresql)"
echo

# Performance metrics
echo "=== Performance Metrics ==="
echo "CPU Usage: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory Usage: $(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')%"
echo "Disk Usage: $(df / | awk 'NR==2 {print $5}')"
echo

# Application metrics
echo "=== Application Metrics ==="
BLOCK_HEIGHT=$(curl -s http://127.0.0.1:8000/v1/brc20/block_height 2>/dev/null || echo "ERROR")
echo "Current Block Height: $BLOCK_HEIGHT"
echo "Database Version: $(curl -s http://127.0.0.1:8000/v1/brc20/db_version 2>/dev/null || echo "ERROR")"
echo

# Recent logs
echo "=== Recent Errors ==="
tail -n 5 /var/log/opi-light-client.log | grep -i error || echo "No recent errors"
echo

echo "=== Recent API Requests ==="
tail -n 5 /var/log/opi-api.log | grep "GET\|POST" || echo "No recent API requests"
```

### 2. Setup Auto-refresh Dashboard

```bash
# Create auto-refreshing dashboard
watch -n 5 /path/to/dashboard.sh
```

## Next Steps

After setting up monitoring:

1. **Configure Alerts**: Set up email/Slack notifications for critical issues
2. **Performance Tuning**: Optimize based on monitoring data
3. **Capacity Planning**: Monitor growth trends and plan accordingly
4. **Backup Strategy**: Implement automated backups with monitoring
5. **Security Monitoring**: Add security-focused monitoring and alerting 