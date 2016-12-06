import React, { Component } from 'react';
import MetricEntryContainer from './MetricEntryContainer';

class DataEntryContainer extends Component {
  render() {
    const { metrics } = this.props;
    const entryComponents = metrics.map(metric => (
      <MetricEntryContainer
        onAction={this.props.onAction}
        metric={metric}
        key={metric.id} />
    ));
    return (
      <div>
        {entryComponents}
      </div>
    );
  }
}

DataEntryContainer.propTypes = {
  metrics: React.PropTypes.array.isRequired,
  onAction: React.PropTypes.func.isRequired
};

export default DataEntryContainer;
