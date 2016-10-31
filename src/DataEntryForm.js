import React, {Component} from 'react'
import MetricEntryComponent from './MetricEntryComponent'

class DataEntryForm extends Component {
    propTypes: {
        metrics: React.PropTypes.array.isRequired,
        onAction: React.PropTypes.func.isRequired
    }

    render() {
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
}

export default DataEntryForm
