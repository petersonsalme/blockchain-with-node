import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Transaction from "./Transaction";

class TransactionPool extends Component {
    state = { transactionPoolMap: {} };

    fetchTransactionMap = () => {
        fetch('http://localhost:3000/api/transaction-pool-map')
            .then(r => r.json())
            .then(json => this.setState({ transactionPoolMap: json }));
    }

    componentDidMount() {
        this.fetchTransactionMap();
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