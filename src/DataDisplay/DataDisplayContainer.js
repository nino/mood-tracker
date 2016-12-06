import React, {Component} from 'react';
import DataChart from './DataChart';

class DataDisplayContainer extends Component {

  createGraphs() {
    const { metrics } = this.props;
    const containers = metrics.map((metric) => (
        <div key={metric.id}>
          <DataChart metric={metric} />
        </div>
    ));
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


DataDisplayContainer.propTypes = {
  metrics: React.PropTypes.array.isRequired
};

export default DataDisplayContainer;
