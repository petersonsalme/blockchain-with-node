const { STARTING_BALANCE } = require('./../config');
const cryptoHash = require('./../util/crypto-hash');
const { ec } = require('./../util');

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
}

module.exports = Wallet;