/* @flow */
import React from 'react';
import Radium from 'radium';
import Measure from 'react-measure';
import Draggable, { type DraggableData } from 'react-draggable';
import moment from 'moment';
import { min, max, map, flow, slice, findIndex, findLastIndex } from 'lodash/fp';
import { Button } from '@blueprintjs/core';
import ScrollBar from './ScrollBar';
import { FOUR_WEEKS, LINE_COLORS } from '../constants';
import Line from './Line';
import ChartGrid from './ChartGrid';
import Legend from './Legend';

import type {
  TMetric,
  TChart,
  TChartLine,
  TMetricEntry,
} from '../../types';
import type { TDimensions, TLinePoint } from '../types';
import type { TAction } from '../../actionTypes';
import { xValueToPixels, yValueToPixels } from '../svg-utils';

import { scrollBy, requestZoom, cycleMode } from '../actions';

type TChartProps = {
  /**
   * All metrics from the Redux store.
   * (This is not particularly elegant since we don't need all of them,
   * but it works for now.)
   */
  metrics: TMetric[],

  /**
   * Describes the state of the chart, namely:
   *
   * - The view center (i.e. scroll position)
   * - The zoom factor
   * - An array of objects containing the ID and visibility state
   *   of all metrics to be included in this chart
   */
  chart: TChart,

  /**
   * Dispatch Redux actions
   */
   dispatch: (TAction) => void,
};

export const ChartMeasured = ({ metrics, chart, dispatch, dimensions }: TChartProps & { dimensions: TDimensions }) => {
  function handleWheel(event: SyntheticWheelEvent): void {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      event.preventDefault();
    }

    if (Math.abs(event.deltaX) > 0) {
      dispatch(scrollBy(chart.id, event.deltaX));
    }
  }

  const dateRangeBegin: number = min(metrics.map(m => +moment(m.entries[0].date)));
  const dateRangeEnd: number = max(metrics.map(m => +moment(m.entries[m.entries.length - 1].date)));
  const viewRangeBegin: number = chart.viewCenter - (FOUR_WEEKS / chart.zoomFactor);
  const viewRangeEnd: number = chart.viewCenter + (FOUR_WEEKS / chart.zoomFactor);
  return (
    <div
      className="chart"
      onWheel={handleWheel}
      style={{
        height: '200px',
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
      }}
    >
      <div className="chart-buttons">
        <Button
          onClick={() => dispatch(requestZoom(chart.id, 1.2))}
          className="chart-zoom-in-button"
        >
          +
        </Button>
        <Button
          onClick={() => dispatch(requestZoom(chart.id, 0.8))}
          className="chart-zoom-out-button"
        >
          –
        </Button>
      </div>
      <Draggable onDrag={(event: Event, data: DraggableData) => dispatch(scrollBy(chart.id, -data.deltaX))}>
        <svg
          className="chart"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
        >
          <ChartGrid
            colorGroups={metrics[0].props.colorGroups}
            dateRange={[viewRangeBegin, viewRangeEnd]}
            dimensions={dimensions}
            valueRange={[metrics[0].props.minValue, metrics[0].props.maxValue]}
            padding={{ bottom: 20 }}
          />
          {map((metric: TMetric) => (
            <Line
              key={metric.id}
              points={flow(
                map((entry: TMetricEntry) => ({
                  x: xValueToPixels(+moment(entry.date), [viewRangeBegin, viewRangeEnd], dimensions.width, { bottom: 20 }),
                  y: yValueToPixels(entry.value, [metric.props.minValue, metric.props.maxValue], dimensions.height, { bottom: 20 }),
                })),
                (ary: TLinePoint[]) => slice(
                  max([findLastIndex(item => item.x < 0)(ary), 0]),
                  (findIndex(item => item.x > dimensions.width)(ary) + 1 || ary.length),
                )(ary),
              )(metric.entries)}
              color={LINE_COLORS[metric.id % LINE_COLORS.length]}
            />
          ))(metrics)}
        </svg>
      </Draggable>
      <ScrollBar
        dateRange={[dateRangeBegin, dateRangeEnd]}
        viewRange={[viewRangeBegin, viewRangeEnd]}
        scrollBy={(deltaX: number) => dispatch(scrollBy(chart.id, deltaX))}
        width={dimensions.width}
      />
      <Legend
        cycleMode={(metricId: number) => dispatch(cycleMode(metricId))}
        metrics={
          metrics.filter((metric: TMetric) => (
            chart.lines.findIndex((line: TChartLine) => (line.metricId === metric.id)) > -1
          ))
        }
        lines={chart.lines}
      />
    </div>
  );
};

export default Radium((props: TChartProps) => (
  <div
    className="outer-chart-container"
    style={{
      margin: '16px',
      maxWidth: '500px',
      minWidth: '200px',
      flexGrow: '1',
    }}
  >
    <Measure>
      {(dimensions: TDimensions) => (
        <ChartMeasured metrics={props.metrics} chart={props.chart} dispatch={props.dispatch} dimensions={dimensions} />
      )}
    </Measure>
  </div>
));

