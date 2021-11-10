import React, { Component } from "react";
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
    state = { displayTransaction: false };

    toogleTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction })
    }

    get displayTransaction() {
        const { data } = this.props.block;
        const stringfiedData = JSON.stringify(data);
        const dataDisplay = stringfiedData.length > 35 ? `${stringfiedData.substring(0, 35)}...` : stringfiedData;

        if (this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(t => (
                            <div key={t.id}>
                                <hr />
                                <Transaction transaction={t}></Transaction>
                            </div>
                        ))
                    }
                    <br />
                    <Button bsStyle="danger" bsSize="small" onClick={this.toogleTransaction}>Show Less</Button>
                </div>
            );
        }

        return (
            <div>
                <div>Display Transaction: {dataDisplay}</div>
                <Button bsStyle="danger" bsSize="small" onClick={this.toogleTransaction}>Show More</Button>
            </div>
        );
    }

    render() {
        const { timestamp, hash} = this.props.block;
        
        const hashDisplay = `${hash.substring(0, 15)}...`;
        
        return (
            <div className='Block'>
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleDateString()}</div>
                {this.displayTransaction}
            </div>
        )
    }
}

export default Block;