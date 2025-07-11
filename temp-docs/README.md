# OPI-LC Documentation

**OPI-LC** (Open Protocol Indexer - Light Client) is a light client for meta-protocols on Bitcoin. It uses the OPI Network to fetch valid event hashes for blocks and the OPI API for fetching events, then re-calculates the hashes itself to validate the events.

## Overview

OPI-LC supports both **PostgreSQL** for better performance and **SQLite3** for ease of setup. Currently, it only supports **BRC-20**, with plans to add support for other meta-protocols over time.

## Documentation Sections

### 1. [Setup Guide](setup-guide.md)
Complete installation and configuration instructions for both PostgreSQL and SQLite versions.

### 2. [Launch Process](launch-process.md)
Step-by-step instructions for starting the light client and API services.

### 3. [Process Architecture](process-architecture.md)
Detailed explanation of how the indexing process works, including event processing and hash validation.

### 4. [Monitoring Guide](monitoring-guide.md)
Comprehensive monitoring setup and troubleshooting for production deployments.

### 5. [API Reference](api-reference.md)
Complete API documentation for the BRC-20 endpoints.

### 6. [Configuration Reference](configuration-reference.md)
Detailed explanation of all configuration options and environment variables.

## Quick Start

1. **Choose your database**: PostgreSQL (recommended for production) or SQLite (easier setup)
2. **Follow the setup guide**: [Setup Guide](setup-guide.md)
3. **Launch the services**: [Launch Process](launch-process.md)
4. **Monitor your deployment**: [Monitoring Guide](monitoring-guide.md)

## Key Features

- **Light Client Architecture**: Validates events by recalculating hashes against OPI Network data
- **BRC-20 Support**: Complete indexing of all BRC-20 events (deploy, mint, transfer)
- **Hash Validation**: Calculates block and cumulative hashes for data integrity
- **Optional Reporting**: Can report block hashes to the main indexer network
- **REST API**: Provides access to indexed data via HTTP endpoints
- **Dual Database Support**: PostgreSQL for performance, SQLite for simplicity

## System Requirements

- **OS**: Ubuntu 22.04 (recommended) or other Linux distributions
- **Python**: 3.7+ with pip
- **Node.js**: 20.x (for API service)
- **Database**: PostgreSQL 12+ or SQLite3
- **Memory**: 4GB+ RAM recommended
- **Storage**: 50GB+ for full BRC-20 index

## Support

For issues and contributions, please refer to the main repository at: https://github.com/bestinslot-xyz/OPI-LC 