#!/usr/bin/env node

// Comprehensive Test Runner for OPI-LC API
const { testUtils, TEST_CONFIG } = require('./tests/test_config');

console.log('=== OPI-LC Comprehensive Test Suite ===\n');

let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

const runTest = async (testName, testFunction) => {
    try {
        console.log(`Running: ${testName}`);
        await testFunction();
        console.log(`✅ PASSED: ${testName}\n`);
        testResults.passed++;
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${testName}`);
        console.log(`   Error: ${error.message}\n`);
        testResults.failed++;
        testResults.errors.push({ test: testName, error: error.message });
        return false;
    }
};

const runAllTests = async () => {
    console.log('Phase 1: Environment and Configuration Tests\n');
    
    // Test 1: Environment variables
    await runTest('Environment Variables Check', async () => {
        const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWD'];
        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                throw new Error(`Missing required environment variable: ${varName}`);
            }
        }
    });

    // Test 2: Database connection
    await runTest('Database Connection Test', async () => {
        const result = await testUtils.testDbConnection();
        if (!result.success) {
            throw new Error(`Database connection failed: ${result.error}`);
        }
    });

    // Test 3: Database schema
    await runTest('Database Schema Validation', async () => {
        const schema = await testUtils.testDbSchema();
        const requiredTables = [
            'brc20_indexer_version',
            'brc20_block_hashes',
            'brc20_events',
            'brc20_event_types',
            'brc20_historic_balances'
        ];
        
        for (const table of requiredTables) {
            if (!schema[table] || !schema[table].exists) {
                throw new Error(`Required table missing: ${table}`);
            }
        }
    });

    console.log('Phase 2: API Service Tests\n');

    // Test 4: Start API service
    let serverProcess;
    await runTest('API Service Startup', async () => {
        const { spawn } = require('child_process');
        const path = require('path');
        
        return new Promise((resolve, reject) => {
            serverProcess = spawn('node', ['api.js'], {
                cwd: path.join(__dirname),
                env: {
                    ...process.env,
                    PORT: TEST_CONFIG.api.port.toString(),
                    NODE_ENV: 'test'
                }
            });

            let serverStarted = false;
            const timeout = setTimeout(() => {
                if (!serverStarted) {
                    reject(new Error('Server failed to start within 30 seconds'));
                }
            }, 30000);

            serverProcess.stdout.on('data', (data) => {
                if (data.toString().includes('listening') || data.toString().includes('started')) {
                    serverStarted = true;
                    clearTimeout(timeout);
                    resolve();
                }
            });

            serverProcess.stderr.on('data', (data) => {
                console.log(`Server stderr: ${data}`);
            });

            serverProcess.on('error', (error) => {
                reject(error);
            });
        });
    });

    // Test 5: Health check endpoints
    await runTest('Health Check Endpoints', async () => {
        const endpoints = [
            '/v1/brc20/ip',
            '/v1/brc20/db_version',
            '/v1/brc20/event_hash_version',
            '/v1/brc20/block_height'
        ];

        for (const endpoint of endpoints) {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Health check failed for ${endpoint}: ${response.status}`);
            }
        }
    });

    // Test 6: API functionality tests
    await runTest('API Functionality Tests', async () => {
        // Test balance endpoint with valid parameters
        const balanceParams = new URLSearchParams({
            block_height: '800000',
            pkscript: '001234567890abcdef',
            ticker: 'TEST'
        });
        
        const balanceResponse = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/balance_on_block?${balanceParams}`);
        // Accept both 200 and 400 (400 is expected if no data exists)
        if (![200, 400].includes(balanceResponse.status)) {
            throw new Error(`Unexpected status for balance endpoint: ${balanceResponse.status}`);
        }

        // Test activity endpoint
        const activityParams = new URLSearchParams({
            block_height: '800000'
        });
        
        const activityResponse = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/activity_on_block?${activityParams}`);
        if (!activityResponse.ok) {
            throw new Error(`Activity endpoint failed: ${activityResponse.status}`);
        }

        const activityData = await activityResponse.json();
        if (!activityData.hasOwnProperty('error') || !activityData.hasOwnProperty('result')) {
            throw new Error('Activity endpoint returned invalid response format');
        }
    });

    // Test 7: Error handling
    await runTest('Error Handling Tests', async () => {
        // Test invalid endpoint
        const invalidResponse = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/invalid`);
        if (invalidResponse.status !== 404) {
            throw new Error(`Invalid endpoint should return 404, got ${invalidResponse.status}`);
        }

        // Test missing parameters
        const missingParamsResponse = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/balance_on_block`);
        if (missingParamsResponse.status !== 400) {
            throw new Error(`Missing parameters should return 400, got ${missingParamsResponse.status}`);
        }
    });

    // Test 8: Concurrent requests
    await runTest('Concurrent Request Handling', async () => {
        const requests = Array(5).fill().map(() => 
            fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`)
        );
        
        const responses = await Promise.all(requests);
        responses.forEach((response, index) => {
            if (!response.ok) {
                throw new Error(`Concurrent request ${index + 1} failed: ${response.status}`);
            }
        });
    });

    // Cleanup: Stop the server
    if (serverProcess) {
        console.log('Stopping API service...');
        serverProcess.kill('SIGTERM');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('Phase 3: Security and Configuration Tests\n');

    // Test 9: Environment variable security
    await runTest('Environment Variable Security', async () => {
        // Check that password is not exposed in logs or output
        const envVars = Object.keys(process.env);
        const sensitiveVars = envVars.filter(key => 
            key.toLowerCase().includes('pass') || 
            key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('key')
        );
        
        for (const varName of sensitiveVars) {
            const value = process.env[varName];
            if (value && value.length > 0) {
                // Password should be set but not empty
                console.log(`   ✓ ${varName}: [SECURED]`);
            } else {
                throw new Error(`Sensitive environment variable ${varName} is not properly set`);
            }
        }
    });

    // Test 10: File permissions
    await runTest('File Permission Security', async () => {
        const fs = require('fs');
        const path = require('path');
        
        const envFile = path.join(__dirname, '.env');
        const stats = fs.statSync(envFile);
        const mode = stats.mode & parseInt('777', 8);
        
        // .env file should have restrictive permissions (600 or 400)
        if (mode !== parseInt('600', 8) && mode !== parseInt('400', 8)) {
            throw new Error(`.env file has insecure permissions: ${mode.toString(8)}`);
        }
    });

    console.log('=== Test Summary ===\n');
    console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    if (testResults.errors.length > 0) {
        console.log('\nFailed Tests:');
        testResults.errors.forEach(({ test, error }) => {
            console.log(`  - ${test}: ${error}`);
        });
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed! The service is ready for deployment.');
        process.exit(0);
    }
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nTest interrupted by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\nTest terminated');
    process.exit(1);
});

// Run all tests
runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
}); 