const Wallet = require('./index');
const { verifySignature } = require('./../util');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            const result = verifySignature({
                publicKey: wallet.publicKey,
                data, 
                signature: wallet.sign(data)
            });
            expect(result).toBe(true);
        });

        it('does not verify an invalid signature', () => {
            const result = verifySignature({
                publicKey: wallet.publicKey,
                data, 
                signature: new Wallet().sign(data)
            });
            expect(result).toBe(false);
        });
    });
});
