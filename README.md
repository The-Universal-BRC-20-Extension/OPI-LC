# OPI-LC (OPI Light Client)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://postgresql.org/)

OPI-LC is a high-performance, lightweight BRC-20 indexer that provides a comprehensive REST API for querying BRC-20 events, balances, and transaction data. Built for production deployment with enterprise-grade reliability and scalability.

## 🚀 Features

- **⚡ High Performance**: Optimized queries with proper indexing and caching
- **🔒 Production Ready**: Comprehensive error handling, validation, and monitoring
- **🔄 Real-time Indexing**: Continuous blockchain monitoring with automatic reorg handling
- **📊 Rich API**: Complete BRC-20 event tracking with historical data
- **🛡️ Hash Verification**: Cryptographic verification of event integrity
- **🎯 No-Return Support**: Specialized endpoints for Simplicity Indexer integration
- **📈 Scalable**: Support for both PostgreSQL and SQLite databases
- **🔧 Easy Deployment**: Docker support and comprehensive management scripts
- **📝 Comprehensive Logging**: Detailed logging for debugging and monitoring

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bitcoin Core  │    │   OPI Network   │    │   PostgreSQL    │
│     RPC API     │    │   Event API     │    │    Database     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   OPI-LC Core   │
                    │   (Python)      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   REST API      │
                    │   (Node.js)     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Applications  │
                    │   & Services    │
                    └─────────────────┘
```

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 22.04+ (recommended), macOS, or Windows with WSL
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: 50GB+ available space
- **Network**: Stable internet connection

### Software Dependencies
- **Node.js**: 20.x or higher
- **Python**: 3.8+ with pip
- **PostgreSQL**: 12+ (recommended) or SQLite3
- **Git**: Latest version

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/bestinslot-xyz/OPI-LC.git
cd OPI-LC
```

### 2. Database Setup

#### Option A: PostgreSQL (Recommended for Production)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql.service

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE opi_lc;"
sudo -u postgres psql -c "CREATE USER indexer WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE opi_lc TO indexer;"

# Restore from backup (optional, for faster sync)
cd brc20/psql
wget http://s3.opi.network:9000/opi-light-client-files/db_4/light_client_brc20_last.dump
sudo -u postgres pg_restore -U postgres -Fc -d opi_lc < light_client_brc20_last.dump
```

#### Option B: SQLite (Development/Testing)
```bash
# SQLite is included with Python, no additional setup needed
```

### 3. Python Dependencies
```bash
cd brc20/psql
pip install python-dotenv psycopg2-binary buidl requests
```

### 4. Node.js Dependencies
```bash
cd brc20/api
npm install
```

### 5. Configuration

#### Indexer Configuration (`brc20/psql/.env_psql`)
```env
DB_USER="indexer"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="opi_lc"
DB_PASSWD="your_password"

# Bitcoin Core RPC (optional, for enhanced txid lookup)
USE_BITCOIN_RPC_FOR_TXID=true
BITCOIN_RPC_HOST=127.0.0.1
BITCOIN_RPC_PORT=8332
BITCOIN_RPC_USER=bitcoinrpc
BITCOIN_RPC_PASSWORD=your_rpc_password

# Indexer settings (do not change for hash verification)
FIRST_INSCRIPTION_HEIGHT="767430"
FIRST_BRC20_HEIGHT="779832"

# Reporting settings
REPORT_TO_INDEXER="true"
REPORT_URL="https://api.opi.network/report_block"
REPORT_RETRIES="10"
REPORT_NAME="opi_brc20_light_client"

# Enable extra tables for enhanced features
CREATE_EXTRA_TABLES="true"
```

#### API Configuration (`brc20/api/.env_api`)
```env
DB_TYPE="psql"
DB_USER="indexer"
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="opi_lc"
DB_PASSWD="your_password"
DB_SSL="true"
DB_MAX_CONNECTIONS=10

# API settings
API_HOST="127.0.0.1"
API_PORT="3003"
API_TRUSTED_PROXY_CNT="0"

# Enable extra features
USE_EXTRA_TABLES="true"

# Bitcoin Core RPC (for txid lookup)
BTC_RPC_HOST="127.0.0.1"
BTC_RPC_PORT="8332"
BTC_RPC_USER="bitcoin"
BTC_RPC_PASSWORD="your_rpc_password"
```

### 6. Initialize Database
```bash
cd brc20/psql
python3 initialise_psql.py
```

### 7. Start Services

#### Start Indexer
```bash
cd brc20/psql
python3 brc20_light_client_psql.py --continuous
```

#### Start API (in new terminal)
```bash
cd brc20/api
npm start
```

### 8. Verify Installation
```bash
# Test API endpoints
curl http://127.0.0.1:3003/v1/brc20/block_height
curl http://127.0.0.1:3003/v1/brc20/db_version
```

## 🛠️ Management Script

Use the included management script for easy service control:

```bash
# Start API
./manage.sh start

# Stop API
./manage.sh stop

# Restart API
./manage.sh restart

# Check status
./manage.sh status

# Run tests
./manage.sh test

# View logs
./manage.sh logs

# Health check
./manage.sh health
```

## 📚 API Reference

### Core Endpoints

#### Get Current Block Height
```http
GET /v1/brc20/block_height
```
**Response**: `"905054"`

#### Get Database Version
```http
GET /v1/brc20/db_version
```
**Response**: `"5"`

#### Get Balance at Block
```http
GET /v1/brc20/balance_on_block?block_height=900000&pkscript=001234567890abcdef&ticker=ordi
```
**Response**:
```json
{
  "error": null,
  "result": {
    "overall_balance": "1000000000000000000",
    "available_balance": "500000000000000000"
  }
}
```

#### Get Block Activity
```http
GET /v1/brc20/activity_on_block?block_height=900000
```
**Response**:
```json
{
  "error": null,
  "result": [
    {
      "event_type": "transfer-transfer",
      "inscription_id": "abc123...i0",
      "source_pkScript": "001234567890abcdef",
      "spent_pkScript": "00fedcba0987654321",
      "tick": "ordi",
      "amount": "1000000000000000000",
      "using_tx_id": "def456..."
    }
  ]
}
```

#### Get Current Wallet Balance
```http
GET /v1/brc20/get_current_balance_of_wallet?ticker=ordi&pkscript=001234567890abcdef
```
**Response**:
```json
{
  "error": null,
  "result": {
    "overall_balance": "1000000000000000000",
    "available_balance": "500000000000000000",
    "block_height": 905054
  }
}
```

### No-Return Support (Simplicity Indexer Integration)

#### Get Transfer Event by Spending Transaction ID
```http
GET /v1/brc20/event/by-spending-tx/{txid}
```
**Example**:
```bash
curl "http://127.0.0.1:3003/v1/brc20/event/by-spending-tx/f4e5d6c7b8a9..."
```
**Response**:
```json
{
  "error": null,
  "result": {
    "id": 123,
    "event_type": 3,
    "block_height": 800000,
    "inscription_id": "a1b2c3...i0",
    "event": {
      "source_pkScript": "76a914...",
      "spent_pkScript": "76a914...",
      "tick": "ordi",
      "amount": "1000",
      "using_tx_id": "f4e5d6..."
    }
  }
}
```

### Enhanced Features (with `USE_EXTRA_TABLES=true`)

#### Get Token Holders
```http
GET /v1/brc20/holders?ticker=ordi
```

#### Get Unused Transfers for Wallet
```http
GET /v1/brc20/get_valid_tx_notes_of_wallet?pkscript=001234567890abcdef
```

#### Get Unused Transfers for Token
```http
GET /v1/brc20/get_valid_tx_notes_of_ticker?ticker=ordi
```

### Hash Verification Endpoints

#### Get Event Hash for Block
```http
GET /v1/brc20/get_hash_of_all_activity?block_height=900000
```

#### Get Current Balances Hash
```http
GET /v1/brc20/get_hash_of_all_current_balances
```

### Transaction Lookup

#### Lookup Spending Transaction
```http
GET /v1/brc20/lookup_spending_tx?block_height=900000&prev_txid=abc123&prev_vout=0
```

## 🐳 Docker Deployment

### Build and Run
```bash
# Build image
docker build -t opi-lc .

# Run container
docker run -d \
  --name opi-lc \
  -p 3003:3003 \
  -e DB_HOST=your_db_host \
  -e DB_USER=your_db_user \
  -e DB_PASSWD=your_db_password \
  opi-lc
```

### Docker Compose
```yaml
version: '3.8'
services:
  opi-lc:
    build: .
    ports:
      - "3003:3003"
    environment:
      - DB_HOST=postgres
      - DB_USER=indexer
      - DB_PASSWD=your_password
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=opi_lc
      - POSTGRES_USER=indexer
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## 🔧 Development

### Running Tests
```bash
cd brc20/api
npm test
npm run test:coverage
```

### Code Quality
```bash
cd brc20/api
npm run lint
```

### Database Schema
The system uses the following main tables:

- **`brc20_events`**: All BRC-20 events with JSON data
- **`brc20_tickers`**: Token deployments and supply info
- **`brc20_current_balances`**: Current wallet balances
- **`brc20_historic_balances`**: Historical balance snapshots
- **`brc20_block_hashes`**: Block tracking and verification
- **`brc20_cumulative_event_hashes`**: Hash verification for consensus

For detailed schema information, see [DB_overview.md](temp-docs/DB_overview.md).

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check API health
curl http://127.0.0.1:3003/v1/brc20/block_height

# Check database connection
./manage.sh health

# View service status
./manage.sh status
```

### Logs
```bash
# View API logs
./manage.sh logs

# View indexer logs
tail -f brc20/psql/indexer.log
```

### Performance Monitoring
- Monitor database connection pool usage
- Track API response times
- Monitor disk space for database growth
- Check memory usage for both services

## 🔒 Security Considerations

### Production Deployment
1. **Use HTTPS**: Configure reverse proxy with SSL/TLS
2. **Firewall**: Restrict access to necessary ports only
3. **Database Security**: Use strong passwords and limit network access
4. **API Rate Limiting**: Implement rate limiting for public APIs
5. **Monitoring**: Set up alerts for service failures

### Environment Variables
- Never commit `.env` files to version control
- Use different credentials for development and production
- Rotate database passwords regularly
- Use environment-specific configurations

## 🚨 Troubleshooting

### Common Issues

#### Indexer Won't Start
```bash
# Check database connection
psql -h localhost -U indexer -d opi_lc -c "SELECT 1;"

# Check Python dependencies
pip list | grep -E "(psycopg2|buidl|dotenv)"

# Check logs
tail -f brc20/psql/indexer.log
```

#### API Won't Start
```bash
# Check Node.js version
node --version

# Check dependencies
cd brc20/api && npm list

# Check database connection
curl http://127.0.0.1:3003/v1/brc20/db_version
```

#### Database Connection Issues
```bash
# Test PostgreSQL connection
sudo -u postgres psql -c "\l"

# Check PostgreSQL service
sudo systemctl status postgresql

# Verify user permissions
sudo -u postgres psql -c "\du"
```

### Performance Issues
1. **Slow Queries**: Check database indexes
2. **Memory Issues**: Increase Node.js heap size
3. **Connection Pool**: Adjust `DB_MAX_CONNECTIONS`
4. **Disk Space**: Monitor database growth

## 📈 Scaling

### Horizontal Scaling
- Deploy multiple API instances behind a load balancer
- Use read replicas for database queries
- Implement caching layer (Redis)

### Vertical Scaling
- Increase server resources (CPU, RAM, SSD)
- Optimize database configuration
- Tune connection pool settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](temp-docs/API_DOCUMENTATION.md)
- [Database Overview](temp-docs/DB_overview.md)
- [Installation Guides](INSTALL.brc20.psql.ubuntu.md)

### Community
- **Issues**: [GitHub Issues](https://github.com/bestinslot-xyz/OPI-LC/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bestinslot-xyz/OPI-LC/discussions)

### Professional Support
For enterprise deployments and professional support, contact the OPI Network team.

## 🙏 Acknowledgments

- Built on the OPI Network infrastructure
- Uses PostgreSQL for reliable data storage
- Designed for Simplicity Indexer integration
- Community contributors and maintainers

---

**Version**: v0.3.1  
**Last Updated**: 2024  
**Maintainers**: OPI Network Team
