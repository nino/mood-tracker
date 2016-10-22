import React, {Component} from 'react'
import {LineChart} from 'react-d3'

class DataDisplay extends Component {
    render() {
        console.log('metrics: ', this.props.metrics)
        let containers = []
        this.props.metrics.forEach(function(metric) {
            containers.push(
                <div key={metric.name}>
                {metric.name}
                </div>
            )
        })
        return (
            <div>
            {containers}
            </div>
        )
    }
}

DataDisplay.propTypes = {
    metrics: React.PropTypes.array.isRequired
}

export default DataDisplay
