/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import type { Metric } from '../types';

import MetricEntryContainer from './MetricEntryContainer';

type DataEntryContainerProps = {
  metrics: Metric[],
};

export const DataEntryContainer = ({ metrics }: DataEntryContainerProps) => {
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

const stateToProps = state => ({ metrics: state.metrics.items });

export default connect(stateToProps)(DataEntryContainer);
