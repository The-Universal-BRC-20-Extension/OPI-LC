#!/usr/bin/env python3
"""
Bitcoin RPC utilities for OPI-LC indexer
Provides functions to lookup spending transaction IDs using Bitcoin Core RPC
"""

import os
import sys
import time
import json
from bitcoinrpc.authproxy import AuthServiceProxy, JSONRPCException
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configuration from environment variables
USE_BITCOIN_RPC_FOR_TXID = os.getenv('USE_BITCOIN_RPC_FOR_TXID', 'true').lower() == 'true'

# Support both BITCOIN_RPC_* and BTC_RPC_* variable names
BITCOIN_RPC_HOST = os.getenv('BITCOIN_RPC_HOST') or os.getenv('BTC_RPC_HOST', '127.0.0.1')
BITCOIN_RPC_PORT = os.getenv('BITCOIN_RPC_PORT') or os.getenv('BTC_RPC_PORT', '8332')
BITCOIN_RPC_USER = os.getenv('BITCOIN_RPC_USER') or os.getenv('BTC_RPC_USER', 'bitcoinrpc')
BITCOIN_RPC_PASSWORD = os.getenv('BITCOIN_RPC_PASSWORD') or os.getenv('BTC_RPC_PASSWORD', '')
BITCOIN_RPC_SCHEME = os.getenv('BITCOIN_RPC_SCHEME', 'http')
BITCOIN_RPC_TIMEOUT = int(os.getenv('BITCOIN_RPC_TIMEOUT', '30'))

# Handle BTC_RPC_URL format
BTC_RPC_URL = os.getenv('BTC_RPC_URL')

def get_bitcoin_rpc_connection():
    """
    Create and return a Bitcoin RPC connection with robust validation and error handling.
    """
    if not USE_BITCOIN_RPC_FOR_TXID:
        return None

    # Gather config - support both variable naming conventions
    rpc_url = os.getenv('BITCOIN_RPC_URL') or BTC_RPC_URL
    rpc_user = BITCOIN_RPC_USER
    rpc_password = BITCOIN_RPC_PASSWORD
    rpc_host = BITCOIN_RPC_HOST
    rpc_port = BITCOIN_RPC_PORT
    rpc_scheme = BITCOIN_RPC_SCHEME
    timeout = BITCOIN_RPC_TIMEOUT

    # Validation
    if not rpc_user:
        raise ValueError("Bitcoin RPC username is required (BITCOIN_RPC_USER)")
    if not rpc_password or rpc_password in ("your_rpc_password_here", "your_password"):
        raise ValueError(
            "Bitcoin RPC password is not set or is a placeholder. "
            "For rpcauth, use the cleartext password (not the hash)."
        )

    # URL construction
    if rpc_url:
        if rpc_url.startswith('http'):
            if '@' in rpc_url:
                connection_url = rpc_url
            else:
                protocol, rest = rpc_url.split('://', 1)
                connection_url = f"{protocol}://{rpc_user}:{rpc_password}@{rest}"
        else:
            connection_url = f"http://{rpc_user}:{rpc_password}@{rpc_url}"
    else:
        connection_url = f"{rpc_scheme}://{rpc_user}:{rpc_password}@{rpc_host}:{rpc_port}"

    try:
        return AuthServiceProxy(connection_url, timeout=timeout)
    except Exception as e:
        print(f"Failed to create Bitcoin RPC connection: {e}")
        return None

def is_bitcoin_rpc_available():
    """Check if Bitcoin RPC is available and responding"""
    if not USE_BITCOIN_RPC_FOR_TXID:
        return False
    
    try:
        rpc = get_bitcoin_rpc_connection()
        if rpc is None:
            return False
        
        # Test connection with a simple call
        rpc.getblockcount()
        return True
    except Exception as e:
        print(f"Bitcoin RPC not available: {e}")
        return False

def lookup_spending_txid_from_bitcoin(block_height, prev_txid, prev_vout):
    """
    Lookup the spending transaction ID for a given prevout in a specific block
    
    Args:
        block_height (int): The block height to search in
        prev_txid (str): The previous transaction ID
        prev_vout (int): The previous output index
        
    Returns:
        str: The spending transaction ID, or "-1" if not found or error
    """
    if not USE_BITCOIN_RPC_FOR_TXID:
        return "-1"
    
    try:
        rpc = get_bitcoin_rpc_connection()
        if rpc is None:
            print("Bitcoin RPC connection failed")
            return "-1"
        
        # Get block hash for the given height
        block_hash = rpc.getblockhash(block_height)
        
        # Get block with transaction details
        block = rpc.getblock(block_hash, 2)  # Verbose level 2 includes transaction details
        
        # Search through all transactions in the block
        for tx in block['tx']:
            txid = tx['txid']
            
            # Check each input in the transaction
            for vin in tx.get('vin', []):
                if (vin.get('txid') == prev_txid and 
                    vin.get('vout') == prev_vout):
                    print(f"Found spending txid: {txid} for prevout {prev_txid}:{prev_vout} in block {block_height}")
                    return txid
        
        print(f"Spending txid not found for prevout {prev_txid}:{prev_vout} in block {block_height}")
        return "-1"
        
    except JSONRPCException as e:
        print(f"Bitcoin RPC error: {e}")
        return "-1"
    except Exception as e:
        print(f"Error looking up spending txid: {e}")
        return "-1"

def get_inscription_prevout(inscription_id):
    """
    Get the prevout (txid:vout) for a transfer inscription
    
    Args:
        inscription_id (str): The inscription ID
        
    Returns:
        tuple: (prev_txid, prev_vout) or (None, None) if not found
    """
    if not USE_BITCOIN_RPC_FOR_TXID:
        return None, None
    
    try:
        rpc = get_bitcoin_rpc_connection()
        if rpc is None:
            return None, None
        
        # Parse inscription ID to get the transaction ID
        # Format: <txid>i<index> where index can be any number
        if 'i' not in inscription_id:
            print(f"Invalid inscription ID format: {inscription_id}")
            return None, None
        
        # Split on first 'i' only to handle multi-digit indices
        parts = inscription_id.split('i', 1)
        if len(parts) != 2:
            print(f"Invalid inscription ID format: {inscription_id}")
            return None, None
        
        txid, index_str = parts
        try:
            index = int(index_str)
        except ValueError:
            print(f"Invalid inscription index: {index_str}")
            return None, None
        
        # The inscription is in the output at index
        # So the prevout is the same txid with the index as vout
        return txid, index
        
    except Exception as e:
        print(f"Error getting prevout for inscription {inscription_id}: {e}")
        return None, None

def get_spending_txid_with_fallback(block_height, inscription_id):
    """
    Get spending txid with fallback to -1 if Bitcoin RPC fails
    
    Args:
        block_height (int): The block height to search in
        inscription_id (str): The inscription ID
        
    Returns:
        str: The spending transaction ID, or "-1" if not found or error
    """
    if not USE_BITCOIN_RPC_FOR_TXID:
        return "-1"
    
    try:
        prev_txid, prev_vout = get_inscription_prevout(inscription_id)
        if prev_txid and prev_vout is not None:
            spending_txid = lookup_spending_txid_from_bitcoin(block_height, prev_txid, prev_vout)
            return spending_txid
    except Exception as e:
        print(f"Bitcoin RPC lookup failed for {inscription_id}: {e}")
    
    # Fallback to -1 (current behavior)
    return "-1"

# Test function for development
def test_bitcoin_rpc_connection():
    """Test Bitcoin RPC connection and basic functionality"""
    print("Testing Bitcoin RPC connection...")
    
    if not is_bitcoin_rpc_available():
        print("❌ Bitcoin RPC not available")
        return False
    
    try:
        rpc = get_bitcoin_rpc_connection()
        block_count = rpc.getblockcount()
        print(f"✅ Bitcoin RPC connected. Current block height: {block_count}")
        return True
    except Exception as e:
        print(f"❌ Bitcoin RPC test failed: {e}")
        return False

if __name__ == "__main__":
    # Test the Bitcoin RPC connection
    test_bitcoin_rpc_connection() 