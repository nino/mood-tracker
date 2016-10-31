import React, {Component} from 'react'
import DataChart from './DataChart'

class DataDisplayContainer extends Component {
    propTypes: {
        metrics: React.PropTypes.array.isRequired
    }

    createGraphs() {
        let containers = []
        this.props.metrics.forEach(function(metric) {
            containers.push(
                <div key={metric.name}>
                {metric.name}
                <DataChart metric={metric} />
                </div>
            )
        })
        return (
            <div>
            {containers}
            </div>
        )
    }

    render() {
        if (this.props.metrics.length > 0) {
            return this.createGraphs()
        }
        else {
            return (
                <div>No metrics found.</div>
            )
        }
    }
}

export default DataDisplayContainer
