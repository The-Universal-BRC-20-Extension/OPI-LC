# Detailed Installation Guide for OPI Light Client on Ubuntu 22.04

## Installing Python Libraries

1) Install pip if you don't have it. [guide](https://pip.pypa.io/en/stable/installation/).

```sh
wget https://bootstrap.pypa.io/get-pip.py
python3 get-pip.py
rm get-pip.py
```

or

```sh
sudo apt update
sudo apt install python3-pip
```

2) Install dependencies

```sh
python3 -m pip install python-dotenv;
python3 -m pip install buidl;
```

On some systems, requests is not installed by default. If you get "requests" not found error while running the client, run this:
```sh
python3 -m pip install requests;
```

## Install uncompress dependency for backup restore

```sh
sudo apt update
sudo apt install bzip2
```

## Setup Light Client

1) Clone repository, restore DB from last backup

```sh
git clone https://github.com/bestinslot-xyz/OPI-LC.git
cd OPI-LC/brc20/sqlite
wget http://s3.opi.network:9000/opi-light-client-files/db_4/light_client_brc20_sqlite_last.sqlite3.tar.bz2
tar -xvf light_client_brc20_sqlite_last.sqlite3.tar.bz2
rm light_client_brc20_sqlite_last.sqlite3.tar.bz2
```

2) Run initialise_sqlite.py to initialise .env config

```sh
python3 initialise_sqlite.py
```

## Run OPI Light-Client

```sh
python3 brc20_light_client_sqlite.py
```

# (Optional) Setup API


## Installing NodeJS

These steps are following the guide at [here](https://github.com/nodesource/distributions).

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

sudo apt-get update
sudo apt-get install nodejs -y
```

## Installing node modules

```bash
cd OPI-LC/brc20/api; npm install;
```

## Setup API

Run initialise_api.py to initialise .env config

```sh
python3 initialise_api.py
```

## Run API

```sh
node api.js
```