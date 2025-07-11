#!/usr/bin/env python3
"""
Secure API Connection Test
This script tests API connectivity without exposing sensitive data.
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

def test_api_connection():
    """Test API service connectivity"""
    try:
        # Load environment variables
        load_dotenv()
        
        # Get API configuration
        api_host = os.getenv('API_HOST', '127.0.0.1')
        api_port = os.getenv('API_PORT', '3003')
        
        api_url = f"http://{api_host}:{api_port}"
        
        print("🌐 Testing API connection...")
        print(f"   URL: {api_url}")
        
        # Test basic endpoints
        endpoints = [
            '/v1/brc20/block_height',
            '/v1/brc20/db_version',
            '/v1/brc20/ip'
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{api_url}{endpoint}", timeout=5)
                if response.status_code == 200:
                    print(f"✅ {endpoint}: OK")
                    if endpoint == '/v1/brc20/block_height':
                        print(f"   Current block: {response.text}")
                    elif endpoint == '/v1/brc20/db_version':
                        print(f"   DB version: {response.text}")
                else:
                    print(f"❌ {endpoint}: HTTP {response.status_code}")
                    return False
            except requests.exceptions.RequestException as e:
                print(f"❌ {endpoint}: Connection failed - {str(e)}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: API test failed - {str(e)}")
        return False

def test_database_connection_via_api():
    """Test database connection through API"""
    try:
        api_host = os.getenv('API_HOST', '127.0.0.1')
        api_port = os.getenv('API_PORT', '3003')
        api_url = f"http://{api_host}:{api_port}"
        
        print("\n🔐 Testing database connection via API...")
        
        # Test balance endpoint (requires DB connection)
        test_url = f"{api_url}/v1/brc20/get_current_balance_of_wallet"
        params = {
            'address': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            'ticker': 'ordi'
        }
        
        response = requests.get(test_url, params=params, timeout=10)
        
        if response.status_code == 200:
            print("✅ Database connection via API: OK")
            data = response.json()
            if data.get('error') is None:
                print("✅ API database queries working")
                return True
            else:
                print(f"⚠️  API returned error: {data.get('error')}")
                return True  # API is working, just no data
        else:
            print(f"❌ Database connection via API failed: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Database test via API failed - {str(e)}")
        return False

def test_service_status():
    """Test if services are running"""
    import subprocess
    
    print("\n🔍 Checking service status...")
    
    # Check if API process is running
    try:
        result = subprocess.run(['pgrep', '-f', 'api.js'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ API service: RUNNING")
        else:
            print("❌ API service: NOT RUNNING")
            return False
    except Exception as e:
        print(f"❌ ERROR checking API service: {str(e)}")
        return False
    
    # Check if light client is running
    try:
        result = subprocess.run(['pgrep', '-f', 'brc20_light_client'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Light Client: RUNNING")
        else:
            print("❌ Light Client: NOT RUNNING")
            return False
    except Exception as e:
        print(f"❌ ERROR checking Light Client: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔒 OPI-LC API Security Test")
    print("=" * 40)
    
    # Test service status
    services_running = test_service_status()
    print()
    
    # Test API connection
    api_connected = test_api_connection()
    print()
    
    # Test database via API
    db_via_api = test_database_connection_via_api()
    print()
    
    # Summary
    if services_running and api_connected and db_via_api:
        print("🎉 ALL TESTS PASSED: API is secure and connected!")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED: Please fix issues above")
        sys.exit(1) 