# OPI-LC Quick Reference

## 🚀 Essential Commands

### Start/Stop API
```bash
./manage.sh start    # Start API server
./manage.sh stop     # Stop API server
./manage.sh restart  # Restart API server
./manage.sh status   # Check if API is running
```

### Testing
```bash
./manage.sh test     # Run all tests (requires API running)
./manage.sh health   # Full health check (dependencies + database + API + tests)
```

### Troubleshooting
```bash
./manage.sh logs     # View API logs
./manage.sh help     # Show all available commands
```

## 🔧 Manual Commands (if script fails)

### Start API Manually
```bash
cd /home/indexer/OPI-LC/brc20/api
export API_PORT=3003
npm start
```

### Run Tests Manually
```bash
cd /home/indexer/OPI-LC/brc20/api
npm test
```

### Check Database
```bash
psql -d opi_lc -U indexer -c "SELECT * FROM brc20_indexer_version;"
```

## 🌐 API Endpoints

### Health Checks
- `GET http://127.0.0.1:3003/v1/brc20/ip`
- `GET http://127.0.0.1:3003/v1/brc20/db_version`
- `GET http://127.0.0.1:3003/v1/brc20/block_height`

### Test with curl
```bash
curl http://127.0.0.1:3003/v1/brc20/ip
curl http://127.0.0.1:3003/v1/brc20/db_version
```

## 🚨 Emergency Fixes

### API Won't Start
```bash
pkill -f "node.*api"  # Kill all Node processes
cd /home/indexer/OPI-LC/brc20/api
export API_PORT=3003
npm start
```

### Tests Fail
```bash
# 1. Make sure API is running
./manage.sh status

# 2. If not running, start it
./manage.sh start

# 3. Run tests
./manage.sh test
```

### Database Issues
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql

# Check connection
psql -d opi_lc -U indexer -c "SELECT 1;"
```

## 📊 Expected Test Results
```
Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
Time:        0.5s
```

## 📁 Key Directories
- **API Code:** `/home/indexer/OPI-LC/brc20/api/`
- **Database:** PostgreSQL `opi_lc` database
- **Logs:** `/home/indexer/OPI-LC/brc20/api/api.log`

## ⚡ One-Liner Health Check
```bash
./manage.sh health
```
This runs everything: dependencies → database → API → tests 