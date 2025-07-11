# OPI-LC Configuration Reference

This document provides a complete reference for all configuration options in OPI-LC, including environment variables, database settings, and operational parameters.

## Configuration Overview

OPI-LC uses environment variables for configuration, stored in `.env` files in each component directory. The configuration is separated into:

- **Light Client Configuration**: Database connection and indexing parameters
- **API Service Configuration**: Database connection and API settings
- **System Configuration**: Network, reporting, and operational settings

## Light Client Configuration

### Database Settings

#### PostgreSQL Configuration (`.env` in `brc20/psql/`)

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `DB_USER` | `postgres` | PostgreSQL username | Yes |
| `DB_HOST` | `localhost` | PostgreSQL host address | Yes |
| `DB_PORT` | `5432` | PostgreSQL port number | Yes |
| `DB_DATABASE` | `postgres` | PostgreSQL database name | Yes |
| `DB_PASSWD` | `""` | PostgreSQL password | Yes |

**Example PostgreSQL Configuration:**
```bash
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="your_secure_password"
```

#### SQLite Configuration (`.env` in `brc20/sqlite/`)

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `DB_DATABASE_FILE` | `db.sqlite3` | SQLite database file path | Yes |

**Example SQLite Configuration:**
```bash
DB_DATABASE_FILE="db.sqlite3"
```

### Blockchain Settings

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `FIRST_INSCRIPTION_HEIGHT` | `767430` | First Bitcoin inscription block | Yes |
| `FIRST_BRC20_HEIGHT` | `779832` | First BRC-20 block | Yes |

**Important**: These values should not be changed as they are critical for correct hash calculation.

### Reporting Settings

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `REPORT_TO_INDEXER` | `true` | Enable hash reporting to OPI Network | No |
| `REPORT_URL` | `https://api.opi.network/report_block` | Reporting endpoint URL | No |
| `REPORT_RETRIES` | `10` | Number of retry attempts for reporting | No |
| `REPORT_NAME` | `""` | Unique identifier for this node | Yes (if reporting enabled) |

**Example Reporting Configuration:**
```bash
REPORT_TO_INDEXER="true"
REPORT_URL="https://api.opi.network/report_block"
REPORT_RETRIES="10"
REPORT_NAME="my_opi_node_01"
```

### Performance Settings

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `CREATE_EXTRA_TABLES` | `true` | Create additional tables for faster queries | No |

**Extra Tables Created:**
- `brc20_current_balances`: Fast lookup for current balances
- `brc20_unused_tx_inscrs`: Unused transfer inscriptions

## API Service Configuration

### Database Settings

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `DB_TYPE` | `psql` | Database type (`psql` or `sqlite`) | Yes |
| `DB_USER` | `postgres` | Database username (PostgreSQL only) | Yes (PostgreSQL) |
| `DB_HOST` | `localhost` | Database host (PostgreSQL only) | Yes (PostgreSQL) |
| `DB_PORT` | `5432` | Database port (PostgreSQL only) | Yes (PostgreSQL) |
| `DB_DATABASE` | `postgres` | Database name (PostgreSQL only) | Yes (PostgreSQL) |
| `DB_PASSWD` | `""` | Database password (PostgreSQL only) | Yes (PostgreSQL) |
| `DB_SSL` | `true` | Use SSL for database connection (PostgreSQL only) | No |
| `DB_MAX_CONNECTIONS` | `10` | Maximum database connections (PostgreSQL only) | No |
| `DB_DATABASE_FILE` | `../sqlite/db.sqlite3` | SQLite database file path (SQLite only) | Yes (SQLite) |

### API Settings

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `API_HOST` | `127.0.0.1` | API server host address | No |
| `API_PORT` | `8000` | API server port number | No |
| `API_TRUSTED_PROXY_CNT` | `0` | Number of trusted proxies (for load balancers) | No |

### Feature Settings

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `USE_EXTRA_TABLES` | `true` | Enable extra table endpoints | No |

## Complete Configuration Examples

### PostgreSQL Light Client Configuration

```bash
# Database Configuration
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="your_secure_password"

# Blockchain Configuration (DO NOT CHANGE)
FIRST_INSCRIPTION_HEIGHT="767430"
FIRST_BRC20_HEIGHT="779832"

# Reporting Configuration
REPORT_TO_INDEXER="true"
REPORT_URL="https://api.opi.network/report_block"
REPORT_RETRIES="10"
REPORT_NAME="my_production_node"

# Performance Configuration
CREATE_EXTRA_TABLES="true"
```

### SQLite Light Client Configuration

```bash
# Database Configuration
DB_DATABASE_FILE="db.sqlite3"

# Blockchain Configuration (DO NOT CHANGE)
FIRST_INSCRIPTION_HEIGHT="767430"
FIRST_BRC20_HEIGHT="779832"

# Reporting Configuration
REPORT_TO_INDEXER="true"
REPORT_URL="https://api.opi.network/report_block"
REPORT_RETRIES="10"
REPORT_NAME="my_dev_node"

# Performance Configuration
CREATE_EXTRA_TABLES="true"
```

### PostgreSQL API Configuration

```bash
# Database Configuration
DB_TYPE="psql"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="your_secure_password"
DB_SSL="true"
DB_MAX_CONNECTIONS=10

# API Configuration
API_HOST="127.0.0.1"
API_PORT="8000"
API_TRUSTED_PROXY_CNT="0"

# Feature Configuration
USE_EXTRA_TABLES="true"
```

### SQLite API Configuration

```bash
# Database Configuration
DB_TYPE="sqlite"
DB_DATABASE_FILE="../sqlite/db.sqlite3"

# API Configuration
API_HOST="127.0.0.1"
API_PORT="8000"
API_TRUSTED_PROXY_CNT="0"

# Feature Configuration
USE_EXTRA_TABLES="true"
```

## Configuration Initialization

### Light Client Configuration

**PostgreSQL:**
```bash
cd OPI-LC/brc20/psql
python3 initialise_psql.py
```

**SQLite:**
```bash
cd OPI-LC/brc20/sqlite
python3 initialise_sqlite.py
```

### API Configuration

```bash
cd OPI-LC/brc20/api
python3 initialise_api.py
```

## Environment-Specific Configurations

### Development Environment

**Light Client (PostgreSQL):**
```bash
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="dev_password"
FIRST_INSCRIPTION_HEIGHT="767430"
FIRST_BRC20_HEIGHT="779832"
REPORT_TO_INDEXER="false"
CREATE_EXTRA_TABLES="true"
```

**API Service:**
```bash
DB_TYPE="psql"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="dev_password"
DB_SSL="false"
DB_MAX_CONNECTIONS=5
API_HOST="127.0.0.1"
API_PORT="8000"
API_TRUSTED_PROXY_CNT="0"
USE_EXTRA_TABLES="true"
```

### Production Environment

**Light Client (PostgreSQL):**
```bash
DB_USER="opi_user"
DB_HOST="db.internal.company.com"
DB_PORT="5432"
DB_DATABASE="opi_production"
DB_PASSWD="very_secure_password"
FIRST_INSCRIPTION_HEIGHT="767430"
FIRST_BRC20_HEIGHT="779832"
REPORT_TO_INDEXER="true"
REPORT_URL="https://api.opi.network/report_block"
REPORT_RETRIES="10"
REPORT_NAME="company_prod_node_01"
CREATE_EXTRA_TABLES="true"
```

**API Service:**
```bash
DB_TYPE="psql"
DB_USER="opi_user"
DB_HOST="db.internal.company.com"
DB_PORT="5432"
DB_DATABASE="opi_production"
DB_PASSWD="very_secure_password"
DB_SSL="true"
DB_MAX_CONNECTIONS=20
API_HOST="0.0.0.0"
API_PORT="8000"
API_TRUSTED_PROXY_CNT="2"
USE_EXTRA_TABLES="true"
```

### Docker Environment

**Light Client:**
```bash
DB_USER="postgres"
DB_HOST="postgres"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="docker_password"
FIRST_INSCRIPTION_HEIGHT="767430"
FIRST_BRC20_HEIGHT="779832"
REPORT_TO_INDEXER="true"
REPORT_NAME="docker_node"
CREATE_EXTRA_TABLES="true"
```

**API Service:**
```bash
DB_TYPE="psql"
DB_USER="postgres"
DB_HOST="postgres"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_PASSWD="docker_password"
DB_SSL="false"
DB_MAX_CONNECTIONS=10
API_HOST="0.0.0.0"
API_PORT="8000"
API_TRUSTED_PROXY_CNT="0"
USE_EXTRA_TABLES="true"
```

## Security Considerations

### Database Security

1. **Use Strong Passwords**: Always use strong, unique passwords for database connections
2. **Network Security**: Use SSL connections in production environments
3. **Access Control**: Limit database user permissions to minimum required
4. **Firewall Rules**: Restrict database access to necessary IP addresses

### API Security

1. **Network Binding**: Use `127.0.0.1` for local-only access, `0.0.0.0` for external access
2. **Proxy Configuration**: Set `API_TRUSTED_PROXY_CNT` correctly for load balancers
3. **Rate Limiting**: Consider implementing rate limiting for production APIs
4. **CORS Configuration**: Configure CORS appropriately for your use case

### Reporting Security

1. **Unique Node Names**: Use unique, descriptive names for your nodes
2. **Network Access**: Ensure outbound HTTPS access to OPI Network
3. **Error Handling**: Monitor reporting failures and retry logic

## Performance Tuning

### Database Performance

**PostgreSQL Optimizations:**
```sql
-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Increase work memory
ALTER SYSTEM SET work_mem = '16MB';

-- Increase effective cache size
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Restart PostgreSQL
sudo systemctl restart postgresql
```

**Connection Pooling:**
- Adjust `DB_MAX_CONNECTIONS` based on your load
- Monitor connection usage and adjust accordingly
- Consider using external connection poolers for high-traffic applications

### API Performance

**Node.js Optimizations:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 api.js

# Use PM2 for process management
pm2 start api.js --name "opi-api" --max-memory-restart 1G
```

**System Optimizations:**
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Optimize network settings
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
sysctl -p
```

## Monitoring Configuration

### Log Configuration

**Light Client Logging:**
```bash
# Redirect output to log file
python3 brc20_light_client_psql.py >> /var/log/opi-light-client.log 2>&1

# Use systemd logging
sudo journalctl -u opi-light-client.service -f
```

**API Service Logging:**
```bash
# Redirect output to log file
node api.js >> /var/log/opi-api.log 2>&1

# Use systemd logging
sudo journalctl -u opi-api.service -f
```

### Health Check Configuration

**Database Health Check:**
```bash
#!/bin/bash
# Check database connectivity
cd /path/to/opi-lc/brc20/psql
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
    print('OK')
    conn.close()
except Exception as e:
    print(f'ERROR: {e}')
    exit(1)
"
```

**API Health Check:**
```bash
#!/bin/bash
# Check API health
curl -f http://127.0.0.1:8000/v1/brc20/block_height > /dev/null
if [ $? -eq 0 ]; then
    echo "API OK"
else
    echo "API ERROR"
    exit 1
fi
```

## Troubleshooting Configuration Issues

### Common Configuration Problems

1. **Database Connection Failed**
   - Verify database credentials in `.env` file
   - Check database service status
   - Test connection manually

2. **API Not Responding**
   - Check `API_HOST` and `API_PORT` settings
   - Verify port is not in use
   - Check firewall settings

3. **Hash Reporting Failed**
   - Verify `REPORT_NAME` is set and unique
   - Check network connectivity to OPI Network
   - Monitor retry attempts

4. **Performance Issues**
   - Adjust database connection limits
   - Monitor system resources
   - Optimize database queries

### Configuration Validation

**Validate Light Client Configuration:**
```bash
cd OPI-LC/brc20/psql
python3 -c "
from dotenv import load_dotenv
import os
load_dotenv()

required_vars = ['DB_USER', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_PASSWD']
for var in required_vars:
    if not os.getenv(var):
        print(f'ERROR: {var} not set')
        exit(1)
print('Configuration OK')
"
```

**Validate API Configuration:**
```bash
cd OPI-LC/brc20/api
python3 -c "
from dotenv import load_dotenv
import os
load_dotenv()

db_type = os.getenv('DB_TYPE')
if db_type == 'psql':
    required_vars = ['DB_USER', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_PASSWD']
elif db_type == 'sqlite':
    required_vars = ['DB_DATABASE_FILE']
else:
    print('ERROR: Invalid DB_TYPE')
    exit(1)

for var in required_vars:
    if not os.getenv(var):
        print(f'ERROR: {var} not set')
        exit(1)
print('Configuration OK')
"
```

## Configuration Best Practices

1. **Use Environment-Specific Files**: Create separate `.env` files for different environments
2. **Secure Sensitive Data**: Use environment variables or secure vaults for passwords
3. **Document Changes**: Keep a changelog of configuration modifications
4. **Test Configurations**: Validate configurations before deploying to production
5. **Monitor Performance**: Adjust settings based on monitoring data
6. **Backup Configurations**: Keep backups of working configurations
7. **Version Control**: Track configuration changes in version control (excluding secrets)

## Next Steps

After configuring OPI-LC:

1. **Test the Configuration**: Run health checks to verify settings
2. **Monitor Performance**: Use the monitoring tools to track system performance
3. **Optimize Settings**: Adjust configuration based on usage patterns
4. **Document Environment**: Keep detailed records of your configuration
5. **Plan for Scaling**: Consider configuration changes needed for growth 