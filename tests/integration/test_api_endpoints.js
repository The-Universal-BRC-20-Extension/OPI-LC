const { TEST_CONFIG, testUtils } = require('../test_config');

describe('API Integration Tests', () => {
    let server;
    
    beforeAll(async () => {
        // Start the API server for testing
        const app = require('../../api.js');
        server = app.listen(TEST_CONFIG.api.port, TEST_CONFIG.api.host);
        
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    afterAll(async () => {
        if (server) {
            server.close();
        }
    });

    describe('Health Check Endpoints', () => {
        test('GET /v1/brc20/ip - Returns client IP', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`);
            expect(response.ok).toBe(true);
            const ip = await response.text();
            expect(ip).toBeDefined();
            expect(ip.length).toBeGreaterThan(0);
        });

        test('GET /v1/brc20/db_version - Returns database version', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/db_version`);
            expect(response.ok).toBe(true);
            const version = await response.text();
            expect(version).toBeDefined();
            expect(parseInt(version)).toBeGreaterThan(0);
        });

        test('GET /v1/brc20/event_hash_version - Returns event hash version', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/event_hash_version`);
            expect(response.ok).toBe(true);
            const version = await response.text();
            expect(version).toBeDefined();
            expect(parseInt(version)).toBeGreaterThan(0);
        });

        test('GET /v1/brc20/block_height - Returns current block height', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/block_height`);
            expect(response.ok).toBe(true);
            const height = await response.text();
            expect(height).toBeDefined();
            expect(parseInt(height)).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Balance Endpoints', () => {
        test('GET /v1/brc20/balance_on_block - Valid parameters', async () => {
            const params = new URLSearchParams({
                block_height: '800000',
                pkscript: '001234567890abcdef',
                ticker: 'TEST'
            });
            
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/balance_on_block?${params}`);
            // This might return 400 if no data exists, which is expected
            expect([200, 400]).toContain(response.status);
        });

        test('GET /v1/brc20/balance_on_block - Invalid block height', async () => {
            const params = new URLSearchParams({
                block_height: '999999999',
                pkscript: '001234567890abcdef',
                ticker: 'TEST'
            });
            
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/balance_on_block?${params}`);
            expect(response.status).toBe(400);
        });

        test('GET /v1/brc20/get_current_balance_of_wallet - Valid address', async () => {
            const params = new URLSearchParams({
                address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                ticker: 'TEST'
            });
            
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/get_current_balance_of_wallet?${params}`);
            // This might return 400 if no data exists, which is expected
            expect([200, 400]).toContain(response.status);
        });
    });

    describe('Activity Endpoints', () => {
        test('GET /v1/brc20/activity_on_block - Valid block height', async () => {
            const params = new URLSearchParams({
                block_height: '800000'
            });
            
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/activity_on_block?${params}`);
            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data).toHaveProperty('error');
            expect(data).toHaveProperty('result');
            expect(Array.isArray(data.result)).toBe(true);
        });

        test('GET /v1/brc20/activity_on_block - Invalid block height', async () => {
            const params = new URLSearchParams({
                block_height: '999999999'
            });
            
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/activity_on_block?${params}`);
            expect(response.status).toBe(400);
        });
    });

    describe('Error Handling', () => {
        test('Invalid endpoint returns 404', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/invalid`);
            expect(response.status).toBe(404);
        });

        test('Missing required parameters', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/balance_on_block`);
            expect(response.status).toBe(400);
        });
    });
}); 