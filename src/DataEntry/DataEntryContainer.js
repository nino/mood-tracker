import React from 'react';
import { connect } from 'react-redux';
import { metricShape } from '../types';

import MetricEntryContainer from './MetricEntryContainer';

export const DataEntryContainer = ({ metrics }) => {
  if (!metrics || metrics.length === 0) {
    return <div>There are no metrics yet.</div>;
  }
  return (
    <div className="data-entry-container">
      {metrics.map(metric => (
        <MetricEntryContainer metric={metric} key={metric.id} />
      ))}
    </div>
  );
};

DataEntryContainer.propTypes = {
  metrics: React.PropTypes.arrayOf(metricShape),
};

const stateToProps = state => ({ metrics: state.metrics.items });

export default connect(stateToProps)(DataEntryContainer);
