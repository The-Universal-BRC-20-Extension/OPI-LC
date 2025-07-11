#!/usr/bin/env python3
"""
Secure Database Connection Test
This script tests database connectivity without exposing passwords.
"""

import os
import sys
from dotenv import load_dotenv

def test_connection():
    """Test database connection securely"""
    try:
        # Load environment variables
        load_dotenv()
        
        # Get connection parameters (password stays hidden)
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
            return False
        
        # Test if password is set (without showing it)
        if not db_password:
            print("❌ ERROR: DB_PASSWD not set in environment")
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
        print("   Run: pip install psycopg2-binary")
        return False
    except psycopg2.OperationalError as e:
        print(f"❌ ERROR: Database connection failed")
        print(f"   Error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ ERROR: Unexpected error")
        print(f"   Error: {str(e)}")
        return False

def test_file_permissions():
    """Test .env file security"""
    env_file = '.env'
    
    if not os.path.exists(env_file):
        print(f"❌ ERROR: {env_file} file not found")
        return False
    
    # Get file permissions
    stat_info = os.stat(env_file)
    permissions = oct(stat_info.st_mode)[-3:]
    
    print(f"📁 File: {env_file}")
    print(f"   Permissions: {permissions}")
    print(f"   Owner: {stat_info.st_uid}")
    
    # Check if permissions are secure (600 or 400)
    if permissions in ['600', '400']:
        print("✅ SUCCESS: File permissions are secure")
        return True
    else:
        print("❌ WARNING: File permissions should be 600 or 400")
        print("   Run: chmod 600 .env")
        return False

if __name__ == "__main__":
    print("🔒 OPI-LC Security Connection Test")
    print("=" * 40)
    
    # Test file permissions
    file_secure = test_file_permissions()
    print()
    
    # Test database connection
    db_connected = test_connection()
    print()
    
    # Summary
    if file_secure and db_connected:
        print("🎉 ALL TESTS PASSED: System is secure and connected!")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED: Please fix issues above")
        sys.exit(1) 