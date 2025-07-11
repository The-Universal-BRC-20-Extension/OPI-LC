# OPI-LC Launch Process

This guide explains how to launch and manage the OPI-LC light client and API services.

## Overview

OPI-LC consists of two main components:
1. **Light Client**: Python service that indexes BRC-20 events
2. **API Service**: Node.js service that provides REST endpoints

## Launch Options

### Option 1: Manual Launch (Development/Testing)

#### Launch Light Client

**For PostgreSQL:**
```bash
cd OPI-LC/brc20/psql
python3 brc20_light_client_psql.py
```

**For SQLite:**
```bash
cd OPI-LC/brc20/sqlite
python3 brc20_light_client_sqlite.py
```

#### Launch API Service

```bash
cd OPI-LC/brc20/api
node api.js
```

### Option 2: Background Process Launch (Production)

#### Using Screen (Recommended for Production)

**Install Screen:**
```bash
sudo apt update
sudo apt install screen
```

**Launch Light Client in Screen:**
```bash
# Create a new screen session for the light client
screen -S opi-light-client

# Navigate to the appropriate directory
cd OPI-LC/brc20/psql  # or cd OPI-LC/brc20/sqlite

# Start the light client
python3 brc20_light_client_psql.py

# Detach from screen: Ctrl+A, then D
```

**Launch API Service in Screen:**
```bash
# Create a new screen session for the API
screen -S opi-api

# Navigate to API directory
cd OPI-LC/brc20/api

# Start the API service
node api.js

# Detach from screen: Ctrl+A, then D
```

**Manage Screen Sessions:**
```bash
# List all screen sessions
screen -ls

# Reattach to light client session
screen -r opi-light-client

# Reattach to API session
screen -r opi-api

# Kill a session
screen -S opi-light-client -X quit
```

#### Using Systemd Services (Advanced)

**Create Light Client Service:**
```bash
sudo nano /etc/systemd/system/opi-light-client.service
```

Add the following content (adjust paths as needed):
```ini
[Unit]
Description=OPI-LC Light Client
After=network.target postgresql.service

[Service]
Type=simple
User=indexer
WorkingDirectory=/home/indexer/OPI-LC/brc20/psql
ExecStart=/usr/bin/python3 brc20_light_client_psql.py
Restart=always
RestartSec=10
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
```

**Create API Service:**
```bash
sudo nano /etc/systemd/system/opi-api.service
```

Add the following content:
```ini
[Unit]
Description=OPI-LC API Service
After=network.target

[Service]
Type=simple
User=indexer
WorkingDirectory=/home/indexer/OPI-LC/brc20/api
ExecStart=/usr/bin/node api.js
Restart=always
RestartSec=10
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
```

**Enable and Start Services:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable opi-light-client.service
sudo systemctl enable opi-api.service

# Start services
sudo systemctl start opi-light-client.service
sudo systemctl start opi-api.service

# Check status
sudo systemctl status opi-light-client.service
sudo systemctl status opi-api.service
```

## Service Management

### Check Service Status

**For Screen Sessions:**
```bash
# List all screen sessions
screen -ls

# Check if processes are running
ps aux | grep python3
ps aux | grep node
```

**For Systemd Services:**
```bash
# Check service status
sudo systemctl status opi-light-client.service
sudo systemctl status opi-api.service

# View logs
sudo journalctl -u opi-light-client.service -f
sudo journalctl -u opi-api.service -f
```

### Stop Services

**Screen Sessions:**
```bash
# Kill screen sessions
screen -S opi-light-client -X quit
screen -S opi-api -X quit

# Or kill processes directly
pkill -f "brc20_light_client"
pkill -f "api.js"
```

**Systemd Services:**
```bash
# Stop services
sudo systemctl stop opi-light-client.service
sudo systemctl stop opi-api.service

# Disable services (prevent auto-start)
sudo systemctl disable opi-light-client.service
sudo systemctl disable opi-api.service
```

### Restart Services

**Screen Sessions:**
```bash
# Kill and recreate sessions
screen -S opi-light-client -X quit
screen -S opi-light-client
cd OPI-LC/brc20/psql
python3 brc20_light_client_psql.py
```

**Systemd Services:**
```bash
# Restart services
sudo systemctl restart opi-light-client.service
sudo systemctl restart opi-api.service
```

## Monitoring Launch Process

### Light Client Startup Indicators

1. **Database Connection**: Should see "Database connection successful"
2. **Table Initialization**: Should see "Initialising database..." if first run
3. **Block Processing**: Should see block height updates
4. **Hash Reporting**: Should see "Reported block hash" messages

### API Service Startup Indicators

1. **Server Start**: Should see "Server running on http://127.0.0.1:8000"
2. **Database Connection**: Should connect to database successfully
3. **Endpoint Availability**: Should respond to health checks

### Health Checks

**Test Light Client:**
```bash
# Check if process is running
ps aux | grep "brc20_light_client"

# Check recent logs (if using screen)
screen -r opi-light-client
```

**Test API Service:**
```bash
# Test API health endpoint
curl http://127.0.0.1:8000/v1/brc20/block_height

# Test API IP endpoint
curl http://127.0.0.1:8000/v1/brc20/ip
```

## Troubleshooting Launch Issues

### Common Problems

1. **Permission Denied**
   ```bash
   # Check file permissions
   ls -la OPI-LC/brc20/psql/
   ls -la OPI-LC/brc20/api/
   
   # Fix permissions if needed
   chmod +x OPI-LC/brc20/psql/brc20_light_client_psql.py
   ```

2. **Database Connection Failed**
   ```bash
   # Check database status
   sudo systemctl status postgresql
   
   # Test database connection
   cd OPI-LC/brc20/psql
   python3 -c "import psycopg2; print('Connection test')"
   ```

3. **Port Already in Use**
   ```bash
   # Check what's using port 8000
   sudo netstat -tlnp | grep :8000
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

4. **Missing Dependencies**
   ```bash
   # Reinstall Python dependencies
   python3 -m pip install -r requirements.txt
   
   # Reinstall Node.js dependencies
   cd OPI-LC/brc20/api
   npm install
   ```

### Log Analysis

**Light Client Logs:**
- Look for "ERROR" or "Exception" messages
- Check database connection messages
- Monitor block processing progress

**API Service Logs:**
- Check for server startup messages
- Monitor request logs
- Look for database connection errors

## Performance Optimization

### Light Client Optimization

1. **Database Tuning** (PostgreSQL):
   ```sql
   -- Increase shared buffers
   ALTER SYSTEM SET shared_buffers = '256MB';
   
   -- Increase work memory
   ALTER SYSTEM SET work_mem = '16MB';
   
   -- Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

2. **System Resources:**
   ```bash
   # Monitor resource usage
   htop
   
   # Check disk I/O
   iostat -x 1
   ```

### API Service Optimization

1. **Node.js Tuning:**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 api.js
   ```

2. **Connection Pooling:**
   - Adjust `DB_MAX_CONNECTIONS` in `.env` file
   - Monitor connection usage

## Next Steps

After successful launch:

1. **Monitor Performance**: See [Monitoring Guide](monitoring-guide.md)
2. **Test API Endpoints**: See [API Reference](api-reference.md)
3. **Configure Alerts**: Set up monitoring for production deployments
4. **Backup Strategy**: Implement regular database backups 