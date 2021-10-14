const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds new block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({ data: newData});

        const last = blockchain.chain.length -1;
        expect(blockchain.chain[last].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'fake-genesis' };
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain does starts with the genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({ data: 'Bears'});
                blockchain.addBlock({ data: 'Beets'});
                blockchain.addBlock({ data: 'Battlestar Galactiva'});
            });
            
            describe('and a lastHash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and contains a block with and invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'some-bad-and-evil-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns false', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        describe('when the new chain is not longer', () => {
            it('does not replace the chain', () => {
                newChain.chain[0] = { new: 'chain' }
                
                blockchain.replaceChain(newChain.chain);

                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        describe('when the new chain is longer', () => {

            beforeEach(() => {
                newChain.addBlock({ data: 'Bears'});
                newChain.addBlock({ data: 'Beets'});
                newChain.addBlock({ data: 'Battlestar Galactiva'});
            });

            describe('and the chain is invalid', () => {
                it('does not replace the chain', () => {
                    newChain.chain[0].hash = 'some-fake-hash';

                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(originalChain);
                });
            });

            describe('and the chain is valid', () => {
                it('replaces the chain', () => {
                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(newChain.chain);
                });
            });
        });
    });
});