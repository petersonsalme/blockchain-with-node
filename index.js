const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRES = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
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

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncChains();
        syncPools();
    }
});