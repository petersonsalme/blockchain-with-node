const { STARTING_BALANCE } = require('./../config');
const { ec, cryptoHash } = require('./../util');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        const hash = cryptoHash(data);
        return this.keyPair.sign(hash);
    }

    createTransaction({ amount, recipient, chain }) {
        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            });
        }

        if (amount > this.balance) {
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }) {
        let hasConductedTransaction = false;
        let total = 0;
        
        for (let block of chain.reverse()) {
            for (let transaction of block.data) {
                if (transaction.input.address === address) {
                    hasConductedTransaction = true;
                }
                
                total += (transaction.outputMap[address] || 0);
            }

            if (hasConductedTransaction) {
                break;
            }
        }
        
        return hasConductedTransaction ? total : (STARTING_BALANCE + total);
    }
}

module.exports = Wallet;