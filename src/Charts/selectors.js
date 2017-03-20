/* @flow */
import {
  findIndex,
} from 'lodash';
import type {
  TApplicationState,
  TChart,
} from '../types';
import { chartIndexFromMetricId } from './lib';

export const getCharts = (state: TApplicationState) => state.charts;

export const getChart = (state: TApplicationState, chartId: number) => {
  const charts = getCharts(state);
  const index = findIndex(charts, (chart: TChart) => chart.id === chartId);
  if (index === -1) {
    return null;
  }
  return charts[index];
};

export const getChartAnimation = (state: TApplicationState, chartId: number) => state.charts[chartId].animation;

export const getChartByMetricId = (state: TApplicationState, metricId: number) => {
  const charts = getCharts(state);
  const idx = chartIndexFromMetricId(state.charts, metricId);
  if (idx == null) {
    return null;
  }
  return charts[idx];
};

