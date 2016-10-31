import React, {Component} from 'react'
import './MetricEntryContainer.css'
import MetricEntryButtonRow from './MetricEntryButtonRow'
import MetricEntryFormField from './MetricEntryFormField'

class MetricEntryContainer extends Component {
    propTypes: {
        metric: React.PropTypes.object.isRequired,
        onAction: React.PropTypes.func.isRequired,
    }

    metricIsValid() {
        let metric = this.props.metric
        return (
            metric.type === 'int' &&
            metric.minValue <= metric.maxValue
        )
    }

    metricHasFewOptions() {
        let metric = this.props.metric
        return (
            metric.type === 'int' &&
            metric.minValue < metric.maxValue &&
            (metric.maxValue - metric.minValue) <= 10
        )
    }

    render() {
        let entryForm
        if (!this.metricIsValid()) {
            entryForm = (
                <span>Error: invalid metric provided</span>
            )
        }
        else if (this.metricHasFewOptions()) {
            entryForm = (
                <MetricEntryButtonRow metric={this.props.metric} onAction={this.props.onAction} />
            )
        }
        else {
            entryForm = (
                <MetricEntryFormField metric={this.props.metric} onAction={this.props.onAction} />
            )
        }

        return (
            <div className='metric-entry-form'>
                <div className='metric-title'>
                    {this.props.metric.name}
                </div>
                {entryForm}
            </div>
        )
    }
}

export default MetricEntryContainer
