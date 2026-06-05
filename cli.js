const readline = require('readline');
const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const makeRequest = (method, path, data = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    // Try to parse json, if it fails return raw body
                    resolve({ status: res.statusCode, data: body ? JSON.parse(body) : '' });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

const showMenu = () => {
    console.log('\n--- Blockchain CLI ---');
    console.log(`Connected to node at ${BASE_URL}`);
    console.log('1. View Blockchain (api/blocks)');
    console.log('2. View Wallet Info (api/wallet-info)');
    console.log('3. View Transaction Pool (api/transaction-pool-map)');
    console.log('4. Create Transaction (api/transactions)');
    console.log('5. Mine Transactions (api/mine-transactions)');
    console.log('6. Mine generic data block (api/mine)');
    console.log('7. Exit');
    
    rl.question('Select an option: ', handleOption);
};

const handleOption = async (option) => {
    try {
        switch (option.trim()) {
            case '1':
                const blocksRes = await makeRequest('GET', '/api/blocks');
                console.log('\nBlockchain:');
                console.log(JSON.stringify(blocksRes.data, null, 2));
                break;
            case '2':
                const walletRes = await makeRequest('GET', '/api/wallet-info');
                console.log('\nWallet Info:');
                console.log(JSON.stringify(walletRes.data, null, 2));
                break;
            case '3':
                const poolRes = await makeRequest('GET', '/api/transaction-pool-map');
                console.log('\nTransaction Pool:');
                console.log(JSON.stringify(poolRes.data, null, 2));
                break;
            case '4':
                await handleCreateTransaction();
                return; // Prevent showing menu immediately
            case '5':
                const mineTxRes = await makeRequest('GET', '/api/mine-transactions');
                console.log('\nMine Transactions Result:');
                console.log('Transactions mined successfully.');
                break;
            case '6':
                await handleMineData();
                return;
            case '7':
                console.log('Exiting...');
                rl.close();
                return;
            default:
                console.log('Invalid option');
        }
    } catch (err) {
        console.error('Error connecting to the node:', err.message);
        console.error('Make sure the node is running (e.g., npm run dev)');
    }
    showMenu();
};

const handleCreateTransaction = () => {
    rl.question('Enter recipient address: ', (recipient) => {
        rl.question('Enter amount: ', async (amountStr) => {
            const amount = parseFloat(amountStr);
            if (isNaN(amount)) {
                console.log('Invalid amount');
                showMenu();
                return;
            }
            try {
                const res = await makeRequest('POST', '/api/transactions', { recipient, amount });
                console.log('\nTransaction Created:');
                console.log(JSON.stringify(res.data, null, 2));
            } catch (err) {
                console.error('Error:', err.message);
            }
            showMenu();
        });
    });
};

const handleMineData = () => {
    rl.question('Enter data for the new block: ', async (data) => {
        try {
            await makeRequest('POST', '/api/mine', { data });
            console.log('\nBlock mined successfully with data:', data);
        } catch (err) {
            console.error('Error:', err.message);
        }
        showMenu();
    });
};

showMenu();
