const fetch = require('node-fetch');

describe('OPI-LC API Integration Tests', () => {
  const BASE_URL = global.TEST_CONFIG.api.baseUrl;

  describe('Health Check Endpoints', () => {
    test('GET /v1/brc20/ip returns client IP', async () => {
      const response = await fetch(`${BASE_URL}/v1/brc20/ip`);
      expect(response.status).toBe(200);
      const ip = await response.text();
      expect(ip).toBeDefined();
      expect(ip.length).toBeGreaterThan(0);
    });

    test('GET /v1/brc20/db_version returns database version', async () => {
      const response = await fetch(`${BASE_URL}/v1/brc20/db_version`);
      expect(response.status).toBe(200);
      const version = await response.text();
      expect(version).toBeDefined();
      expect(parseInt(version)).toBeGreaterThan(0);
    });

    test('GET /v1/brc20/event_hash_version returns event hash version', async () => {
      const response = await fetch(`${BASE_URL}/v1/brc20/event_hash_version`);
      expect(response.status).toBe(200);
      const version = await response.text();
      expect(version).toBeDefined();
      expect(parseInt(version)).toBeGreaterThan(0);
    });

    test('GET /v1/brc20/block_height returns current block height', async () => {
      const response = await fetch(`${BASE_URL}/v1/brc20/block_height`);
      expect(response.status).toBe(200);
      const height = await response.text();
      expect(height).toBeDefined();
      expect(parseInt(height)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Balance Endpoints', () => {
    test('GET /v1/brc20/balance_on_block with valid parameters', async () => {
      const params = new URLSearchParams({
        block_height: '800000',
        pkscript: '001234567890abcdef',
        ticker: 'TEST'
      });
      
      const response = await fetch(`${BASE_URL}/v1/brc20/balance_on_block?${params}`);
      // Accept both 200 and 400 (400 is expected if no data exists)
      expect([200, 400]).toContain(response.status);
    });

    test('GET /v1/brc20/balance_on_block with invalid block height', async () => {
      const params = new URLSearchParams({
        block_height: '999999999',
        pkscript: '001234567890abcdef',
        ticker: 'TEST'
      });
      
      const response = await fetch(`${BASE_URL}/v1/brc20/balance_on_block?${params}`);
      expect(response.status).toBe(400);
    });

    test('GET /v1/brc20/get_current_balance_of_wallet with valid address', async () => {
      const params = new URLSearchParams({
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ticker: 'TEST'
      });
      
      const response = await fetch(`${BASE_URL}/v1/brc20/get_current_balance_of_wallet?${params}`);
      // Accept both 200 and 400 (400 is expected if no data exists)
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Activity Endpoints', () => {
    test('GET /v1/brc20/activity_on_block with valid block height', async () => {
      const params = new URLSearchParams({
        block_height: '800000'
      });
      
      const response = await fetch(`${BASE_URL}/v1/brc20/activity_on_block?${params}`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('result');
      expect(Array.isArray(data.result)).toBe(true);
    });

    test('GET /v1/brc20/activity_on_block with invalid block height', async () => {
      const params = new URLSearchParams({
        block_height: '999999999'
      });
      
      const response = await fetch(`${BASE_URL}/v1/brc20/activity_on_block?${params}`);
      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    test('Invalid endpoint returns 404', async () => {
      const response = await fetch(`${BASE_URL}/v1/brc20/invalid`);
      expect(response.status).toBe(404);
    });

    test('Missing required parameters returns 400', async () => {
      const response = await fetch(`${BASE_URL}/v1/brc20/balance_on_block`);
      expect(response.status).toBe(400);
    });

    test('Invalid parameter types handled gracefully', async () => {
      const params = new URLSearchParams({
        block_height: 'invalid',
        pkscript: '001234567890abcdef',
        ticker: 'TEST'
      });
      
      const response = await fetch(`${BASE_URL}/v1/brc20/balance_on_block?${params}`);
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Performance Tests', () => {
    test('Handles concurrent requests', async () => {
      const requests = Array(5).fill().map(() => 
        fetch(`${BASE_URL}/v1/brc20/ip`)
      );
      
      const responses = await Promise.all(requests);
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
      });
    });

    test('Response time is reasonable', async () => {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/v1/brc20/ip`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });
  });
});