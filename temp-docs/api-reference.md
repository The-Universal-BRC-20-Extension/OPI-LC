# OPI-LC BRC-20 API Reference

## Overview

The OPI-LC BRC-20 API provides REST endpoints for accessing indexed BRC-20 data. The API supports both PostgreSQL and SQLite backends.

**Base URL**: `http://127.0.0.1:3003` (default)
**API Version**: `v1`

## Configuration

The API can be configured using environment variables:

- `DB_TYPE`: Database type (`psql` or `sqlite`)
- `DB_USER`: Database username
- `DB_HOST`: Database host
- `DB_DATABASE`: Database name
- `DB_PASSWD`: Database password
- `DB_PORT`: Database port
- `API_PORT`: API port (default: 8000)
- `API_HOST`: API host (default: 127.0.0.1)
- `USE_EXTRA_TABLES`: Enable extra tables for faster queries

## Response Format

All API responses follow a consistent format:

```json
{
  "error": null,
  "result": { ... }
}
```

**Error Response:**
```json
{
  "error": "error message",
  "result": null
}
```

## Endpoints

### 1. System Information

#### Get Client IP Address
**Endpoint**: `GET /v1/brc20/ip`

Returns the IP address of the requesting client.

**Response**: Plain text with IP address

**Example:**
```bash
curl http://127.0.0.1:8000/v1/brc20/ip
```

#### Get Database Version
**Endpoint**: `GET /v1/brc20/db_version`

Returns the database schema version.

**Response**: Plain text with version number

**Example:**
```bash
curl http://127.0.0.1:8000/v1/brc20/db_version
```

#### Get Event Hash Version
**Endpoint**: `GET /v1/brc20/event_hash_version`

Returns the event hash calculation version.

**Response**: Plain text with version number

**Example:**
```bash
curl http://127.0.0.1:8000/v1/brc20/event_hash_version
```

#### Get Current Block Height
**Endpoint**: `GET /v1/brc20/block_height`

Returns the current indexed block height.

**Response**: Plain text with block height number

**Example:**
```bash
curl http://127.0.0.1:8000/v1/brc20/block_height
```

### 2. Balance Queries

#### Get Balance on Block
**Endpoint**: `GET /v1/brc20/balance_on_block`

**Parameters:**
- `block_height` (required): Integer - The block height to query
- `pkscript` (required): String - The public key script (hex format)
- `ticker` (required): String - The token ticker (case-insensitive)

**Description**: Returns the balance of a specific token for a wallet at the start of the specified block.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/balance_on_block?block_height=300300&pkscript=001234567890abcdef1234567890abcdef12345678&ticker=ordi"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "overall_balance": "5000",
    "available_balance": "3000"
  }
}
```

#### Get Current Balance of Wallet
**Endpoint**: `GET /v1/brc20/get_current_balance_of_wallet`

**Parameters:**
- `address` (optional): String - Bitcoin address
- `pkscript` (optional): String - Public key script (hex format)
- `ticker` (required): String - The token ticker (case-insensitive)

**Description**: Returns the current balance of a specific token for a wallet.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_current_balance_of_wallet?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&ticker=ordi"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "overall_balance": "5000",
    "available_balance": "3000",
    "block_height": 300300
  }
}
```

### 3. Block Activity

#### Get Activity on Block
**Endpoint**: `GET /v1/brc20/activity_on_block`

**Parameters:**
- `block_height` (required): Integer - The block height to query

**Description**: Returns all BRC-20 events that occurred in the specified block.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/activity_on_block?block_height=300300"
```

**Response:**
```json
{
  "error": null,
  "result": [
    {
      "event_type": "deploy-inscribe",
      "inscription_id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefi0",
      "deployer_pkScript": "001234567890abcdef1234567890abcdef12345678",
      "tick": "ordi",
      "original_tick": "ordi",
      "max_supply": "21000000",
      "decimals": "18",
      "limit_per_mint": "1000",
      "is_self_mint": "false"
    },
    {
      "event_type": "transfer-transfer",
      "inscription_id": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890i1",
      "source_pkScript": "001234567890abcdef1234567890abcdef12345678",
      "spent_pkScript": "00abcdef1234567890abcdef1234567890abcdef12",
      "tick": "ordi",
      "original_tick": "ordi",
      "amount": "1000",
      "using_tx_id": "c81e2bad6d462fd2e2266ea46d9ff460698f7cef2811eb86e5dd439361031b65"
    }
  ]
}
```

### 4. Event Lookup

#### Get Event by Spending Transaction ID
**Endpoint**: `GET /v1/brc20/event/by-spending-tx/:txid`

**Parameters:**
- `txid` (required): String - The spending transaction ID

**Description**: Returns the transfer-transfer event associated with a specific spending transaction ID.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/event/by-spending-tx/c81e2bad6d462fd2e2266ea46d9ff460698f7cef2811eb86e5dd439361031b65"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "id": 12345,
    "event_type": 3,
    "block_height": 786688,
    "inscription_id": "d4118440b35b45bca155049e2341ff1ca469a18cba837248fb9f666da174b3fdi0",
    "event": {
      "source_pkScript": "001234567890abcdef1234567890abcdef12345678",
      "spent_pkScript": "00abcdef1234567890abcdef1234567890abcdef12",
      "tick": "pepe",
      "original_tick": "pepe",
      "amount": "1000000000000000000000",
      "using_tx_id": "c81e2bad6d462fd2e2266ea46d9ff460698f7cef2811eb86e5dd439361031b65"
    }
  }
}
```

### 5. Bitcoin RPC Integration

#### Lookup Spending Transaction
**Endpoint**: `GET /v1/brc20/lookup_spending_tx`

**Parameters:**
- `block_height` (required): Integer - The block height to search in
- `prev_txid` (required): String - The previous transaction ID
- `prev_vout` (required): Integer - The previous output index

**Description**: Looks up the spending transaction ID for a given prevout using Bitcoin RPC.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/lookup_spending_tx?block_height=786688&prev_txid=d4118440b35b45bca155049e2341ff1ca469a18cba837248fb9f666da174b3fd&prev_vout=0"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "spending_txid": "c81e2bad6d462fd2e2266ea46d9ff460698f7cef2811eb86e5dd439361031b65",
    "found": true
  }
}
```

### 6. Extra Tables Endpoints (Optional)

These endpoints are only available if `USE_EXTRA_TABLES=true`.

#### Get Valid Transfer Notes of Wallet
**Endpoint**: `GET /v1/brc20/get_valid_tx_notes_of_wallet`

**Parameters:**
- `address` (optional): String - Bitcoin address
- `pkscript` (optional): String - Public key script (hex format)

**Description**: Returns unused transfer inscriptions for a specific wallet.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_valid_tx_notes_of_wallet?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "unused_txes": [
      {
        "tick": "ordi",
        "inscription_id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefi0",
        "amount": "1000",
        "genesis_height": 300300
      }
    ],
    "block_height": 300300
  }
}
```

#### Get Valid Transfer Notes of Ticker
**Endpoint**: `GET /v1/brc20/get_valid_tx_notes_of_ticker`

**Parameters:**
- `ticker` (required): String - The token ticker (case-insensitive)

**Description**: Returns unused transfer inscriptions for a specific token.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_valid_tx_notes_of_ticker?ticker=ordi"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "unused_txes": [
      {
        "current_holder_pkscript": "001234567890abcdef1234567890abcdef12345678",
        "current_holder_wallet": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "inscription_id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefi0",
        "amount": "1000",
        "genesis_height": 300300
      }
    ],
    "block_height": 300300
  }
}
```

#### Get Token Holders
**Endpoint**: `GET /v1/brc20/holders`

**Parameters:**
- `ticker` (required): String - The token ticker (case-insensitive)

**Description**: Returns a list of wallets holding the specified token, sorted by balance.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/holders?ticker=ordi"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "unused_txes": [
      {
        "pkscript": "001234567890abcdef1234567890abcdef12345678",
        "wallet": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "overall_balance": "10000",
        "available_balance": "3003"
      }
    ],
    "block_height": 300300
  }
}
```

### 7. Hash Endpoints

#### Get Hash of All Activity
**Endpoint**: `GET /v1/brc20/get_hash_of_all_activity`

**Parameters:**
- `block_height` (required): Integer - The block height to query

**Description**: Returns the cumulative and block event hashes for the specified block.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_hash_of_all_activity?block_height=300300"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "cumulative_event_hash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678",
    "block_event_hash": "f1e2d3c4b5a6789012345678901234567890abcdef1234567890abcdef12345678",
    "indexer_version": "opi-brc20-light-client v0.3.1",
    "block_height": 300300
  }
}
```

#### Get Hash of All Current Balances
**Endpoint**: `GET /v1/brc20/get_hash_of_all_current_balances`

**Description**: Returns a hash of all current balances across all tokens and wallets.

**Example:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_hash_of_all_current_balances"
```

**Response:**
```json
{
  "error": null,
  "result": {
    "current_balances_hash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678",
    "indexer_version": "opi-brc20-light-client v0.3.1",
    "block_height": 300300
  }
}
```

## Error Codes

### Common Error Responses

**Block Not Indexed:**
```json
{
  "error": "block not indexed yet",
  "result": null
}
```

**No Balance Found:**
```json
{
  "error": "no balance found",
  "result": null
}
```

**Event Not Found:**
```json
{
  "error": "Event not found for the given spending transaction ID",
  "result": null
}
```

**Invalid Parameters:**
```json
{
  "error": "Missing required parameter: ticker",
  "result": null
}
```

**Internal Server Error:**
```json
{
  "error": "internal error",
  "result": null
}
```

## Event Types

The API supports the following BRC-20 event types:

1. **deploy-inscribe**: Token deployment event
2. **mint-inscribe**: Token minting event
3. **transfer-inscribe**: Token transfer inscription event
4. **transfer-transfer**: Token transfer execution event

## Bitcoin RPC Integration

The API includes Bitcoin RPC integration for:
- Looking up real spending transaction IDs
- Validating transfer-transfer events
- Providing accurate transaction data instead of placeholder values

## Rate Limiting

Currently, the API does not implement rate limiting. However, it's recommended to:
- Limit requests to reasonable rates (e.g., < 100 requests/second)
- Implement client-side caching for frequently accessed data
- Use bulk endpoints when possible

## CORS Support

The API includes CORS headers to support cross-origin requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Usage Examples

### JavaScript/Node.js

```javascript
// Get current block height
const response = await fetch('http://127.0.0.1:8000/v1/brc20/block_height');
const blockHeight = await response.text();
console.log('Current block height:', blockHeight);

// Get balance for a wallet
const balanceResponse = await fetch(
  'http://127.0.0.1:8000/v1/brc20/get_current_balance_of_wallet?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&ticker=ordi'
);
const balanceData = await balanceResponse.json();
console.log('Balance:', balanceData.result);
```

### Python

```python
import requests

# Get block activity
response = requests.get('http://127.0.0.1:8000/v1/brc20/activity_on_block', 
                       params={'block_height': 300300})
data = response.json()
if data['error'] is None:
    for event in data['result']:
        print(f"Event: {event['event_type']} - {event['inscription_id']}")
```

### cURL

```bash
# Get all events for a block
curl "http://127.0.0.1:8000/v1/brc20/activity_on_block?block_height=300300" | jq

# Get balance for multiple wallets
for address in "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" "bc1qdefghijklmnopqrstuvwxyz1234567890"; do
    curl "http://127.0.0.1:8000/v1/brc20/get_current_balance_of_wallet?address=$address&ticker=ordi"
done
```

## Performance Tips

1. **Use specific block heights** rather than querying all blocks
2. **Cache frequently accessed data** (balances, block hashes)
3. **Use pagination** for large result sets
4. **Implement client-side caching** for better performance

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Verify API service is running
   - Check if port 8000 is accessible
   - Verify firewall settings

2. **Slow Response Times**
   - Check database performance
   - Monitor system resources
   - Consider database optimization

3. **Invalid Parameters**
   - Verify parameter types and formats
   - Check required vs optional parameters
   - Validate input data

### Debug Information

Enable verbose logging by checking the API service logs:

```bash
# Check API logs
tail -f api.log

# Test API connectivity
curl -v http://127.0.0.1:8000/v1/brc20/block_height
```

## API Versioning

The current API version is `v1`. Future versions will maintain backward compatibility or provide migration guides.

## Support

For API issues or questions:
- Check the server logs for error messages
- Verify database connectivity
- Ensure all required environment variables are set
- Report issues to the main repository 