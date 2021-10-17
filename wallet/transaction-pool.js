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
}

module.exports = TransactionPool;