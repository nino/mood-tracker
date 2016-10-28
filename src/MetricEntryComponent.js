import React, {Component} from 'react'
import './MetricEntryComponent.css'
import RatingInputButtonRow from './RatingInputButtonRow'
import RatingInputFormField from './RatingInputFormField'

class MetricEntryComponent extends Component {
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
                <RatingInputButtonRow metric={this.props.metric} onAction={this.props.onAction} />
            )
        }
        else {
            entryForm = (
                <RatingInputFormField metric={this.props.metric} onAction={this.props.onAction} />
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

export default MetricEntryComponent
