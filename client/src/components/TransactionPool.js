import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Transaction from "./Transaction";

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = { transactionPoolMap: {} };

    fetchTransactionMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(r => r.json())
            .then(json => this.setState({ transactionPoolMap: json }));
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
            </div>
        );
    }
}


export default TransactionPool;