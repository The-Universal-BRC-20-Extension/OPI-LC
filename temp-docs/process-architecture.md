# OPI-LC Process Architecture

This document explains the internal architecture and data flow of the OPI-LC system, including how events are processed, validated, and stored.

## System Overview

OPI-LC operates as a **light client** that validates BRC-20 events by:
1. Fetching event hashes from OPI Network
2. Retrieving actual events from OPI API
3. Recalculating hashes locally for validation
4. Storing validated events in the database

## Architecture Components

### 1. Light Client Core (`brc20_light_client_*.py`)

The main indexing engine that processes BRC-20 events and maintains the database.

#### Key Functions:

**Event Processing Pipeline:**
```python
def index_block(block_height):
    # 1. Get block info from OPI Network
    # 2. Fetch events for the block
    # 3. Process each event type
    # 4. Calculate block hash
    # 5. Update cumulative hash
    # 6. Store in database
    # 7. Report to indexer (optional)
```

**Event Types Supported:**
- `deploy-inscribe`: Token deployment
- `mint-inscribe`: Token minting
- `transfer-inscribe`: Token transfer inscription
- `transfer-transfer`: Token transfer execution

### 2. API Service (`api.js`)

REST API service that provides access to indexed data.

#### Key Endpoints:
- `/v1/brc20/block_height`: Current indexed block height
- `/v1/brc20/activity_on_block`: Events in a specific block
- `/v1/brc20/balance_on_block`: Balance at block start
- `/v1/brc20/get_current_balance_of_wallet`: Current wallet balance

## Data Flow

### 1. Block Processing Flow

```
OPI Network → Light Client → Database → API → Client
     ↓              ↓           ↓        ↓
  Hash Data    Event Data   Storage   Queries
```

**Detailed Flow:**

1. **Hash Fetching**: Light client fetches block hash from OPI Network
2. **Event Retrieval**: Gets actual events for the block from OPI API
3. **Event Processing**: Processes each event according to BRC-20 protocol
4. **Hash Validation**: Recalculates block hash and compares with OPI Network
5. **Database Storage**: Stores validated events and balances
6. **Hash Reporting**: Reports validated hash back to OPI Network (optional)

### 2. Event Processing Pipeline

#### Deploy Event Processing:
```python
def deploy_inscribe(block_height, inscription_id, deployer_pkScript, 
                   deployer_wallet, tick, original_tick, max_supply, 
                   decimals, limit_per_mint, is_self_mint):
    # 1. Validate ticker format
    # 2. Check if ticker already exists
    # 3. Store deployment event
    # 4. Initialize ticker metadata
    # 5. Update block hash string
```

#### Mint Event Processing:
```python
def mint_inscribe(block_height, inscription_id, minted_pkScript, 
                 minted_wallet, tick, original_tick, amount, parent_id):
    # 1. Validate ticker exists
    # 2. Check mint limits
    # 3. Update balances
    # 4. Store mint event
    # 5. Update block hash string
```

#### Transfer Event Processing:
```python
def transfer_inscribe(block_height, inscription_id, source_pkScript, 
                     source_wallet, tick, original_tick, amount):
    # 1. Validate ticker exists
    # 2. Check available balance
    # 3. Reserve transfer amount
    # 4. Store transfer event
    # 5. Update block hash string
```

### 3. Hash Calculation Algorithm

The system uses a specific hash calculation algorithm to validate events:

```python
EVENT_SEPARATOR = '|'

for event in block_events:
    if event is 'deploy-inscribe':
        block_str += 'deploy-inscribe;<inscr_id>;<deployer_pkscript>;<ticker>;<max_supply>;<decimals>;<limit_per_mint>' + EVENT_SEPARATOR
    if event is 'mint-inscribe':
        block_str += 'mint-inscribe;<inscr_id>;<minter_pkscript>;<ticker>;<amount>' + EVENT_SEPARATOR
    if event is 'transfer-inscribe':
        block_str += 'transfer-inscribe;<inscr_id>;<source_pkscript>;<ticker>;<amount>' + EVENT_SEPARATOR
    if event is 'transfer-transfer':
        block_str += 'transfer-transfer;<inscr_id>;<source_pkscript>;<sent_pkscript>;<ticker>;<amount>' + EVENT_SEPARATOR

if block_str.last is EVENT_SEPARATOR: 
    block_str.remove_last()

block_hash = sha256_hex(block_str)
cumulative_hash = sha256_hex(last_cumulative_hash + block_hash)
```

## Database Schema

### Core Tables

#### `brc20_events`
Stores all BRC-20 events with their metadata:
```sql
CREATE TABLE brc20_events (
    id SERIAL PRIMARY KEY,
    block_height INTEGER,
    inscription_id TEXT,
    event_type INTEGER,
    event JSONB
);
```

#### `brc20_block_hashes`
Stores calculated block and cumulative hashes:
```sql
CREATE TABLE brc20_block_hashes (
    block_height INTEGER PRIMARY KEY,
    block_hash TEXT,
    cumulative_hash TEXT,
    event_count INTEGER
);
```

#### `brc20_historic_balances`
Tracks balance changes over time:
```sql
CREATE TABLE brc20_historic_balances (
    id SERIAL PRIMARY KEY,
    block_height INTEGER,
    pkscript TEXT,
    tick TEXT,
    overall_balance NUMERIC,
    available_balance NUMERIC
);
```

### Optional Tables (Extra Tables)

#### `brc20_current_balances`
Fast lookup for current balances:
```sql
CREATE TABLE brc20_current_balances (
    pkscript TEXT,
    tick TEXT,
    overall_balance NUMERIC,
    available_balance NUMERIC,
    PRIMARY KEY (pkscript, tick)
);
```

#### `brc20_unused_tx_inscrs`
Tracks unused transfer inscriptions:
```sql
CREATE TABLE brc20_unused_tx_inscrs (
    inscription_id TEXT PRIMARY KEY,
    pkscript TEXT,
    tick TEXT,
    amount NUMERIC
);
```

## Error Handling and Recovery

### 1. Reorg Detection

The system detects blockchain reorganizations:

```python
def check_for_reorg():
    # Compare local block hash with OPI Network
    # If mismatch detected, trigger reorg fix
    pass

def reorg_fix(reorg_height):
    # Remove all data from reorg_height onwards
    # Re-index from reorg_height
    pass
```

### 2. Database Consistency

The system maintains data consistency through:

- **Transaction Management**: All database operations use transactions
- **Hash Validation**: Every block is validated against OPI Network
- **Balance Tracking**: Comprehensive balance change tracking
- **Event Integrity**: All events are stored with full metadata

### 3. Recovery Mechanisms

#### Automatic Recovery:
- **Reorg Detection**: Automatically detects and fixes chain reorganizations
- **Hash Mismatch**: Recalculates and validates hashes
- **Database Corruption**: Can rebuild from backup

#### Manual Recovery:
- **Database Restore**: Restore from latest backup
- **Reindex Process**: Re-index from specific block height
- **Hash Recalculation**: Recalculate all hashes from scratch

## Performance Considerations

### 1. Database Optimization

**PostgreSQL Optimizations:**
```sql
-- Indexes for performance
CREATE INDEX idx_brc20_events_block_height ON brc20_events(block_height);
CREATE INDEX idx_brc20_events_inscription_id ON brc20_events(inscription_id);
CREATE INDEX idx_brc20_balances_pkscript_tick ON brc20_historic_balances(pkscript, tick);
```

**SQLite Optimizations:**
```sql
-- Enable WAL mode for better concurrency
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
```

### 2. Memory Management

- **Connection Pooling**: API service uses connection pooling
- **Batch Processing**: Events are processed in batches
- **Cache Management**: Frequently accessed data is cached

### 3. Network Optimization

- **Retry Logic**: Failed API calls are retried with exponential backoff
- **Connection Pooling**: Reuses HTTP connections
- **Timeout Handling**: Proper timeout configuration for network calls

## Monitoring Points

### 1. Key Metrics

- **Block Processing Rate**: Blocks processed per second
- **Event Processing Rate**: Events processed per second
- **Hash Validation Success Rate**: Percentage of successful hash validations
- **Database Performance**: Query response times
- **API Response Times**: Endpoint response times

### 2. Health Checks

- **Database Connectivity**: Regular connection tests
- **OPI Network Connectivity**: API endpoint availability
- **Hash Validation**: Block hash calculation accuracy
- **Memory Usage**: System resource monitoring
- **Disk Space**: Database growth monitoring

### 3. Alert Conditions

- **Block Processing Stalled**: No new blocks processed for X minutes
- **Hash Mismatch**: Local hash doesn't match OPI Network
- **Database Errors**: Connection or query failures
- **High Memory Usage**: System resource exhaustion
- **API Errors**: High error rate on API endpoints

## Security Considerations

### 1. Data Integrity

- **Hash Validation**: Every block is validated against OPI Network
- **Event Verification**: All events are verified against protocol rules
- **Balance Consistency**: Balances are calculated and verified

### 2. Access Control

- **API Rate Limiting**: Prevents abuse of API endpoints
- **Input Validation**: All API inputs are validated
- **SQL Injection Prevention**: Parameterized queries used

### 3. Network Security

- **HTTPS**: All external API calls use HTTPS
- **Certificate Validation**: SSL certificate validation enabled
- **Firewall Configuration**: Proper network access controls

## Future Enhancements

### 1. Protocol Support

- **Additional Meta-Protocols**: Support for other Bitcoin protocols
- **Protocol Versioning**: Support for protocol updates
- **Custom Protocol Rules**: Configurable protocol validation

### 2. Performance Improvements

- **Parallel Processing**: Multi-threaded event processing
- **Caching Layer**: Redis-based caching for frequently accessed data
- **Database Sharding**: Horizontal database scaling

### 3. Monitoring Enhancements

- **Metrics Dashboard**: Real-time monitoring dashboard
- **Alert System**: Automated alerting for issues
- **Log Aggregation**: Centralized logging system 