const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    addTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap);
        return transactions.find(t => t.input.address === inputAddress)
    }

    validTransactions() {
        return Object.values(this.transactionMap).filter(t => Transaction.validate(t));
    }

    clear(){
        this.transactionMap = {};
    }

    clearBlockchainTransactions({ chain }) {
        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];
            
            for (let transaction of block.data) {
                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
}

module.exports = TransactionPool;