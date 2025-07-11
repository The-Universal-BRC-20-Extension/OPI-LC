#!/bin/bash

# OPI-LC Service Startup Script
# This script starts the OPI-LC service on port 3003

set -e

# Load environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Check if database is accessible
echo "Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'opi_lc',
    user: process.env.DB_USER || 'indexer',
    password: process.env.DB_PASSWD
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('Database connection successful');
        pool.end();
    }
});
"

if [ $? -ne 0 ]; then
    echo "Database connection failed. Please check your configuration."
    exit 1
fi

# Start the service
echo "Starting OPI-LC service on port 3003..."
PORT=3003 npm start 