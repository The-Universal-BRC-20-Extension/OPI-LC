// Test setup file
require('dotenv').config();

// Global test configuration
global.TEST_CONFIG = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:3003',
    port: parseInt(process.env.API_PORT || '3003')
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'opi_lc',
    user: process.env.DB_USER || 'indexer',
    password: process.env.DB_PASSWD
  }
};

// Increase timeout for database operations
jest.setTimeout(30000); 