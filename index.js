const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const isDevelopment = process.env.ENV === 'development';

const REDIS_URL = isDevelopment 
? 'redis://127.0.0.1:6379' 
: 'redis://:p97637201b00ebbde407b80216d6f726b05d80b0a790b2b3da9af48f4b462085c@ec2-44-196-72-198.compute-1.amazonaws.com:30769';
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRES = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.get('/api/blocks/length', (req, res) => {
    res.json(blockchain.chain.length);
});

app.get('/api/blocks/:id', (req, res) => {
    const { id } = req.params;
    const { length } = blockchain.chain;

    const blockReversed = blockchain.chain.slice().reverse();

    let startIndex = (id-1) * 5;
    let endIndex = id * 5;

    startIndex = startIndex < length ? startIndex : length;
    endIndex = endIndex < length ? endIndex : length;

    res.json(blockReversed.slice(startIndex, endIndex));
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transactions', (req, res) => {
    const { amount, recipient } = req.body;

    try {
        let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({ amount, recipient, chain: blockchain.chain });
        }

        transactionPool.addTransaction(transaction);
        pubsub.broadcastTransaction(transaction);
        
        return res.json(transaction);
    } catch (error) {
        return res.status(400).json({ error: 'Failed to create transaction', message: error.message });
    }
});

app.get('/api/transaction-pool-map', (req, res ) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;
    res.json({ 
        address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
    })
});

app.get('/api/known-addresses', (req, res) => {
    const addressMap = new Set();

    for (let block of blockchain.chain) {
        for (let transaction of block.data) {
            Object.keys(transaction.outputMap).forEach(r => addressMap.add(r));
        }
    }
    res.json(Array.from(addressMap));
});

app.get('*', (req, res) => {
    let absolutePath = path.join(__dirname, 'client/dist/index.html');
    res.sendFile(absolutePath);
});

const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRES}/api/blocks`}, (err, resp, body) => {
        if (!err && resp.statusCode == 200) {
            const rootChain = JSON.parse(body);
            blockchain.replaceChain(rootChain);
        }
    });
};

const syncPools = () => {
    request({ url: `${ROOT_NODE_ADDRES}/api/transaction-pool-map`}, (err, resp, body) => {
        if (!err && resp.statusCode == 200) {
            const map = JSON.parse(body);
            transactionPool.transactionMap = map;
        }
    });
};

if (isDevelopment) {
    const walletFoo = new Wallet();
    const walletBar = new Wallet();

    const generateWalletTransaction = ({ wallet, recipient, amount }) => {
        const transaction = wallet.createTransaction({
            recipient, amount, chain: blockchain.chain
        });
        transactionPool.addTransaction(transaction);
    };

    const walletAction = () => generateWalletTransaction({
        wallet, recipient: walletFoo.publicKey, amount: 5
    });

    const walletFooAction = () => generateWalletTransaction({
        wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
    });

    const walletBarAction = () => generateWalletTransaction({
        wallet: walletBar, recipient: wallet.publicKey, amount: 15
    });

    for (let i = 0; i < 10; i++) {
        if (i%3 === 0) {
            walletAction();
            walletFooAction();
        } else if (i%3 === 1) {
            walletAction();
            walletBarAction();
        } else {
            walletFooAction();
            walletBarAction();
        }

        transactionMiner.mineTransactions();
    }
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncChains();
        syncPools();
    }
});