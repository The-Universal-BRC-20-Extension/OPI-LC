# OPI-LC Documentation Summary

This document provides a comprehensive overview of the OPI-LC (Open Protocol Indexer - Light Client) documentation and serves as a quick reference guide.

## What is OPI-LC?

OPI-LC is a **light client for meta-protocols on Bitcoin**, specifically designed for BRC-20 tokens. It operates by:

1. **Fetching event hashes** from OPI Network
2. **Retrieving actual events** from OPI API
3. **Recalculating hashes locally** for validation
4. **Storing validated events** in a database
5. **Providing REST API access** to indexed data

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OPI Network   │    │   Light Client  │    │   API Service   │
│                 │    │                 │    │                 │
│ • Event Hashes  │◄──►│ • Event Fetch   │◄──►│ • REST API      │
│ • Block Data    │    │ • Hash Validate │    │ • Query Data    │
│ • Validation    │    │ • Store Events  │    │ • Serve Clients │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │                 │
                       │ • PostgreSQL    │
                       │ • SQLite        │
                       │ • Event Storage │
                       │ • Balance Track │
                       └─────────────────┘
```

## Quick Start Guide

### 1. Choose Your Setup

**For Production (Recommended):**
- Database: PostgreSQL
- Features: Full performance, extra tables, reporting

**For Development/Testing:**
- Database: SQLite
- Features: Easy setup, minimal resources

### 2. Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/bestinslot-xyz/OPI-LC.git
cd OPI-LC

# 2. Choose database setup
# For PostgreSQL:
cd brc20/psql
# For SQLite:
cd brc20/sqlite

# 3. Download database backup
wget http://s3.opi.network:9000/opi-light-client-files/db_4/light_client_brc20_last.dump
# (PostgreSQL) or
wget http://s3.opi.network:9000/opi-light-client-files/db_4/light_client_brc20_sqlite_last.sqlite3.tar.bz2
# (SQLite)

# 4. Initialize configuration
python3 initialise_psql.py  # or initialise_sqlite.py

# 5. Start light client
python3 brc20_light_client_psql.py  # or brc20_light_client_sqlite.py

# 6. (Optional) Start API service
cd ../api
npm install
python3 initialise_api.py
node api.js
```

### 3. Verify Installation

```bash
# Check light client
ps aux | grep "brc20_light_client"

# Check API service
curl http://127.0.0.1:8000/v1/brc20/block_height

# Check database connection
cd brc20/psql
python3 -c "import psycopg2; print('DB OK')"
```

## Documentation Structure

### 📚 [Setup Guide](setup-guide.md)
Complete installation instructions for both PostgreSQL and SQLite versions.

**Key Sections:**
- System requirements and prerequisites
- Step-by-step PostgreSQL setup
- Step-by-step SQLite setup
- API service installation
- Verification and testing

### 🚀 [Launch Process](launch-process.md)
How to start and manage the light client and API services.

**Key Sections:**
- Manual launch (development)
- Background process launch (production)
- Service management with screen/systemd
- Health checks and monitoring
- Troubleshooting launch issues

### 🏗️ [Process Architecture](process-architecture.md)
Detailed explanation of how the indexing system works.

**Key Sections:**
- System overview and components
- Data flow and event processing
- Hash calculation algorithm
- Database schema
- Error handling and recovery
- Performance considerations

### 📊 [Monitoring Guide](monitoring-guide.md)
Comprehensive monitoring setup for production deployments.

**Key Sections:**
- System health monitoring
- API health checks
- Data integrity monitoring
- Automated monitoring scripts
- Alerting setup (email, Slack)
- Troubleshooting guide

### 🔌 [API Reference](api-reference.md)
Complete documentation for all API endpoints.

**Key Sections:**
- Health and status endpoints
- Block activity endpoints
- Balance endpoints
- Hash endpoints
- Extra tables endpoints
- Error codes and troubleshooting

### ⚙️ [Configuration Reference](configuration-reference.md)
Complete reference for all configuration options.

**Key Sections:**
- Environment variables reference
- Database configuration
- API settings
- Performance tuning
- Security considerations
- Environment-specific configurations

## Key Features

### 🔍 Light Client Features
- **Event Validation**: Recalculates hashes to validate events
- **Hash Reporting**: Reports validated hashes to OPI Network
- **Reorg Detection**: Automatically detects and handles chain reorganizations
- **Balance Tracking**: Comprehensive balance change tracking
- **Multi-Database Support**: PostgreSQL and SQLite

### 🌐 API Features
- **REST API**: HTTP endpoints for data access
- **CORS Support**: Cross-origin request support
- **Health Checks**: Built-in health monitoring endpoints
- **Performance Optimized**: Connection pooling and caching
- **Extra Tables**: Optional fast-lookup tables

### 📈 Monitoring Features
- **Process Monitoring**: Service status tracking
- **Performance Metrics**: CPU, memory, disk usage
- **Data Integrity**: Hash validation monitoring
- **Automated Alerts**: Email and Slack notifications
- **Log Management**: Centralized logging and rotation

## Configuration Quick Reference

### Essential Environment Variables

**Light Client (PostgreSQL):**
```bash
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="your_password"
FIRST_INSCRIPTION_HEIGHT="767430"
FIRST_BRC20_HEIGHT="779832"
REPORT_TO_INDEXER="true"
REPORT_NAME="your_node_name"
CREATE_EXTRA_TABLES="true"
```

**API Service:**
```bash
DB_TYPE="psql"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="your_password"
API_HOST="127.0.0.1"
API_PORT="8000"
USE_EXTRA_TABLES="true"
```

## Common Commands

### Service Management
```bash
# Start light client
cd OPI-LC/brc20/psql
python3 brc20_light_client_psql.py

# Start API service
cd OPI-LC/brc20/api
node api.js

# Check service status
ps aux | grep "brc20_light_client"
ps aux | grep "api.js"

# Health checks
curl http://127.0.0.1:8000/v1/brc20/block_height
```

### Monitoring Commands
```bash
# Check system resources
htop
df -h
free -h

# Monitor logs
tail -f /var/log/opi-light-client.log
tail -f /var/log/opi-api.log

# Database health check
cd OPI-LC/brc20/psql
python3 -c "import psycopg2; print('DB OK')"
```

### API Testing
```bash
# Test basic endpoints
curl http://127.0.0.1:8000/v1/brc20/block_height
curl http://127.0.0.1:8000/v1/brc20/db_version

# Test data endpoints
curl "http://127.0.0.1:8000/v1/brc20/activity_on_block?block_height=800000"
curl "http://127.0.0.1:8000/v1/brc20/get_current_balance_of_wallet?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&ticker=ordi"
```

## Troubleshooting Quick Reference

### Common Issues

1. **Light Client Not Processing**
   - Check database connection
   - Verify OPI Network access
   - Check for hash validation errors

2. **API Not Responding**
   - Verify API service is running
   - Check port 8000 availability
   - Test database connectivity

3. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify credentials in `.env` file
   - Test connection manually

4. **High Resource Usage**
   - Monitor CPU/memory usage
   - Optimize database settings
   - Consider hardware upgrades

### Emergency Procedures

```bash
# Restart light client
pkill -f "brc20_light_client"
cd OPI-LC/brc20/psql
python3 brc20_light_client_psql.py

# Restart API service
pkill -f "api.js"
cd OPI-LC/brc20/api
node api.js

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check system resources
htop
df -h
```

## Performance Guidelines

### System Requirements
- **Minimum**: 4GB RAM, 50GB storage
- **Recommended**: 8GB RAM, 100GB storage
- **Production**: 16GB+ RAM, SSD storage

### Database Optimization
```sql
-- PostgreSQL optimizations
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

### API Optimization
```bash
# Node.js memory optimization
node --max-old-space-size=4096 api.js

# System optimization
echo "* soft nofile 65536" >> /etc/security/limits.conf
```

## Security Best Practices

1. **Database Security**
   - Use strong passwords
   - Enable SSL in production
   - Restrict network access

2. **API Security**
   - Use firewalls
   - Implement rate limiting
   - Monitor access logs

3. **System Security**
   - Regular updates
   - Secure SSH access
   - Backup strategies

## Support and Resources

### Documentation Links
- [Setup Guide](setup-guide.md) - Installation instructions
- [Launch Process](launch-process.md) - Service management
- [Process Architecture](process-architecture.md) - System internals
- [Monitoring Guide](monitoring-guide.md) - Production monitoring
- [API Reference](api-reference.md) - API documentation
- [Configuration Reference](configuration-reference.md) - Settings guide

### External Resources
- **Repository**: https://github.com/bestinslot-xyz/OPI-LC
- **OPI Network**: https://api.opi.network
- **BRC-20 Protocol**: https://layer1.gitbook.io/layer1-foundation/protocols/brc-20/indexing

### Getting Help
1. Check the troubleshooting sections in each guide
2. Review the monitoring and configuration references
3. Check the main repository for issues and updates
4. Monitor system logs for error messages

## Next Steps

After reading this documentation:

1. **Choose your setup**: PostgreSQL for production, SQLite for development
2. **Follow the setup guide**: Complete installation and configuration
3. **Launch services**: Start light client and API services
4. **Configure monitoring**: Set up health checks and alerting
5. **Test the system**: Verify all components are working
6. **Optimize performance**: Tune settings based on your needs
7. **Plan for scaling**: Consider future growth requirements

---

**Note**: This documentation is designed to be comprehensive yet accessible. Each section builds upon the previous ones, so it's recommended to read them in order for a complete understanding of the OPI-LC system. 