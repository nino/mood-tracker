/* @flow */
import React from 'react';
import Radium from 'radium';
import Loess, { type LoessData } from 'loess';
import Measure from 'react-measure';
import Draggable, { type DraggableData } from 'react-draggable';
import moment from 'moment';
import {
  min,
  max,
  map,
  slice,
  find,
  findIndex,
  findLastIndex,
  zip,
  range,
} from 'lodash';
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

  function getLinePoints(line: TChartLine): TLinePoint[] {
    const metric: ?TMetric = find(metrics, m => m.id === line.metricId);
    if (metric == null || line.mode === 'off') {
      return [];
    }
    const pointsAll: TLinePoint[] = map(
      metric.entries,
      (entry: TMetricEntry) => ({
        x: xValueToPixels(+moment(entry.date), [viewRangeBegin, viewRangeEnd], dimensions.width, CHART_PADDING),
        y: yValueToPixels(entry.value, [metric.props.minValue, metric.props.maxValue], dimensions.height, CHART_PADDING),
      }),
    );
    let pointsSelected: TLinePoint[] = pointsAll;
    if (line.mode === 'loess') {
      const x: number[] = map(pointsSelected, p => p.x);
      const y: number[] = map(pointsSelected, p => p.y);
      const xHat: number[] = range(0, dimensions.width, 5);
      const loessData: LoessData = { x, y };
      const loessOptions = {
        span: 0.4,
        degree: 1,
        band: 0.8,
      };
      const model: Loess = new Loess(loessData, loessOptions);
      const predicted = model.predict({ x: xHat }).fitted;
      pointsSelected = map(zip(xHat, predicted), p => ({
        x: p[0],
        y: p[1],
      }));
      pointsSelected = slice(
        pointsSelected,
        findIndex(xHat, i => i > min(x)),
        findIndex(xHat, i => i > max(x)),
      );
    }

    pointsSelected = slice(
      pointsSelected,
      max([findLastIndex(pointsSelected, item => item.x < 0), 0]),
      (
        findIndex(pointsSelected, item => item.x > dimensions.width) + 1
        || pointsSelected.length
      ),
    );
    return pointsSelected;
  }

  return (
    <div
      className="chart"
      onWheel={handleWheel}
      style={{
        height: '240px',
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
        borderRadius: '4px',
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
      <Draggable
        onDrag={(event: Event, data: DraggableData) => dispatch(scrollBy(chart.id, -data.deltaX))}
      >
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
          {map(chart.lines, (line: TChartLine) => (
            <Line
              key={line.metricId}
              points={getLinePoints(line)}
              color={LINE_COLORS[line.metricId % LINE_COLORS.length]}
            />
          ))}
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

