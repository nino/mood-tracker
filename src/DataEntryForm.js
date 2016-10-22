import React, {Component} from 'react'
import {Container, Button, Loader} from 'semantic-ui-react'
import MetricEntryComponent from './MetricEntryComponent'

/* 
 *
            <Button.Group size='mini' widths='10'>
            <Button basic compact color='red'>1</Button>
            <Button basic compact color='red'>2</Button>
            <Button basic compact color='red'>3</Button>
            <Button basic compact color='yellow'>4</Button>
            <Button basic compact color='yellow'>5</Button>
            <Button basic compact color='yellow'>6</Button>
            <Button basic compact color='green'>7</Button>
            <Button basic compact color='green'>8</Button>
            <Button basic compact color='green'>9</Button>
            <Button basic compact color='blue'>10</Button>
            </Button.Group>
 */

class DataEntryForm extends Component {
    render() {
        if (this.props.metrics) {
            let entryComponents = []
            this.props.metrics.forEach(function(metric) {
                entryComponents.push(
                    <MetricEntryComponent
                        onAction={this.props.onAction}
                        metric={metric}
                        key={metric.name}
                    />
                )
            }.bind(this))
            return (
                <div>
                {entryComponents}
                </div>
            )
        }
        else {
            return <Loader content="nope" />
        }
    }
}

export default DataEntryForm
