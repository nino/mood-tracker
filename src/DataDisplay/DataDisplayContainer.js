import React from 'react';
import { connect } from 'react-redux';
import { metricShape } from '../types';
import './DataDisplayContainer.css';

import DataChart from './DataChart';

export const DataDisplayContainer = ({ metrics }) => {
  if (!metrics || metrics.length === 0) {
    return <div>There are no metrics yet.</div>;
  }

  return (
    <div className="data-display-container">
      {metrics.map(metric => <DataChart metric={metric} key={metric.id} />)}
    </div>
  );
};

DataDisplayContainer.propTypes = {
  metrics: React.PropTypes.arrayOf(metricShape),
};

const stateToProps = state => ({ metrics: state.metrics.items });

export default connect(stateToProps)(DataDisplayContainer);
