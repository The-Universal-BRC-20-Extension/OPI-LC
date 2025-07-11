#!/usr/bin/env node

// Comprehensive Deployment Verification for OPI-LC API
const { testUtils, TEST_CONFIG } = require('./tests/test_config');
const fs = require('fs');
const path = require('path');

console.log('🔍 OPI-LC Deployment Verification Suite');
console.log('========================================\n');

let verificationResults = {
    phase1: { passed: 0, failed: 0, errors: [] },
    phase2: { passed: 0, failed: 0, errors: [] },
    phase3: { passed: 0, failed: 0, errors: [] },
    total: { passed: 0, failed: 0 }
};

const runVerification = async (phase, testName, testFunction) => {
    try {
        console.log(`Running: ${testName}`);
        await testFunction();
        console.log(`✅ PASSED: ${testName}\n`);
        verificationResults[phase].passed++;
        verificationResults.total.passed++;
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${testName}`);
        console.log(`   Error: ${error.message}\n`);
        verificationResults[phase].failed++;
        verificationResults.total.failed++;
        verificationResults[phase].errors.push({ test: testName, error: error.message });
        return false;
    }
};

const verifyPhase1 = async () => {
    console.log('📋 Phase 1: Environment and Infrastructure Verification\n');
    
    // 1.1 Environment Variables
    await runVerification('phase1', 'Environment Variables Check', async () => {
        const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWD'];
        const missingVars = [];
        
        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                missingVars.push(varName);
            }
        }
        
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
        
        console.log('   ✓ All required environment variables are set');
    });

    // 1.2 Database Connection
    await runVerification('phase1', 'Database Connection Test', async () => {
        const result = await testUtils.testDbConnection();
        if (!result.success) {
            throw new Error(`Database connection failed: ${result.error}`);
        }
        console.log(`   ✓ Database connected successfully at ${result.timestamp}`);
    });

    // 1.3 Database Schema
    await runVerification('phase1', 'Database Schema Validation', async () => {
        const schema = await testUtils.testDbSchema();
        const requiredTables = [
            'brc20_indexer_version',
            'brc20_block_hashes',
            'brc20_events',
            'brc20_event_types',
            'brc20_historic_balances'
        ];
        
        const missingTables = [];
        for (const table of requiredTables) {
            if (!schema[table] || !schema[table].exists) {
                missingTables.push(table);
            }
        }
        
        if (missingTables.length > 0) {
            throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
        }
        
        console.log('   ✓ All required database tables exist');
    });

    // 1.4 File Permissions
    await runVerification('phase1', 'Security File Permissions', async () => {
        const envFile = path.join(__dirname, '.env');
        if (!fs.existsSync(envFile)) {
            throw new Error('.env file does not exist');
        }
        
        const stats = fs.statSync(envFile);
        const mode = stats.mode & parseInt('777', 8);
        
        if (mode !== parseInt('600', 8) && mode !== parseInt('400', 8)) {
            throw new Error(`.env file has insecure permissions: ${mode.toString(8)}`);
        }
        
        console.log('   ✓ .env file has secure permissions');
    });

    // 1.5 Dependencies
    await runVerification('phase1', 'Node.js Dependencies', async () => {
        const packageJson = path.join(__dirname, 'package.json');
        if (!fs.existsSync(packageJson)) {
            throw new Error('package.json not found');
        }
        
        const nodeModules = path.join(__dirname, 'node_modules');
        if (!fs.existsSync(nodeModules)) {
            throw new Error('node_modules directory not found - run npm install');
        }
        
        console.log('   ✓ Node.js dependencies are installed');
    });
};

const verifyPhase2 = async () => {
    console.log('🚀 Phase 2: API Service Verification\n');
    
    let serverProcess;
    
    // 2.1 Service Startup
    await runVerification('phase2', 'API Service Startup', async () => {
        const { spawn } = require('child_process');
        
        return new Promise((resolve, reject) => {
            serverProcess = spawn('node', ['api.js'], {
                cwd: __dirname,
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
                console.log(`   Server stderr: ${data}`);
            });

            serverProcess.on('error', (error) => {
                reject(error);
            });
        });
    });

    // 2.2 Health Check Endpoints
    await runVerification('phase2', 'Health Check Endpoints', async () => {
        const endpoints = [
            { path: '/v1/brc20/ip', name: 'IP Endpoint' },
            { path: '/v1/brc20/db_version', name: 'Database Version' },
            { path: '/v1/brc20/event_hash_version', name: 'Event Hash Version' },
            { path: '/v1/brc20/block_height', name: 'Block Height' }
        ];

        for (const endpoint of endpoints) {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}${endpoint.path}`);
            if (!response.ok) {
                throw new Error(`${endpoint.name} failed: ${response.status}`);
            }
            console.log(`   ✓ ${endpoint.name} responding`);
        }
    });

    // 2.3 API Functionality
    await runVerification('phase2', 'API Functionality Tests', async () => {
        // Test balance endpoint
        const balanceParams = new URLSearchParams({
            block_height: '800000',
            pkscript: '001234567890abcdef',
            ticker: 'TEST'
        });
        
        const balanceResponse = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/balance_on_block?${balanceParams}`);
        if (![200, 400].includes(balanceResponse.status)) {
            throw new Error(`Balance endpoint returned unexpected status: ${balanceResponse.status}`);
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

        console.log('   ✓ Balance and activity endpoints working');
    });

    // 2.4 Error Handling
    await runVerification('phase2', 'Error Handling Tests', async () => {
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

        console.log('   ✓ Error handling working correctly');
    });

    // 2.5 Load Testing
    await runVerification('phase2', 'Concurrent Request Handling', async () => {
        const requests = Array(10).fill().map(() => 
            fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`)
        );
        
        const responses = await Promise.all(requests);
        responses.forEach((response, index) => {
            if (!response.ok) {
                throw new Error(`Concurrent request ${index + 1} failed: ${response.status}`);
            }
        });

        console.log('   ✓ Handled 10 concurrent requests successfully');
    });

    // Cleanup
    if (serverProcess) {
        console.log('   Stopping API service...');
        serverProcess.kill('SIGTERM');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
};

const verifyPhase3 = async () => {
    console.log('🔒 Phase 3: Security and Production Readiness\n');
    
    // 3.1 Environment Variable Security
    await runVerification('phase3', 'Environment Variable Security', async () => {
        const envVars = Object.keys(process.env);
        const sensitiveVars = envVars.filter(key => 
            key.toLowerCase().includes('pass') || 
            key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('key')
        );
        
        for (const varName of sensitiveVars) {
            const value = process.env[varName];
            if (!value || value.length === 0) {
                throw new Error(`Sensitive environment variable ${varName} is not properly set`);
            }
        }
        
        console.log(`   ✓ ${sensitiveVars.length} sensitive environment variables secured`);
    });

    // 3.2 Port Configuration
    await runVerification('phase3', 'Port Configuration', async () => {
        const expectedPort = TEST_CONFIG.api.port;
        if (expectedPort !== 3003) {
            throw new Error(`Expected port 3003, got ${expectedPort}`);
        }
        
        console.log(`   ✓ API configured for port ${expectedPort}`);
    });

    // 3.3 Database Configuration
    await runVerification('phase3', 'Database Configuration', async () => {
        const dbConfig = TEST_CONFIG.db;
        
        if (dbConfig.database !== 'opi_lc') {
            throw new Error(`Expected database 'opi_lc', got '${dbConfig.database}'`);
        }
        
        if (dbConfig.user !== 'indexer') {
            throw new Error(`Expected user 'indexer', got '${dbConfig.user}'`);
        }
        
        console.log('   ✓ Database configuration matches requirements');
    });

    // 3.4 Service Readiness
    await runVerification('phase3', 'Service Readiness Check', async () => {
        // Check if all required files exist
        const requiredFiles = [
            'api.js',
            'package.json',
            '.env',
            'tests/test_config.js'
        ];
        
        const missingFiles = [];
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                missingFiles.push(file);
            }
        }
        
        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }
        
        console.log('   ✓ All required service files present');
    });
};

const generateReport = () => {
    console.log('\n📊 Verification Report');
    console.log('=====================\n');
    
    const phases = ['phase1', 'phase2', 'phase3'];
    const phaseNames = ['Environment & Infrastructure', 'API Service', 'Security & Production'];
    
    phases.forEach((phase, index) => {
        const results = verificationResults[phase];
        console.log(`${phaseNames[index]}:`);
        console.log(`  Passed: ${results.passed}`);
        console.log(`  Failed: ${results.failed}`);
        
        if (results.errors.length > 0) {
            console.log('  Errors:');
            results.errors.forEach(({ test, error }) => {
                console.log(`    - ${test}: ${error}`);
            });
        }
        console.log('');
    });
    
    console.log(`Total: ${verificationResults.total.passed} passed, ${verificationResults.total.failed} failed`);
    
    if (verificationResults.total.failed === 0) {
        console.log('\n🎉 All verifications passed! The service is ready for production deployment.');
        return true;
    } else {
        console.log('\n❌ Some verifications failed. Please fix the issues before deployment.');
        return false;
    }
};

const main = async () => {
    try {
        await verifyPhase1();
        await verifyPhase2();
        await verifyPhase3();
        
        const success = generateReport();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nVerification interrupted by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\nVerification terminated');
    process.exit(1);
});

main(); 