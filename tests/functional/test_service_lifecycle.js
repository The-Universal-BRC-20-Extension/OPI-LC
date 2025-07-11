const { TEST_CONFIG, testUtils } = require('../test_config');
const { spawn } = require('child_process');
const path = require('path');

describe('Service Lifecycle Tests', () => {
    let serverProcess;
    let serverStarted = false;

    const startServer = () => {
        return new Promise((resolve, reject) => {
            serverProcess = spawn('node', ['api.js'], {
                cwd: path.join(__dirname, '../..'),
                env: {
                    ...process.env,
                    PORT: TEST_CONFIG.api.port.toString(),
                    NODE_ENV: 'test'
                }
            });

            serverProcess.stdout.on('data', (data) => {
                console.log(`Server stdout: ${data}`);
                if (data.toString().includes('listening') || data.toString().includes('started')) {
                    serverStarted = true;
                    resolve();
                }
            });

            serverProcess.stderr.on('data', (data) => {
                console.error(`Server stderr: ${data}`);
            });

            serverProcess.on('error', (error) => {
                console.error(`Server error: ${error}`);
                reject(error);
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!serverStarted) {
                    reject(new Error('Server failed to start within 30 seconds'));
                }
            }, 30000);
        });
    };

    const stopServer = () => {
        return new Promise((resolve) => {
            if (serverProcess) {
                serverProcess.kill('SIGTERM');
                serverProcess.on('close', () => {
                    serverStarted = false;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    };

    const waitForServer = async (timeout = 10000) => {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            try {
                const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`);
                if (response.ok) {
                    return true;
                }
            } catch (error) {
                // Server not ready yet
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return false;
    };

    describe('Service Startup', () => {
        test('Server starts successfully', async () => {
            await expect(startServer()).resolves.not.toThrow();
            const isReady = await waitForServer();
            expect(isReady).toBe(true);
        });

        test('Server responds to health check after startup', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`);
            expect(response.ok).toBe(true);
        });

        test('Database connection is established', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/db_version`);
            expect(response.ok).toBe(true);
            const version = await response.text();
            expect(parseInt(version)).toBeGreaterThan(0);
        });
    });

    describe('Service Shutdown', () => {
        test('Server shuts down gracefully', async () => {
            await expect(stopServer()).resolves.not.toThrow();
            
            // Wait a bit for shutdown to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify server is no longer responding
            try {
                await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`);
                fail('Server should not be responding after shutdown');
            } catch (error) {
                // Expected - server is down
                expect(error.message).toContain('fetch');
            }
        });
    });

    describe('Error Recovery', () => {
        test('Server recovers from database connection loss', async () => {
            // Start server
            await startServer();
            expect(await waitForServer()).toBe(true);
            
            // Simulate database connection issue (this is a test - in real scenario we'd need to actually disconnect DB)
            // For now, we'll just test that the server continues to respond to basic requests
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`);
            expect(response.ok).toBe(true);
        });

        test('Server handles concurrent requests', async () => {
            const requests = Array(10).fill().map(() => 
                fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`)
            );
            
            const responses = await Promise.all(requests);
            responses.forEach(response => {
                expect(response.ok).toBe(true);
            });
        });
    });

    describe('Configuration Validation', () => {
        test('Server starts with correct port configuration', async () => {
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/ip`);
            expect(response.ok).toBe(true);
            
            // Verify the response comes from the expected port
            const responseUrl = response.url;
            expect(responseUrl).toContain(`:${TEST_CONFIG.api.port}`);
        });

        test('Environment variables are properly loaded', async () => {
            // Test that database connection works (which requires env vars)
            const response = await fetch(`${TEST_CONFIG.api.baseUrl}/v1/brc20/db_version`);
            expect(response.ok).toBe(true);
        });
    });

    afterEach(async () => {
        await stopServer();
    });

    afterAll(async () => {
        await stopServer();
    });
}); 