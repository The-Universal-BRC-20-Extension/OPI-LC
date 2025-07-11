const fetch = require('node-fetch');

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3003';

describe('OPI-LC API Functional Tests', () => {
  test('Handles concurrent requests', async () => {
    const requests = Array(10).fill().map(() =>
      fetch(`${BASE_URL}/v1/brc20/ip`)
    );
    const responses = await Promise.all(requests);
    responses.forEach(res => expect(res.status).toBe(200));
  });

  test('Returns 400 for missing required parameters', async () => {
    const res = await fetch(`${BASE_URL}/v1/brc20/balance_on_block`);
    expect(res.status).toBe(400);
  });
});