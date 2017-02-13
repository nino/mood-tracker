/* @flow */
import type {
  TDefaultAction,
  TRequestZoomAction,
  TBeginZoomAction,
  TSetZoomFactorAction,
  TFinishZoomAction,
  TToggleVisibilityAction,
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
export function requestZoom(chartId: number, zoomFactor: number = 1): TRequestZoomAction {
  return { type: 'charts/REQUEST_ZOOM', chartId, zoomFactor };
}

export function beginZoom(chartId: number, finishTime: number, targetZoomFactor: number): TBeginZoomAction {
  return { type: 'charts/BEGIN_ZOOM', chartId, finishTime, targetZoomFactor };
}

export function setZoomFactor(chartId: number, zoomFactor: number): TSetZoomFactorAction {
  return { type: 'charts/SET_ZOOM_FACTOR', chartId, zoomFactor };
}

export function finishZoom(chartId: number): TFinishZoomAction {
  return { type: 'charts/FINISH_ZOOM', chartId };
}

export function toggleVisibility(metricId: number): TToggleVisibilityAction {
  return { type: 'charts/TOGGLE_VISIBILITY', metricId };
}

export function scrollBy(chartId: number, deltaX: number): TScrollByAction {
  return { type: 'charts/SCROLL_BY', chartId, deltaX };
}

export function createCharts(metrics: TMetric[]): TCreateChartsAction {
  return { type: 'charts/CREATE_CHARTS', metrics };
}
