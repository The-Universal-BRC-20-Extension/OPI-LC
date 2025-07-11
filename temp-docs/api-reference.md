# OPI-LC API Reference

This document provides complete documentation for the OPI-LC BRC-20 API endpoints, including request/response formats, parameters, and usage examples.

## API Overview

The OPI-LC API provides REST endpoints for accessing BRC-20 indexed data. The API runs on port 8000 by default and supports both PostgreSQL and SQLite backends.

**Base URL**: `http://127.0.0.1:8000`

**API Version**: `v1`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

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

### 1. Health and Status Endpoints

#### Get Current Block Height

**Endpoint**: `GET /v1/brc20/block_height`

**Description**: Returns the current indexed block height.

**Response**: Plain text with block height number.

**Example Request:**
```bash
curl http://127.0.0.1:8000/v1/brc20/block_height
```

**Example Response:**
```
800123
```

#### Get Client IP Address

**Endpoint**: `GET /v1/brc20/ip`

**Description**: Returns the IP address of the requesting client.

**Response**: Plain text with IP address.

**Example Request:**
```bash
curl http://127.0.0.1:8000/v1/brc20/ip
```

**Example Response:**
```
192.168.1.100
```

#### Get Database Version

**Endpoint**: `GET /v1/brc20/db_version`

**Description**: Returns the database schema version.

**Response**: Plain text with version number.

**Example Request:**
```bash
curl http://127.0.0.1:8000/v1/brc20/db_version
```

**Example Response:**
```
5
```

#### Get Event Hash Version

**Endpoint**: `GET /v1/brc20/event_hash_version`

**Description**: Returns the event hash calculation version.

**Response**: Plain text with version number.

**Example Request:**
```bash
curl http://127.0.0.1:8000/v1/brc20/event_hash_version
```

**Example Response:**
```
2
```

### 2. Block Activity Endpoints

#### Get Activity on Block

**Endpoint**: `GET /v1/brc20/activity_on_block`

**Parameters**:
- `block_height` (required): Integer - The block height to query

**Description**: Returns all BRC-20 events that occurred in the specified block.

**Example Request:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/activity_on_block?block_height=800000"
```

**Example Response:**
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
      "event_type": "mint-inscribe",
      "inscription_id": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890i1",
      "minted_pkScript": "001234567890abcdef1234567890abcdef12345678",
      "tick": "ordi",
      "original_tick": "ordi",
      "amount": "1000",
      "parent_id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefi0"
    }
  ]
}
```

**Event Types**:
- `deploy-inscribe`: Token deployment event
- `mint-inscribe`: Token minting event
- `transfer-inscribe`: Token transfer inscription event
- `transfer-transfer`: Token transfer execution event

### 3. Balance Endpoints

#### Get Balance on Block

**Endpoint**: `GET /v1/brc20/balance_on_block`

**Parameters**:
- `block_height` (required): Integer - The block height to query
- `pkscript` (required): String - The public key script (hex format)
- `ticker` (required): String - The token ticker (case-insensitive)

**Description**: Returns the balance of a specific token for a wallet at the start of the specified block.

**Example Request:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/balance_on_block?block_height=800000&pkscript=001234567890abcdef1234567890abcdef12345678&ticker=ordi"
```

**Example Response:**
```json
{
  "error": null,
  "result": {
    "overall_balance": "5000",
    "available_balance": "3000"
  }
}
```

**Response Fields**:
- `overall_balance`: Total balance including reserved amounts
- `available_balance`: Available balance excluding reserved transfers

#### Get Current Balance of Wallet

**Endpoint**: `GET /v1/brc20/get_current_balance_of_wallet`

**Parameters**:
- `address` (optional): String - Bitcoin address
- `pkscript` (optional): String - Public key script (hex format)
- `ticker` (required): String - The token ticker (case-insensitive)

**Description**: Returns the current balance of a specific token for a wallet. Requires either `address` or `pkscript` parameter.

**Example Request:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_current_balance_of_wallet?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&ticker=ordi"
```

**Example Response:**
```json
{
  "error": null,
  "result": {
    "overall_balance": "5000",
    "available_balance": "3000"
  }
}
```

### 4. Hash Endpoints

#### Get Block Hash

**Endpoint**: `GET /v1/brc20/get_block_hash`

**Parameters**:
- `block_height` (required): Integer - The block height to query

**Description**: Returns the calculated hash for the specified block.

**Example Request:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_block_hash?block_height=800000"
```

**Example Response:**
```json
{
  "error": null,
  "result": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678"
}
```

#### Get Cumulative Hash

**Endpoint**: `GET /v1/brc20/get_cumulative_hash`

**Parameters**:
- `block_height` (required): Integer - The block height to query

**Description**: Returns the cumulative hash up to the specified block.

**Example Request:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_cumulative_hash?block_height=800000"
```

**Example Response:**
```json
{
  "error": null,
  "result": "f1e2d3c4b5a6789012345678901234567890abcdef1234567890abcdef12345678"
}
```

### 5. Extra Tables Endpoints (Optional)

These endpoints are only available if extra tables are enabled (`USE_EXTRA_TABLES=true`).

#### Get BRC-20 Holders

**Endpoint**: `GET /v1/brc20/get_brc20_holders`

**Parameters**:
- `ticker` (required): String - The token ticker (case-insensitive)
- `limit` (optional): Integer - Maximum number of results (default: 100)
- `offset` (optional): Integer - Number of results to skip (default: 0)

**Description**: Returns a list of wallets holding the specified token, sorted by balance.

**Example Request:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_brc20_holders?ticker=ordi&limit=10&offset=0"
```

**Example Response:**
```json
{
  "error": null,
  "result": [
    {
      "pkscript": "001234567890abcdef1234567890abcdef12345678",
      "overall_balance": "10000",
      "available_balance": "8000"
    },
    {
      "pkscript": "00abcdef1234567890abcdef1234567890abcdef12",
      "overall_balance": "5000",
      "available_balance": "3000"
    }
  ]
}
```

#### Get Unused Transfer Inscriptions of Ticker

**Endpoint**: `GET /v1/brc20/get_unused_tx_inscrs_of_ticker`

**Parameters**:
- `ticker` (required): String - The token ticker (case-insensitive)
- `limit` (optional): Integer - Maximum number of results (default: 100)
- `offset` (optional): Integer - Number of results to skip (default: 0)

**Description**: Returns unused transfer inscriptions for the specified token.

**Example Request:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_unused_tx_inscrs_of_ticker?ticker=ordi&limit=10"
```

**Example Response:**
```json
{
  "error": null,
  "result": [
    {
      "inscription_id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefi0",
      "pkscript": "001234567890abcdef1234567890abcdef12345678",
      "amount": "1000"
    }
  ]
}
```

#### Get Unused Transfer Inscriptions of Wallet

**Endpoint**: `GET /v1/brc20/get_unused_tx_inscrs_of_wallet`

**Parameters**:
- `address` (optional): String - Bitcoin address
- `pkscript` (optional): String - Public key script (hex format)
- `ticker` (optional): String - The token ticker (case-insensitive)
- `limit` (optional): Integer - Maximum number of results (default: 100)
- `offset` (optional): Integer - Number of results to skip (default: 0)

**Description**: Returns unused transfer inscriptions for a specific wallet and optionally a specific token.

**Example Request:**
```bash
curl "http://127.0.0.1:8000/v1/brc20/get_unused_tx_inscrs_of_wallet?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&ticker=ordi"
```

**Example Response:**
```json
{
  "error": null,
  "result": [
    {
      "inscription_id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefi0",
      "tick": "ordi",
      "amount": "1000"
    }
  ]
}
```

## Error Codes and Messages

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

**Invalid Parameters:**
```json
{
  "error": "invalid parameter: block_height must be a positive integer",
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

### 1. JavaScript/Node.js

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

### 2. Python

```python
import requests

# Get block activity
response = requests.get('http://127.0.0.1:8000/v1/brc20/activity_on_block', 
                       params={'block_height': 800000})
data = response.json()
if data['error'] is None:
    for event in data['result']:
        print(f"Event: {event['event_type']} - {event['inscription_id']}")
```

### 3. cURL

```bash
# Get all events for a block
curl "http://127.0.0.1:8000/v1/brc20/activity_on_block?block_height=800000" | jq

# Get balance for multiple wallets
for address in "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" "bc1qdefghijklmnopqrstuvwxyz1234567890"; do
    curl "http://127.0.0.1:8000/v1/brc20/get_current_balance_of_wallet?address=$address&ticker=ordi"
done
```

## Performance Tips

### 1. Efficient Queries

- Use specific block heights rather than querying all blocks
- Cache frequently accessed data (balances, block hashes)
- Use pagination for large result sets

### 2. Batch Operations

- Query multiple endpoints in parallel
- Use connection pooling for high-traffic applications
- Implement client-side caching

### 3. Monitoring

- Monitor API response times
- Track error rates
- Monitor database query performance

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
tail -f /var/log/opi-api.log

# Test API connectivity
curl -v http://127.0.0.1:8000/v1/brc20/block_height
```

## API Versioning

The current API version is `v1`. Future versions will maintain backward compatibility or provide migration guides.

## Support

For API issues or questions:
- Check the [Monitoring Guide](monitoring-guide.md) for troubleshooting
- Review the [Configuration Reference](configuration-reference.md) for settings
- Report issues to the main repository 