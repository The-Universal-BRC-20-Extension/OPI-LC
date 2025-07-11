#!/usr/bin/env python3
"""
Secure Database Connection Test
This script tests database connectivity without exposing passwords.
Uses environment variables instead of .env files.
"""

import os
import sys

def test_connection():
    """Test database connection securely"""
    try:
        # Get connection parameters from environment variables
        db_host = os.getenv('DB_HOST')
        db_port = os.getenv('DB_PORT')
        db_database = os.getenv('DB_DATABASE')
        db_user = os.getenv('DB_USER')
        db_password = os.getenv('DB_PASSWD')
        
        # Validate required parameters
        required_params = [db_host, db_port, db_database, db_user]
        missing_params = [param for param in required_params if not param]
        
        if missing_params:
            print("❌ ERROR: Missing required database parameters:")
            for param in missing_params:
                print(f"   - {param}")
            print("\nSet these environment variables:")
            print("export DB_HOST='localhost'")
            print("export DB_PORT='5432'")
            print("export DB_DATABASE='opi_brc20_db'")
            print("export DB_USER='indexer'")
            print("export DB_PASSWD='your_password'")
            return False
        
        # Test if password is set (without showing it)
        if not db_password:
            print("❌ ERROR: DB_PASSWD not set in environment")
            print("Set it with: export DB_PASSWD='your_password'")
            return False
        
        # Import and test connection
        import psycopg2
        
        print("🔐 Testing database connection...")
        print(f"   Host: {db_host}")
        print(f"   Port: {db_port}")
        print(f"   Database: {db_database}")
        print(f"   User: {db_user}")
        print(f"   Password: {'*' * len(db_password)} (hidden)")
        
        # Attempt connection
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_database,
            user=db_user,
            password=db_password
        )
        
        # Test basic operations
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        
        cur.execute("SELECT current_user;")
        current_user = cur.fetchone()[0]
        
        cur.execute("SELECT current_database();")
        current_db = cur.fetchone()[0]
        
        # Close connection
        cur.close()
        conn.close()
        
        print("✅ SUCCESS: Database connection established!")
        print(f"   PostgreSQL Version: {version.split(',')[0]}")
        print(f"   Connected as: {current_user}")
        print(f"   Database: {current_db}")
        
        return True
        
    except ImportError:
        print("❌ ERROR: psycopg2 not installed")
        print("   Run: pipenv install psycopg2-binary")
        return False
    except psycopg2.OperationalError as e:
        print(f"❌ ERROR: Database connection failed")
        print(f"   Error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ ERROR: Unexpected error")
        print(f"   Error: {str(e)}")
        return False

def test_environment_variables():
    """Test if environment variables are set correctly"""
    print("🔍 Checking environment variables...")
    
    env_vars = {
        'DB_HOST': 'localhost',
        'DB_PORT': '5432', 
        'DB_DATABASE': 'opi_brc20_db',
        'DB_USER': 'indexer',
        'DB_PASSWD': '***HIDDEN***'
    }
    
    all_set = True
    for var, expected in env_vars.items():
        value = os.getenv(var)
        if value:
            if var == 'DB_PASSWD':
                print(f"   ✅ {var}: {'*' * len(value)} (set)")
            else:
                print(f"   ✅ {var}: {value}")
        else:
            print(f"   ❌ {var}: NOT SET")
            all_set = False
    
    return all_set

if __name__ == "__main__":
    print("🔒 OPI-LC Security Connection Test")
    print("=" * 40)
    
    # Test environment variables
    env_ok = test_environment_variables()
    print()
    
    if env_ok:
        # Test database connection
        db_connected = test_connection()
        print()
        
        # Summary
        if db_connected:
            print("🎉 ALL TESTS PASSED: System is secure and connected!")
            sys.exit(0)
        else:
            print("❌ DATABASE TEST FAILED: Please fix issues above")
            sys.exit(1)
    else:
        print("❌ ENVIRONMENT VARIABLES MISSING: Set them first")
        sys.exit(1) 