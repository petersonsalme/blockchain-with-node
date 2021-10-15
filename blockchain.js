const Block = require('./block');
const cryptoHash = require('./crypto-hash');

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

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        this.chain = chain;
        console.log('Chain replaced')
    }

    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const actualLastHash = chain[i-1].hash;
            const { timestamp, lastHash, hash, nonce, difficulty, data } = block;
            if (lastHash !== actualLastHash) {
                return false;
            }

            const validatedHash = cryptoHash(timestamp, lastHash, nonce, difficulty, data);
            if (hash !== validatedHash) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Blockchain;