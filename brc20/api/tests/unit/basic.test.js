describe('Basic Tests', () => {
  test('Environment variables are loaded', () => {
    expect(process.env.DB_HOST).toBeDefined();
    expect(process.env.DB_USER).toBeDefined();
    expect(process.env.DB_TYPE).toBeDefined();
    // Note: We don't test DB_PASSWD for security reasons
  });

  test('API configuration is valid', () => {
    expect(global.TEST_CONFIG).toBeDefined();
    expect(global.TEST_CONFIG.api).toBeDefined();
    expect(global.TEST_CONFIG.api.baseUrl).toBeDefined();
    expect(global.TEST_CONFIG.api.port).toBe(3003);
  });

  test('Database configuration is valid', () => {
    expect(global.TEST_CONFIG.db).toBeDefined();
    expect(global.TEST_CONFIG.db.host).toBeDefined();
    expect(global.TEST_CONFIG.db.database).toBe('opi_lc');
    expect(global.TEST_CONFIG.db.user).toBe('indexer');
  });
}); 