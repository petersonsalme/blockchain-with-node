import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Transaction from "./Transaction";
import history from '../history';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = { transactionPoolMap: {} };

    fetchTransactionMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(r => r.json())
            .then(json => this.setState({ transactionPoolMap: json }));
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(r => {
                if (r.status === 200) {
                    alert('success');
                    history.push('/blocks');
                } else {
                    alert('The mine-transactions block requet dod not complete');
                }
            });
    }

    componentDidMount() {
        this.fetchTransactionMap();

        this.fetchPoolMapInterval = setInterval(
            () => this.fetchTransactionMap(), 
            POLL_INTERVAL_MS
        )
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval);
    }

    render() {
        return (
            <div className='TransactionPool'>
                <div><Link to='/'>Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(t => {
                        return (
                            <div key={t.id}>
                                <hr />
                                <Transaction transaction={t} />
                            </div>
                        )
                    })
                }
                <ht />
                <Button bsStyle='danger' onClick={this.fetchMineTransactions}>Mine the transactions</Button>
            </div>
        );
    }
}


export default TransactionPool;