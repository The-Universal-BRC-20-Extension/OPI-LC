# OPI-LC (OPI BRC20 Light Client)

A Node.js API server for BRC20 token indexing and querying with PostgreSQL backend.

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- PostgreSQL 15+
- Database `opi_lc` with BRC20 data imported
- User `indexer` with database access

### 1. Start the API Server
```bash
cd /home/indexer/OPI-LC/brc20/api
export API_PORT=3003
npm start
```

### 2. Test the API
```bash
# In a separate terminal
cd /home/indexer/OPI-LC/brc20/api
npm test
```

### 3. Verify API is Running
```bash
curl http://127.0.0.1:3003/v1/brc20/ip
```

## 📁 Project Structure

```
OPI-LC/
├── brc20/
│   ├── api/                    # Main API server
│   │   ├── api.js             # Express server
│   │   ├── package.json       # Dependencies & scripts
│   │   └── tests/             # Test suites
│   │       ├── unit/          # Unit tests
│   │       ├── integration/   # API endpoint tests
│   │       └── functional/    # Service lifecycle tests
│   └── psql/                  # Database scripts
└── README.md                  # This file
```

## 🔧 Common Operations

### Start API Server
```bash
cd /home/indexer/OPI-LC/brc20/api
export API_PORT=3003
npm start
```

### Stop API Server
```bash
pkill -f "node.*api"
```

### Run All Tests
```bash
cd /home/indexer/OPI-LC/brc20/api
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm test -- tests/unit/

# Integration tests only
npm test -- tests/integration/

# Functional tests only
npm test -- tests/functional/
```

### Check Database Connection
```bash
psql -d opi_lc -U indexer -c "SELECT * FROM brc20_indexer_version LIMIT 1;"
```

## 🌐 API Endpoints

### Health Checks
- `GET /v1/brc20/ip` - Returns client IP
- `GET /v1/brc20/db_version` - Returns database version
- `GET /v1/brc20/event_hash_version` - Returns event hash version
- `GET /v1/brc20/block_height` - Returns current block height

### Balance Endpoints
- `GET /v1/brc20/balance_on_block` - Get balance at specific block
- `GET /v1/brc20/get_current_balance_of_wallet` - Get current wallet balance

### Activity Endpoints
- `GET /v1/brc20/activity_on_block` - Get activity for specific block

## 🐛 Troubleshooting

### API Won't Start
**Problem:** `npm start` fails with "Missing script"
**Solution:** 
```bash
cd /home/indexer/OPI-LC/brc20/api  # Must be in correct directory
npm start
```

### Tests Fail with Connection Refused
**Problem:** Tests fail with `ECONNREFUSED 127.0.0.1:3003`
**Solution:** 
1. Start API server first:
   ```bash
   cd /home/indexer/OPI-LC/brc20/api
   export API_PORT=3003
   npm start
   ```
2. Run tests in separate terminal:
   ```bash
   cd /home/indexer/OPI-LC/brc20/api
   npm test
   ```

### Database Connection Issues
**Problem:** API returns 500 errors
**Solution:**
```bash
# Check database connection
psql -d opi_lc -U indexer -c "SELECT 1;"

# Check if version table has data
psql -d opi_lc -U indexer -c "SELECT * FROM brc20_indexer_version;"

# If empty, insert data:
psql -d opi_lc -U indexer -c "INSERT INTO brc20_indexer_version (indexer_version, db_version, event_hash_version) VALUES ('1.0.0', 1, 1);"
```

### Parameter Validation Errors
**Problem:** API returns 400 for valid requests
**Solution:** Check required parameters:
- `ticker` - Required for balance endpoints
- `block_height` - Must be valid integer
- `pkscript` or `address` - Required for wallet endpoints

## 📊 Test Results

### Expected Test Output
```
Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        0.5s
```

### Test Categories
- **Unit Tests:** Database connectivity, basic functionality
- **Integration Tests:** API endpoint behavior, error handling
- **Functional Tests:** Service lifecycle, concurrent requests

## 🔄 Development Workflow

1. **Make Changes:** Edit files in `/home/indexer/OPI-LC/brc20/api/`
2. **Restart API:** Kill old process, start new one
3. **Run Tests:** Verify changes work correctly
4. **Test Manually:** Use curl to test specific endpoints

## 📝 Environment Variables

Required environment variables:
```bash
export API_PORT=3003
export DB_USER=indexer
export DB_PASSWD=your_password
export DB_HOST=localhost
export DB_DATABASE=opi_lc
export DB_PORT=5432
export DB_TYPE=psql
```

## 🚨 Emergency Procedures

### API Crashes
```bash
# Kill all Node.js processes
pkill -f "node.*api"

# Restart API
cd /home/indexer/OPI-LC/brc20/api
export API_PORT=3003
npm start
```

### Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL if needed
sudo systemctl restart postgresql
```

### Full Reset
```bash
# Stop API
pkill -f "node.*api"

# Clear any cached data
cd /home/indexer/OPI-LC/brc20/api
rm -rf node_modules/.cache

# Restart API
export API_PORT=3003
npm start
```

## 📞 Support

For issues:
1. Check this README first
2. Run `npm test` to identify specific failures
3. Check API logs for error messages
4. Verify database connectivity
5. Ensure all environment variables are set correctly
