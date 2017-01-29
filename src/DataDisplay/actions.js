/* @flow */
import type { Action } from '../actionTypes';

export function requestZoom(chartId: number, zoomFactor: number = 1): Action {
  return {
    type: 'charts/REQUEST_ZOOM',
    chartId,
    zoomFactor,
  };
}

export function setZoomFactor(chartId: number, zoomFactor: number): Action {
  return {
    type: 'charts/SET_ZOOM_FACTOR',
    chartId,
    zoomFactor,
  };
}

export function finishZoom(chartId: number): Action {
  return {
    type: 'charts/FINISH_ZOOM',
    chartId,
  };
}

export function toggleVisibility(metricId: number): Action {
  return {
    type: 'charts/TOGGLE_VISIBILITY',
    metricId,
  };
}

export function scrollBy(chartId: number, deltaX: number): Action {
  return {
    type: 'charts/SCROLL_BY',
    chartId,
    deltaX,
  };
}
