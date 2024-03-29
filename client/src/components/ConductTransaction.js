import React, { Component } from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import history from "../history";

class ConductTransaction extends Component {
    state = { recipient: '', amount: 0, knownAddresses: [] };

    componentDidMount() {
        fetch(`${document.location.origin}/api/known-addresses`)
            .then(r => r.json())
            .then(json => this.setState({ knownAddresses: json }));
    }

    updateRecipient = event => {
        this.setState({ recipient: event.target.value });
    }

    updateAmount = event => {
        this.setState({ amount: Number(event.target.value) });
    }

    conductTransaction = () => {
        const { recipient, amount } = this.state;

        fetch(`${document.location.origin}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient, amount })
        })
        .then(r => r.json())
        .then(json => {
            alert(JSON.stringify(json));
            history.push('/transaction-pool');
        });
    }

    render() {
        return (
            <div className='ConductTransaction'>
                <Link to='/'>Home</Link>
                <h3>Conduct a Transaction</h3>
                <br />
                <h4>Known Addresses</h4>
                {
                    this.state.knownAddresses.map(ka => {
                        return (
                            <div key={ka}>
                                <div>{ka}</div>
                                <br />
                            </div>
                        )
                    })                    
                }
                <br />
                <FormGroup>
                    <FormControl 
                        input='text' 
                        placeholder='recipient' 
                        value={this.state.recipient} 
                        onChange={this.updateRecipient} />
                </FormGroup>
                <FormGroup>
                <FormControl 
                        input='number' 
                        placeholder='amount' 
                        value={this.state.amount} 
                        onChange={this.updateAmount} />
                </FormGroup>
                <div>
                    <Button bsStyle="danger" onClick={this.conductTransaction}>Submit</Button>
                </div>
            </div>
        );
    }
}

export default ConductTransaction;