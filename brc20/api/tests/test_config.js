// Test configuration for OPI-LC API
require('dotenv').config();
const { Pool } = require('pg');

// Test configuration
const TEST_CONFIG = {
    // Database configuration
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'opi_lc',
        user: process.env.DB_USER || 'indexer',
        password: process.env.DB_PASSWD,
        max: 5
    },
    
    // API configuration
    api: {
        host: process.env.API_HOST || '127.0.0.1',
        port: parseInt(process.env.API_PORT || '3003'),
        baseUrl: `http://${process.env.API_HOST || '127.0.0.1'}:${process.env.API_PORT || '3003'}`
    },
    
    // Test timeouts
    timeouts: {
        connection: 5000,
        request: 10000,
        startup: 30000
    }
};

// Create test database pool
const testDbPool = new Pool(TEST_CONFIG.db);

// Test utilities
const testUtils = {
    // Test database connection
    async testDbConnection() {
        try {
            const client = await testDbPool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            return { success: true, timestamp: result.rows[0].now };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Test API health check
    async testApiHealth() {
        try {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`);
            return { success: response.ok, status: response.status };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Test database schema
    async testDbSchema() {
        try {
            const requiredTables = [
                'brc20_indexer_version',
                'brc20_block_hashes',
                'brc20_events',
                'brc20_event_types',
                'brc20_historic_balances'
            ];
            
            const results = {};
            for (const table of requiredTables) {
                try {
                    const result = await testDbPool.query(`SELECT COUNT(*) FROM ${table}`);
                    results[table] = { exists: true, count: parseInt(result.rows[0].count) };
                } catch (error) {
                    results[table] = { exists: false, error: error.message };
                }
            }
            return results;
        } catch (error) {
            return { error: error.message };
        }
    }
};

module.exports = {
    TEST_CONFIG,
    testDbPool,
    testUtils
}; 