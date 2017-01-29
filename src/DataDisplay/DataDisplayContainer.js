// @flow
import React from 'react';
import { connect } from 'react-redux';
import type {
  Metric,
  Chart,
  ApplicationState,
} from '../types';
import './DataDisplayContainer.css';
import DataChart from './DataChart';

type DataDisplayContainerProps = {
  metrics: Metric[],
  charts: Chart[],
  dispatch: (action: any) => void,
};

export const DataDisplayContainer = ({
  metrics,
  charts,
  dispatch,
 }: DataDisplayContainerProps) => {
  if (!charts || charts.length === 0) {
    return <div>There are no metrics yet.</div>;
  }

  return (
    <div className="data-display-container">
      {charts.map((chart, idx) => (
        <DataChart
          metrics={[metrics[metrics.findIndex(m => m.id === charts[idx].metrics[0].id)]]}
          chart={charts[idx]}
          key={chart.id}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
};

const stateToProps = (state: ApplicationState) => ({
  metrics: state.metrics.items,
  charts: state.charts,
});

export default connect(stateToProps)(DataDisplayContainer);
