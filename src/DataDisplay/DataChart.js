/* @flow */
import React from 'react';
import moment from 'moment';
import { min, max } from 'lodash';
import { Button } from '@blueprintjs/core';
import './DataChart.css';

import type {
  Metric,
  Chart,
} from '../types';
import type { Action } from '../actionTypes';

import { scrollBy, requestZoom } from './actions';
import ChartGrid from './ChartGrid';
// import ChartLabel from './ChartLabel';

type DataChartProps = {
  /**
   * All metrics from the Redux store.
   * (This is not particularly elegant since we don't need all of them,
   * but it works for now.)
   */
  metrics: Metric[],

  /**
   * Describes the state of the chart, namely:
   *
   * - The view center (i.e. scroll position)
   * - The zoom factor
   * - An array of objects containing the ID and visibility state
   *   of all metrics to be included in this chart
   */
  chart: Chart,

  /**
   * Dispatch Redux actions
   */
   dispatch: (Action) => void,
};

const DataChart = ({ metrics, chart, dispatch }: DataChartProps) => {
  function handleWheel(event: React.DOM.Event): void {
    if (event.deltaY === 0 && event.deltaZ === 0) {
      event.preventDefault();
    }

    if (event.deltaX > 0) {
      dispatch(scrollBy(chart.id, event.deltaX));
    }
  }

  const dateRangeBegin = min(metrics.map(m => +moment(m.entries[0])));
  const dateRangeEnd = max(metrics.map(m => +moment(m.entries[m.entries.length - 1])));
  const dateRange = dateRangeEnd - dateRangeBegin;
  return (
    <div
      className="data-chart-container"
      style={{
        border: '1px solid turquoise',
        height: '8em',
      }}
      onWheel={handleWheel}
    >
      <Button onClick={() => dispatch(requestZoom(chart.id, 1.2))}>+</Button>
      <Button onClick={() => dispatch(requestZoom(chart.id, 0.8))}>+</Button>
      <svg width={chart.zoomFactor * dateRange} height="100%" className="data-chart">
        <ChartGrid />
        {metrics[0].entries.map(entry => (
          <circle
            key={entry.date}
            cx={+moment(entry.date) / 6e6}
            cy={entry.value * 10}
            r={5}
            fill="red"
          />),
        )}
      </svg>
    </div>
  );
};

export default DataChart;
