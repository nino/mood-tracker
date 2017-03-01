/* @flow */
import type { TApplicationState, TChart } from '../types';

export const getCharts = (state: TApplicationState) => state.charts;

export const getChart = (state: TApplicationState, chartId: number) => {
  const charts = getCharts(state);
  const index = charts.findIndex((chart: TChart) => chart.id === chartId);
  if (index === -1) {
    return null;
  }
  return charts[index];
};

export const getChartAnimation = (state: TApplicationState, chartId: number) => state.charts[chartId].animation;
