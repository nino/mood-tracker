/* @flow */
import type {
  TDefaultAction,
  TRequestZoomAction,
  TBeginZoomAction,
  TSetMsPerPxAction,
  TFinishZoomAction,
  TCycleModeAction,
  TScrollByAction,
  TCreateChartsAction,
 } from './actionTypes';
import type { TMetric } from '../types';

export function defaultAction(): TDefaultAction {
  return { type: 'charts/DEFAULT_ACTION' };
}

/**
 * Request to begin animating the zoom-level of a chart.
 * The zoomFactor parameter is relative to the current zoom-level.
 */
export function requestZoom(chartId: number, factor: number = 1): TRequestZoomAction {
  return { type: 'charts/REQUEST_ZOOM', chartId, factor };
}

export function beginZoom(chartId: number, finishTime: number, targetMsPerPx: number): TBeginZoomAction {
  return { type: 'charts/BEGIN_ZOOM', chartId, finishTime, targetMsPerPx };
}

export function setMsPerPx(chartId: number, msPerPx: number): TSetMsPerPxAction {
  return { type: 'charts/SET_MS_PER_PX', chartId, msPerPx };
}

export function finishZoom(chartId: number): TFinishZoomAction {
  return { type: 'charts/FINISH_ZOOM', chartId };
}

export function cycleMode(metricId: number): TCycleModeAction {
  return { type: 'charts/CYCLE_MODE', metricId };
}

export function scrollBy(chartId: number, deltaX: number): TScrollByAction {
  return { type: 'charts/SCROLL_BY', chartId, deltaX };
}

export function createCharts(metrics: TMetric[]): TCreateChartsAction {
  return { type: 'charts/CREATE_CHARTS', metrics };
}

