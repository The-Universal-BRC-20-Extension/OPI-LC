#!/usr/bin/env python3
"""
Secure OPI-LC Setup Script
This script helps configure OPI-LC securely using pipenv and environment variables.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_pipenv():
    """Check if pipenv is available"""
    try:
        result = subprocess.run(['pipenv', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ pipenv is available")
            return True
        else:
            print("❌ pipenv not found")
            return False
    except FileNotFoundError:
        print("❌ pipenv not installed")
        return False

def install_dependencies():
    """Install required dependencies using pipenv"""
    print("📦 Installing dependencies with pipenv...")
    
    dependencies = [
        'python-dotenv',
        'psycopg2-binary', 
        'buidl',
        'requests'
    ]
    
    for dep in dependencies:
        print(f"   Installing {dep}...")
        result = subprocess.run(['pipenv', 'install', dep], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"   ✅ {dep} installed")
        else:
            print(f"   ❌ Failed to install {dep}")
            return False
    
    return True

def create_secure_config():
    """Create secure configuration instructions"""
    print("\n🔐 SECURE CONFIGURATION SETUP")
    print("=" * 50)
    
    print("""
To configure OPI-LC securely, you need to set environment variables.
DO NOT create .env files - use environment variables instead.

1. Set these environment variables in your shell:
   export DB_USER="indexer"
   export DB_HOST="localhost" 
   export DB_PORT="5432"
   export DB_DATABASE="opi_brc20_db"
   export DB_PASSWD="YOUR_SECURE_PASSWORD"
   export FIRST_INSCRIPTION_HEIGHT="767430"
   export FIRST_BRC20_HEIGHT="779832"
   export REPORT_TO_INDEXER="true"
   export REPORT_NAME="indexer_production_node"
   export CREATE_EXTRA_TABLES="true"

2. For API service, also set:
   export API_HOST="127.0.0.1"
   export API_PORT="3003"
   export USE_EXTRA_TABLES="true"

3. Test the configuration:
   pipenv run python tests/test_connection.py
   pipenv run python tests/test_api_connection.py
""")

def create_database_script():
    """Create database setup script"""
    script_content = """#!/bin/bash
# Database Setup Script
# Run this as postgres user or with sudo

echo "Creating OPI-LC database..."

# Create database owned by indexer user
sudo -u postgres psql -c "CREATE DATABASE opi_brc20_db OWNER indexer;"

# Grant all privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE opi_brc20_db TO indexer;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON SCHEMA public TO indexer;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO indexer;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO indexer;"

echo "Database setup complete!"
echo "Now set your DB_PASSWD environment variable and test connection."
"""
    
    with open('setup_database.sh', 'w') as f:
        f.write(script_content)
    
    os.chmod('setup_database.sh', 0o755)
    print("✅ Created setup_database.sh script")

def create_service_scripts():
    """Create service management scripts"""
    
    # Light client service script
    light_client_script = """#!/bin/bash
# OPI-LC Light Client Service
# Run with: pipenv run python brc20_light_client_psql.py

cd "$(dirname "$0")"
export $(cat .env_psql | xargs) 2>/dev/null || true

echo "Starting OPI-LC Light Client..."
pipenv run python brc20_light_client_psql.py
"""
    
    with open('start_light_client.sh', 'w') as f:
        f.write(light_client_script)
    os.chmod('start_light_client.sh', 0o755)
    
    # API service script
    api_script = """#!/bin/bash
# OPI-LC API Service
# Run with: ./start_api.sh

cd "$(dirname "$0")/../api"

echo "Starting OPI-LC API Service on port 3003..."
node api.js
"""
    
    with open('start_api.sh', 'w') as f:
        f.write(api_script)
    os.chmod('start_api.sh', 0o755)
    
    print("✅ Created service scripts:")
    print("   - start_light_client.sh")
    print("   - start_api.sh")

def main():
    """Main setup function"""
    print("🔒 OPI-LC Secure Setup")
    print("=" * 30)
    
    # Check pipenv
    if not check_pipenv():
        print("Please install pipenv first: pip install pipenv")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("Failed to install dependencies")
        sys.exit(1)
    
    # Create database setup script
    create_database_script()
    
    # Create service scripts
    create_service_scripts()
    
    # Show secure configuration instructions
    create_secure_config()
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Run: ./setup_database.sh")
    print("2. Set your environment variables (see above)")
    print("3. Test: pipenv run python tests/test_connection.py")
    print("4. Start services: ./start_light_client.sh & ./start_api.sh")

if __name__ == "__main__":
    main() 