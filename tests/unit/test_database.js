const { testDbPool, testUtils } = require('../test_config');

describe('Database Tests', () => {
    test('Database Connection', async () => {
        const result = await testUtils.testDbConnection();
        expect(result.success).toBe(true);
        expect(result.timestamp).toBeDefined();
    });

    test('Database Schema Validation', async () => {
        const schema = await testUtils.testDbSchema();
        
        // Check that all required tables exist
        const requiredTables = [
            'brc20_indexer_version',
            'brc20_block_hashes',
            'brc20_events',
            'brc20_event_types',
            'brc20_historic_balances'
        ];
        
        for (const table of requiredTables) {
            expect(schema[table]).toBeDefined();
            expect(schema[table].exists).toBe(true);
        }
    });

    test('Database Version Table', async () => {
        const result = await testDbPool.query('SELECT * FROM brc20_indexer_version LIMIT 1');
        expect(result.rows.length).toBeGreaterThan(0);
        expect(result.rows[0]).toHaveProperty('db_version');
        expect(result.rows[0]).toHaveProperty('event_hash_version');
    });

    test('Event Types Table', async () => {
        const result = await testDbPool.query('SELECT * FROM brc20_event_types');
        expect(result.rows.length).toBeGreaterThan(0);
        
        // Check for required event types
        const eventTypes = result.rows.map(row => row.event_type_name);
        expect(eventTypes).toContain('deploy');
        expect(eventTypes).toContain('mint');
        expect(eventTypes).toContain('transfer');
    });

    afterAll(async () => {
        await testDbPool.end();
    });
}); 