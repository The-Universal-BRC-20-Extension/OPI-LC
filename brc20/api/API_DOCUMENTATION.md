# BRC-20 API Documentation

## Base URL
```
http://127.0.0.1:8000/v1/brc20
```

## Authentication
No authentication required.

## Response Format
All endpoints return JSON responses with the following structure:
```json
{
  "error": null | "error message",
  "result": data | null
}
```

---

## Endpoints

### 1. Get Client IP Address
**GET** `/v1/brc20/ip`

**Response:**
```json
"127.0.0.1"
```

---

### 2. Get Database Version
**GET** `/v1/brc20/db_version`

**Response:**
```json
"5"
```

---

### 3. Get Event Hash Version
**GET** `/v1/brc20/event_hash_version`

**Response:**
```json
"2"
```

---

### 4. Get Current Block Height
**GET** `/v1/brc20/block_height`

**Response:**
```json
"905054"
```

---

### 5. Get Balance on Block
**GET** `/v1/brc20/balance_on_block`

**Query Parameters:**
- `block_height` (required): Integer - The block height to check balance at
- `pkscript` (required): String - The pkscript to get balance for
- `ticker` (required): String - The BRC-20 ticker symbol (case-insensitive)

**Example Request:**
```
GET /v1/brc20/balance_on_block?block_height=900000&pkscript=001234567890abcdef&ticker=ordi
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "overall_balance": "1000000000000000000",
    "available_balance": "500000000000000000"
  }
}
```

**Error Response:**
```json
{
  "error": "no balance found",
  "result": null
}
```

---

### 6. Get Activity on Block
**GET** `/v1/brc20/activity_on_block`

**Query Parameters:**
- `block_height` (required): Integer - The block height to get activity for

**Example Request:**
```
GET /v1/brc20/activity_on_block?block_height=900000
```

**Success Response:**
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
      "original_tick": "ordi",
      "amount": "1000000000000000000",
      "using_tx_id": "def456..."
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "block not indexed yet",
  "result": null
}
```

---

### 7. Get Event by Spending Transaction ID
**GET** `/v1/brc20/event/by-spending-tx/:txid`

**Path Parameters:**
- `txid` (required): String - The spending transaction ID

**Example Request:**
```
GET /v1/brc20/event/by-spending-tx/abc123def456...
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "id": 12345,
    "event_type": 3,
    "block_height": 900000,
    "inscription_id": "abc123...i0",
    "event": {
      "source_pkScript": "001234567890abcdef",
      "spent_pkScript": "00fedcba0987654321",
      "tick": "ordi",
      "original_tick": "ordi",
      "amount": "1000000000000000000",
      "using_tx_id": "def456..."
    }
  }
}
```

**Error Response:**
```json
{
  "error": "Event not found for the given spending transaction ID",
  "result": null
}
```

---

### 8. Get Current Balance of Wallet
**GET** `/v1/brc20/get_current_balance_of_wallet`

**Query Parameters:**
- `ticker` (required): String - The BRC-20 ticker symbol (case-insensitive)
- `address` (optional): String - Wallet address (use either address OR pkscript)
- `pkscript` (optional): String - Pkscript (use either address OR pkscript)

**Example Request:**
```
GET /v1/brc20/get_current_balance_of_wallet?ticker=ordi&pkscript=001234567890abcdef
```

**Success Response:**
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

**Error Response:**
```json
{
  "error": "no balance found",
  "result": null
}
```

---

### 9. Get Valid Transaction Notes of Wallet
**GET** `/v1/brc20/get_valid_tx_notes_of_wallet`

**Query Parameters:**
- `address` (optional): String - Wallet address (use either address OR pkscript)
- `pkscript` (optional): String - Pkscript (use either address OR pkscript)

**Example Request:**
```
GET /v1/brc20/get_valid_tx_notes_of_wallet?pkscript=001234567890abcdef
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "unused_txes": [
      {
        "tick": "ordi",
        "inscription_id": "abc123...i0",
        "amount": "1000000000000000000",
        "genesis_height": 900000
      }
    ],
    "block_height": 905054
  }
}
```

**Error Response:**
```json
{
  "error": "not supported",
  "result": null
}
```

---

### 10. Get Valid Transaction Notes of Ticker
**GET** `/v1/brc20/get_valid_tx_notes_of_ticker`

**Query Parameters:**
- `ticker` (required): String - The BRC-20 ticker symbol (case-insensitive)

**Example Request:**
```
GET /v1/brc20/get_valid_tx_notes_of_ticker?ticker=ordi
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "unused_txes": [
      {
        "current_holder_pkscript": "001234567890abcdef",
        "current_holder_wallet": "bc1q...",
        "inscription_id": "abc123...i0",
        "amount": "1000000000000000000",
        "genesis_height": 900000
      }
    ],
    "block_height": 905054
  }
}
```

**Error Response:**
```json
{
  "error": "no unused tx found",
  "result": null
}
```

---

### 11. Get Holders
**GET** `/v1/brc20/holders`

**Query Parameters:**
- `ticker` (required): String - The BRC-20 ticker symbol (case-insensitive)

**Example Request:**
```
GET /v1/brc20/holders?ticker=ordi
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "unused_txes": [
      {
        "pkscript": "001234567890abcdef",
        "wallet": "bc1q...",
        "overall_balance": "1000000000000000000",
        "available_balance": "500000000000000000"
      }
    ],
    "block_height": 905054
  }
}
```

**Error Response:**
```json
{
  "error": "no unused tx found",
  "result": null
}
```

---

### 12. Get Hash of All Activity
**GET** `/v1/brc20/get_hash_of_all_activity`

**Query Parameters:**
- `block_height` (required): Integer - The block height to get hash for

**Example Request:**
```
GET /v1/brc20/get_hash_of_all_activity?block_height=900000
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "cumulative_event_hash": "abc123...",
    "block_event_hash": "def456...",
    "indexer_version": "opi-brc20-light-client v0.3.1",
    "block_height": 900000
  }
}
```

**Error Response:**
```json
{
  "error": "block not indexed yet",
  "result": null
}
```

---

### 13. Get Hash of All Current Balances
**GET** `/v1/brc20/get_hash_of_all_current_balances`

**Example Request:**
```
GET /v1/brc20/get_hash_of_all_current_balances
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "current_balances_hash": "abc123...",
    "indexer_version": "opi-brc20-light-client v0.3.1",
    "block_height": 905054
  }
}
```

---

### 14. Lookup Spending Transaction
**GET** `/v1/brc20/lookup_spending_tx`

**Query Parameters:**
- `block_height` (required): Integer - The block height to search in
- `prev_txid` (required): String - The previous transaction ID
- `prev_vout` (required): Integer - The previous output index

**Example Request:**
```
GET /v1/brc20/lookup_spending_tx?block_height=900000&prev_txid=abc123...&prev_vout=0
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "spending_txid": "def456..."
  }
}
```

**Error Response:**
```json
{
  "error": "Spending transaction not found",
  "result": null
}
```

---

### 15. Get Ticker Information
**GET** `/v1/brc20/ticker/:tick`

**Path Parameters:**
- `tick` (required): String - The BRC-20 ticker symbol (case-insensitive)

**Example Request:**
```
GET /v1/brc20/ticker/ordi
```

**Success Response:**
```json
{
  "error": null,
  "result": {
    "tick": "ordi",
    "original_tick": "ordi",
    "max_supply": "21000000000000000000000000",
    "decimals": 18,
    "limit_per_mint": "1000000000000000000000",
    "remaining_supply": "21000000000000000000000000",
    "burned_supply": "0",
    "is_self_mint": false,
    "deploy_inscription_id": "abc123...i0",
    "block_height": 779832,
    "current_block_height": 905054
  }
}
```

**Error Response (Ticker Not Found):**
```json
{
  "error": "Ticker not found",
  "message": "Ticker 'TEST' is not deployed or does not exist",
  "result": null
}
```

**Error Response (Invalid Parameter):**
```json
{
  "error": "Missing or invalid ticker parameter",
  "result": null
}
```

---

## Error Codes

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Messages
- `"Missing required parameter: [parameter_name]"`
- `"Invalid [parameter_name] parameter"`
- `"Missing or invalid ticker parameter"`
- `"Ticker not found"`
- `"block not indexed yet"`
- `"no balance found"`
- `"no unused tx found"`
- `"not supported"`
- `"internal error"`

---

## Integration Notes

### Environment Variables
The API server uses the following environment variables:
- `API_PORT` (default: 8000)
- `API_HOST` (default: 127.0.0.1)
- `DB_TYPE` (psql or sqlite)
- `USE_EXTRA_TABLES` (true/false)

### Rate Limiting
No rate limiting is implemented in the current version.

### CORS
CORS is enabled for all origins (`*`).

### SSL/TLS
For PostgreSQL connections, SSL can be enabled via `DB_SSL=true` environment variable.

---

## Example Integration (JavaScript)

```javascript
// Get current block height
const response = await fetch('http://127.0.0.1:8000/v1/brc20/block_height');
const blockHeight = await response.text();

// Get balance for a specific ticker
const balanceResponse = await fetch(
  `http://127.0.0.1:8000/v1/brc20/get_current_balance_of_wallet?ticker=ordi&pkscript=001234567890abcdef`
);
const balanceData = await balanceResponse.json();

if (balanceData.error) {
  console.error('Error:', balanceData.error);
} else {
  console.log('Balance:', balanceData.result);
}
``` 