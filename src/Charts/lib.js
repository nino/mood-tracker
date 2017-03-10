/* @flow */
/* eslint-disable import/prefer-default-export */
import {
  findIndex,
  some,
} from 'lodash';
import type {
  TChart,
  TChartLine,
  TChartsState,
} from '../types';

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

