# OPI-LC Setup Guide

This guide provides complete installation instructions for OPI-LC with both PostgreSQL and SQLite database options.

## Prerequisites

### System Requirements
- **OS**: Ubuntu 22.04 (recommended) or other Linux distributions
- **Python**: 3.7+ with pip
- **Node.js**: 20.x (for API service)
- **Memory**: 4GB+ RAM recommended
- **Storage**: 50GB+ for full BRC-20 index

### Network Requirements
- Stable internet connection for downloading backups and connecting to OPI Network
- Port 8000 available (for API service)

## Option 1: PostgreSQL Setup (Recommended for Production)

### Step 1: Install PostgreSQL

```bash
# Update package list
sudo apt update

# Install PostgreSQL and contrib package
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql.service
sudo systemctl enable postgresql.service
```

### Step 2: Configure PostgreSQL (Optional but Recommended)

```bash
# Set PostgreSQL to listen on all interfaces (if needed)
sudo -u postgres psql -c "ALTER SYSTEM SET listen_addresses TO '*';"

# Increase max connections for better performance
sudo -u postgres psql -c "ALTER SYSTEM SET max_connections TO 2000;"

# Set password for postgres user (replace <password> with your password)
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '<password>';"

# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql
```

### Step 3: Install Python Dependencies

```bash
# Install pip if not already installed
sudo apt update
sudo apt install python3-pip

# Install required Python packages
python3 -m pip install python-dotenv
python3 -m pip install psycopg2-binary
python3 -m pip install buidl
python3 -m pip install requests
```

### Step 4: Clone and Setup OPI-LC

```bash
# Clone the repository
git clone https://github.com/bestinslot-xyz/OPI-LC.git
cd OPI-LC/brc20/psql

# Download and restore the latest database backup
wget http://s3.opi.network:9000/opi-light-client-files/db_4/light_client_brc20_last.dump
sudo -u postgres pg_restore -U postgres -Fc -d postgres < light_client_brc20_last.dump
rm light_client_brc20_last.dump

# Initialize configuration
python3 initialise_psql.py
```

### Step 5: Configure Environment Variables

The initialization script will prompt you for configuration values. Here are the recommended settings:

- **DB_USER**: `postgres` (default)
- **DB_HOST**: `localhost` (default)
- **DB_PORT**: `5432` (default)
- **DB_DATABASE**: `postgres` (default)
- **DB_PASSWD**: Your PostgreSQL password
- **FIRST_INSCRIPTION_HEIGHT**: `767430` (default - do not change)
- **FIRST_BRC20_HEIGHT**: `779832` (default - do not change)
- **REPORT_TO_INDEXER**: `true` (default)
- **REPORT_NAME**: Choose a unique name for your node
- **CREATE_EXTRA_TABLES**: `true` (recommended for better performance)

## Option 2: SQLite Setup (Easier for Development)

### Step 1: Install Python Dependencies

```bash
# Install pip if not already installed
sudo apt update
sudo apt install python3-pip

# Install required Python packages
python3 -m pip install python-dotenv
python3 -m pip install buidl
python3 -m pip install requests
```

### Step 2: Install Compression Tools

```bash
# Install bzip2 for backup extraction
sudo apt update
sudo apt install bzip2
```

### Step 3: Clone and Setup OPI-LC

```bash
# Clone the repository
git clone https://github.com/bestinslot-xyz/OPI-LC.git
cd OPI-LC/brc20/sqlite

# Download and extract the latest database backup
wget http://s3.opi.network:9000/opi-light-client-files/db_4/light_client_brc20_sqlite_last.sqlite3.tar.bz2
tar -xvf light_client_brc20_sqlite_last.sqlite3.tar.bz2
rm light_client_brc20_sqlite_last.sqlite3.tar.bz2

# Initialize configuration
python3 initialise_sqlite.py
```

## Option 3: API Setup (Optional)

The API service provides REST endpoints to access the indexed data.

### Step 1: Install Node.js

```bash
# Update package list
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Setup NodeSource repository
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Add NodeSource repository
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Install Node.js
sudo apt-get update
sudo apt-get install nodejs -y
```

### Step 2: Setup API

```bash
# Navigate to API directory
cd OPI-LC/brc20/api

# Install Node.js dependencies
npm install

# Initialize API configuration
python3 initialise_api.py
```

### Step 3: Configure API Environment Variables

The API initialization script will prompt you for configuration. Key settings:

- **DB_TYPE**: `psql` or `sqlite` (match your database choice)
- **DB_* settings**: Match your database configuration
- **API_HOST**: `127.0.0.1` (default)
- **API_PORT**: `8000` (default)
- **USE_EXTRA_TABLES**: `true` (recommended)

## Verification

### Test Database Connection

For PostgreSQL:
```bash
cd OPI-LC/brc20/psql
python3 -c "
import psycopg2
from dotenv import load_dotenv
import os
load_dotenv()
conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    port=os.getenv('DB_PORT'),
    database=os.getenv('DB_DATABASE'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWD')
)
print('Database connection successful!')
conn.close()
"
```

For SQLite:
```bash
cd OPI-LC/brc20/sqlite
python3 -c "
import sqlite3
from dotenv import load_dotenv
import os
load_dotenv()
conn = sqlite3.connect(os.getenv('DB_DATABASE_FILE'))
print('Database connection successful!')
conn.close()
"
```

### Test API Setup

```bash
cd OPI-LC/brc20/api
node -e "
const { Pool } = require('pg');
require('dotenv').config();
console.log('Node.js dependencies loaded successfully');
"
```

## Next Steps

After completing the setup:

1. **Launch the Light Client**: See [Launch Process](launch-process.md)
2. **Configure Monitoring**: See [Monitoring Guide](monitoring-guide.md)
3. **Test the API**: See [API Reference](api-reference.md)

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection Failed**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check password in `.env` file
   - Ensure PostgreSQL is listening on the correct port

2. **Python Import Errors**
   - Install missing packages: `python3 -m pip install <package_name>`
   - Verify Python version: `python3 --version`

3. **Node.js Issues**
   - Verify Node.js installation: `node --version`
   - Reinstall dependencies: `cd OPI-LC/brc20/api && npm install`

4. **Database Backup Download Failed**
   - Check internet connection
   - Verify the backup URL is accessible
   - Try downloading manually from the browser

### Getting Help

- Check the [Configuration Reference](configuration-reference.md) for detailed settings
- Review the [Process Architecture](process-architecture.md) for understanding the system
- For issues, check the main repository: https://github.com/bestinslot-xyz/OPI-LC 