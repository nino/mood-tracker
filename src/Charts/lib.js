/* @flow */
/* eslint-disable import/prefer-default-export */
import moment from 'moment';
import {
  filter,
  findIndex,
  flatten,
  includes,
  map,
  max,
  clamp,
  min,
  some,
  concat,
} from 'lodash';
import type {
  TMetric,
  TChart,
  TChartLine,
  TChartsState,
  TMetricEntry,
} from '../types';
import type { TRange } from './types';
import { LINE_COLORS, MS_PER_PX } from './constants';

export function chartIndexFromMetricId(charts: TChartsState, metricId: number): ?number {
  const index = findIndex(
    charts,
    (chart: TChart) => some(
      chart.lines,
      (line: TChartLine) => line.metricId === metricId,
    ),
  );
  if (index === -1) {
    return null;
  }
  return index;
}

export function computeDateRange(chart: TChart, metrics: TMetric[]): TRange {
  const metricIds: number[] = map(chart.lines, 'metricId');
  const relevantMetrics: TMetric[] = filter(metrics, m => includes(metricIds, m.id));
  const entries: TMetricEntry[] = flatten(map(relevantMetrics, 'entries'));
  const dates: number[] = map(entries, entry => +moment(entry.date));
  return [min(dates), max(dates)];
}

export function msPerPxLimits(chart: TChart): TRange {
  return [1000, (chart.dateRange[1] - chart.dateRange[0]) * 0.01];
}

export function setValidViewOptions(chart: TChart, metrics: TMetric[]): TChart {
  const dateRange: TRange = computeDateRange(chart, metrics);
  const zoomLimits: TRange = msPerPxLimits(chart);
  const msPerPx: number = clamp(chart.msPerPx, zoomLimits[0], zoomLimits[1]);
  const viewCenter: number = clamp(chart.viewCenter, dateRange[0], dateRange[1]);
  const updatedChart: TChart = {
    ...chart,
    msPerPx,
    dateRange,
    viewCenter,
  };
  return updatedChart;
}

export function addNewChartWithMetric(charts: TChart[], metric: TMetric): TChart[] {
  const id: number = max(map(charts, c => c.id)) + 1;
  const chartProto: TChart = {
    id,
    dateRange: [0, 1],
    msPerPx: 1,
    viewCenter: 1,
    lines: [{
      metricId: metric.id,
      color: LINE_COLORS[metric.id % LINE_COLORS.length],
      mode: 'on',
    }],
  };
  const chartProto2: TChart = {
    ...chartProto,
    dateRange: computeDateRange(chartProto, [metric]),
  };
  const zoomLimits: TRange = msPerPxLimits(chartProto2);
  const chartFinal: TChart = {
    ...chartProto2,
    msPerPx: clamp(MS_PER_PX, zoomLimits[0], zoomLimits[1]),
    viewCenter: chartProto2.dateRange[1],
  };
  return concat(charts, [chartFinal]);
}

