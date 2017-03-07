// @flow
import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import type {
  TMetric,
  TChart,
  TApplicationState,
} from '../types';
import type { TAction } from '../actionTypes';
import { createCharts } from './actions';
import Chart from './components/Chart';

type TChartsContainerProps = {
  metrics: TMetric[],
  charts: TChart[],
  dispatch: TAction => void,
};

export class ChartsContainer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  props: TChartsContainerProps;

  componentDidMount() {
    const { metrics, charts, dispatch } = this.props;
    if (metrics.length > 0 && charts.length === 0) {
      dispatch(createCharts(metrics));
    }
  }

  render() {
    const { charts, dispatch, metrics } = this.props;
    if (!charts || charts.length === 0) {
      return <div>There are no metrics yet.</div>;
    }

    return (
      <div
        className="charts-container"
        style={{
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          alignItems: 'stretch',
          alignContent: 'stretch',
        }}
      >
        {charts.map((chart, idx) => (
          <Chart
            metrics={[metrics[metrics.findIndex(m => m.id === charts[idx].lines[0].metricId)]]}
            chart={charts[idx]}
            key={chart.id}
            dispatch={dispatch}
          />
        ))}
      </div>
    );
  }
}

const stateToProps = (state: TApplicationState) => ({
  metrics: state.metrics.items,
  charts: state.charts,
});

export const ConnectedComponent = connect(stateToProps)(ChartsContainer);
export default Radium(ConnectedComponent);

