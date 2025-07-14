#!/usr/bin/env python3
import os
import sys
import json
import argparse
from bitcoinrpc.authproxy import AuthServiceProxy, JSONRPCException
from dotenv import load_dotenv

load_dotenv()

parser = argparse.ArgumentParser(description='Lookup spending txid in a block')
parser.add_argument('--block_height', required=True, type=int)
parser.add_argument('--prev_txid', required=True)
parser.add_argument('--prev_vout', required=True, type=int)
args = parser.parse_args()

# Load env vars (assume .env_api is loaded by parent, fallback to os.environ)
BITCOIN_RPC_HOST = os.environ.get('BTC_RPC_HOST', '127.0.0.1')
BITCOIN_RPC_PORT = os.environ.get('BTC_RPC_PORT', '8332')
BITCOIN_RPC_USER = os.environ.get('BTC_RPC_USER', 'bitcoin')
BITCOIN_RPC_PASSWORD = os.environ.get('BTC_RPC_PASSWORD', '')
BITCOIN_RPC_SCHEME = os.environ.get('BTC_RPC_SCHEME', 'http')

rpc_url = f"{BITCOIN_RPC_SCHEME}://{BITCOIN_RPC_USER}:{BITCOIN_RPC_PASSWORD}@{BITCOIN_RPC_HOST}:{BITCOIN_RPC_PORT}"

try:
    rpc = AuthServiceProxy(rpc_url, timeout=30)
    block_hash = rpc.getblockhash(args.block_height)
    block = rpc.getblock(block_hash)
    txids = block['tx']
    found = False
    for txid in txids:
        tx = rpc.getrawtransaction(txid, True)
        vin = tx.get('vin', [])
        for vin_item in vin:
            if vin_item.get('txid') == args.prev_txid and vin_item.get('vout') == args.prev_vout:
                print(json.dumps({'spending_txid': txid}))
                found = True
                break
        if found:
            break
    if not found:
        print(json.dumps({'error': 'Spending txid not found in block'}))
        sys.exit(1)
except JSONRPCException as e:
    print(json.dumps({'error': str(e)}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({'error': str(e)}))
    sys.exit(1) 