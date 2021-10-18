const Block = require('./block');
const Transaction = require('./../wallet/transaction');
const Wallet = require('./../wallet');
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const last = this.chain.length -1;
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[last],
            data
        })

        this.chain.push(newBlock);
    }

    replaceChain(chain, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        if (!this.validTransactionData({ chain })) {
            console.error('The incoming chain has invalid data');
            return;
        }

        if (onSuccess) {
            onSuccess();
        }

        this.chain = chain;
        console.log('Chain replaced')
    }

    lastBlock() {
        const indexOfLastItem = this.chain.length -1;
        return this.chain[indexOfLastItem];
    }

    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
            const actualLastHash = chain[i-1].hash;
            const actualLastDifficulty = chain[i-1].difficulty;
            
            if (lastHash !== actualLastHash) {
                return false;
            }

            const validatedHash = cryptoHash(timestamp, lastHash, nonce, difficulty, data);
            if (hash !== validatedHash) {
                return false;
            }

            if (Math.abs(actualLastDifficulty - difficulty) > 1) {
                return false;
            }
        }

        return true;
    }

    validTransactionData({ chain }) {
        for (let block of chain.slice(1)) {
            const transactionSet = new Set();
            let amountOfRewardTransactions = 0;

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    amountOfRewardTransactions++;
                    if (amountOfRewardTransactions > 1) {
                        console.error('Miner rewards exceed limit per block');
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                } else {
                    if (!Transaction.validate(transaction)) {
                        console.error('Invalid transaction found');
                        return false;
                    }

                    const actualBalance = Wallet.calculateBalance({ chain: this.chain, address: transaction.input.address });
                    if (transaction.input.amount !== actualBalance) {
                        console.error('Invalid input amound')
                        return false;
                    }

                    if (transactionSet.has(transaction)) {
                        console.error('Duplicated transaction found')
                        return false;
                    } else {
                        transactionSet.add(transaction);
                    }
                }
            }
        }

        return true;
    }
}

module.exports = Blockchain;