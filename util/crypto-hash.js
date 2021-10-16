const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');
    const result = inputs.map((input) => JSON.stringify(input)).sort().join(' ')
    
    hash.update(result);

    return hash.digest('hex');
};

module.exports = cryptoHash;