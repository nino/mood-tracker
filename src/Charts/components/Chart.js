/* @flow */
import React from 'react';
import Radium from 'radium';
import Measure from 'react-measure';
import Draggable, { type DraggableData } from 'react-draggable';
import moment from 'moment';
import { min, max, map, flow, slice, findIndex, findLastIndex } from 'lodash/fp';
import { Button } from '@blueprintjs/core';
import ScrollBar from './ScrollBar';
import { LINE_COLORS, CHART_PADDING } from '../constants';
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
  const viewRangeBegin: number = chart.viewCenter - ((dimensions.width * chart.msPerPx) / 2);
  const viewRangeEnd: number = chart.viewCenter + ((dimensions.width * chart.msPerPx) / 2);
  return (
    <div
      className="chart"
      onWheel={handleWheel}
      style={{
        height: '240px',
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
        borderRadius: '4',
        border: '1px solid #dadada',
        boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        className="chart-buttons pt-button-group"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: '10',
        }}
      >
        <Button
          onClick={() => dispatch(requestZoom(chart.id, 1.2))}
          className="chart-zoom-in-button pt-icon-small-plus"
        />
        <Button
          onClick={() => dispatch(requestZoom(chart.id, 0.8))}
          className="chart-zoom-out-button pt-icon-small-minus"
        />
      </div>
      <Draggable onDrag={(event: Event, data: DraggableData) => dispatch(scrollBy(chart.id, -data.deltaX))}>
        <svg
          className="chart"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor: '#f2f5f8',
          }}
        >
          <ChartGrid
            colorGroups={metrics[0].props.colorGroups}
            dateRange={[viewRangeBegin, viewRangeEnd]}
            dimensions={dimensions}
            valueRange={[metrics[0].props.minValue, metrics[0].props.maxValue]}
            padding={CHART_PADDING}
          />
          {map((metric: TMetric) => (
            <Line
              key={metric.id}
              points={flow(
                map((entry: TMetricEntry) => ({
                  x: xValueToPixels(+moment(entry.date), [viewRangeBegin, viewRangeEnd], dimensions.width, CHART_PADDING),
                  y: yValueToPixels(entry.value, [metric.props.minValue, metric.props.maxValue], dimensions.height, CHART_PADDING),
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
      maxWidth: '600px',
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

