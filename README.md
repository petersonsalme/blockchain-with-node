# Blockchain with Node.js

A fully functional blockchain network built with Node.js, Express, and Redis.

## Prerequisites
- Node.js (v14 or higher)
- Redis server or Docker (for `docker-compose`)

## How to Run the Node

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
To run in development mode (which starts a Redis instance via docker-compose and the nodemon server):
```bash
npm run dev
```

To run a peer node (which connects to the root node and synchronizes chains and transaction pools):
```bash
npm run dev-peer
```

To run normally (requires pre-built client and running redis):
```bash
npm start
```

## How to Interact with the Blockchain

### Using the Frontend
A frontend client is automatically built and served by the application. Open your browser and navigate to:
```
http://localhost:3000
```
(Note: If you are running a peer node on a different port, use that port instead).

### Using the REST API
You can interact directly with the Blockchain network using the exposed API endpoints:

- **GET `/api/blocks`**: View the current blockchain.
- **POST `/api/mine`**: Mine a new block with the data provided in the request body (`{ "data": "..." }`).
- **POST `/api/transactions`**: Create a new transaction. Body requires `{ "amount": <number>, "recipient": "<address>" }`.
- **GET `/api/transaction-pool-map`**: View the current unmined transactions in the pool.
- **GET `/api/mine-transactions`**: Mine a block containing all the current transactions in the pool, rewarding the miner.
- **GET `/api/wallet-info`**: Get the current balance and address of the node's wallet.

### Using the CLI
A simple CLI script `cli.js` is provided to interact with the API. 
```bash
node cli.js
```
The CLI will guide you through viewing the blockchain, creating transactions, and mining.