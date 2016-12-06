import React, {Component} from 'react';
import {Button} from 'semantic-ui-react';

class MetricEntryButtonRow extends Component {
  sendRating(rating) {
    this.props.onAction('log metric', {
      id: this.props.metric.id,
      rating: rating,
    });
  }

  getButtonColor(value, colorGroups) {
    let color = 'black';
    if (!colorGroups) {
      return color;
    }
    else {
      colorGroups.forEach(function(group) {
        if (value >= group.minValue && value <= group.maxValue) {
          color = group.color;
        }
      })
      return color;
    }
  }

  render() {
    let buttons = [];
    let metric = this.props.metric;
    for (let i = metric.minValue; i <= metric.maxValue; i++) {
      let color = this.getButtonColor(i, metric.colorGroups);
      buttons.push(
        <Button
          onClick={() => this.sendRating(i)}
          color={color}
          key={i}>
          {i}
        </Button>
      );
    }
    return (
      <Button.Group size='mini' widths={buttons.length}>
        {buttons}
      </Button.Group>
    );
  }
}

MetricEntryButtonRow.propTypes = {
  metric: React.PropTypes.object.isRequired,
  onAction: React.PropTypes.func.isRequired,
};

export default MetricEntryButtonRow;
