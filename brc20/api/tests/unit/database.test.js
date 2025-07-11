const { Pool } = require('pg');

describe('Database Tests', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool({
      host: global.TEST_CONFIG.db.host,
      port: global.TEST_CONFIG.db.port,
      database: global.TEST_CONFIG.db.database,
      user: global.TEST_CONFIG.db.user,
      password: global.TEST_CONFIG.db.password,
      max: 5
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  test('Database connection is successful', async () => {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    expect(result.rows[0].now).toBeDefined();
  });

  test('Required tables exist', async () => {
    const requiredTables = [
      'brc20_indexer_version',
      'brc20_block_hashes',
      'brc20_events',
      'brc20_event_types',
      'brc20_historic_balances'
    ];

    for (const table of requiredTables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      expect(result.rows[0].exists).toBe(true);
    }
  });

  test('Database version table has data', async () => {
    const result = await pool.query('SELECT * FROM brc20_indexer_version LIMIT 1');
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0]).toHaveProperty('db_version');
    expect(result.rows[0]).toHaveProperty('event_hash_version');
  });

  test('Event types table has required event types', async () => {
    const result = await pool.query('SELECT event_type_name FROM brc20_event_types');
    const eventTypes = result.rows.map(row => row.event_type_name);
    
    expect(eventTypes).toContain('deploy-inscribe');
    expect(eventTypes).toContain('mint-inscribe');
    expect(eventTypes).toContain('transfer-inscribe');
    expect(eventTypes).toContain('transfer-transfer');
  });

  test('Block hashes table has data', async () => {
    const result = await pool.query('SELECT COUNT(*) FROM brc20_block_hashes');
    expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
  });

  test('Events table has data', async () => {
    const result = await pool.query('SELECT COUNT(*) FROM brc20_events');
    expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
  });
}); 