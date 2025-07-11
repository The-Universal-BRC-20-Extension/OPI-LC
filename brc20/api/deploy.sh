#!/bin/bash

# OPI-LC Deployment Script
# This script sets up the complete OPI-LC deployment

set -e

echo "=== OPI-LC Deployment Script ==="
echo "Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the api directory."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please ensure it exists with proper configuration."
    exit 1
fi

# Load environment variables
echo "Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install Python dependencies
echo "Installing Python dependencies..."
pipenv install

# Test database connection
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

# Install systemd service
echo "Installing systemd service..."
sudo cp opi-lc.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable opi-lc.service

echo "=== Deployment Complete ==="
echo ""
echo "Service Status:"
echo "  - Database: Configured and tested"
echo "  - Dependencies: Installed"
echo "  - Service: Installed and enabled"
echo ""
echo "To start the service:"
echo "  sudo systemctl start opi-lc"
echo ""
echo "To check service status:"
echo "  sudo systemctl status opi-lc"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u opi-lc -f"
echo ""
echo "To stop the service:"
echo "  sudo systemctl stop opi-lc" 