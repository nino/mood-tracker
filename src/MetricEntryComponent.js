import React, {Component} from 'react'
import {Container, Button, Input, Form} from 'semantic-ui-react'
import './MetricEntryComponent.css'
import RatingInputButtonRow from './RatingInputButtonRow'
import RatingInputFormField from './RatingInputFormField'

class MetricEntryComponent extends Component {
    handleRate(error, {rating}) {
        this.props.onAction(this, 'logMetric', {
            metric: this.props.metric.name,
            score: rating
        })
    }

    hasFewOptions(metric) {
        return (
            metric.type === 'int' &&
            metric.minValue < metric.maxValue &&
            (metric.maxValue - metric.minValue) <= 10
        )
    }

    render() {
        let entryForm
        if (this.hasFewOptions(this.props.metric)) {
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

MetricEntryComponent.propTypes = {
    metric: React.PropTypes.object.isRequired,
    onAction: React.PropTypes.func.isRequired,
    error: React.PropTypes.string
}

export default MetricEntryComponent
