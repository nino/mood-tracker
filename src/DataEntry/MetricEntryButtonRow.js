import React, {Component} from 'react'
import {Button} from 'semantic-ui-react'

class MetricEntryButtonRow extends Component {
    propTypes: {
        metric: React.PropTypes.object.isRequired,
        onAction: React.PropTypes.func.isRequired
    }

    sendRating(rating) {
        this.props.onAction('log metric', {
            name: this.props.metric.name,
            rating: rating
        })
    }

    getButtonColor(value, colorGroups) {
        let color = 'black'
        if (!colorGroups) {
            return color
        }
        else {
            colorGroups.forEach(function(group) {
                if (value >= group.minValue && value <= group.maxValue) {
                    color = group.color
                }
            })
            return color
        }
    }

    render() {
        let buttons = []
        let metric = this.props.metric
        for (let i = metric.minValue; i <= metric.maxValue; i++) {
            let color = this.getButtonColor(i, metric.colorGroups)
            buttons.push(
                <Button
                    onClick={() => this.sendRating(i)}
                    color={color}
                    basic
                    key={i}>
                    {i}
                </Button>
            )
        }
        return (
            <Button.Group size='mini' widths={buttons.length}>
            {buttons}
            </Button.Group>
        )
    }
}



export default MetricEntryButtonRow
