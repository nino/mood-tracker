/* @flow */
import type { TMetric } from '../types';

export type TDefaultAction = { type: 'charts/DEFAULT_ACTION' };
export type TRequestZoomAction = { type: 'charts/REQUEST_ZOOM', chartId: number, zoomFactor: number };
export type TBeginZoomAction = { type: 'charts/BEGIN_ZOOM', chartId: number, finishTime: number, targetZoomFactor: number };
export type TSetZoomFactorAction = { type: 'charts/SET_ZOOM_FACTOR', chartId: number, zoomFactor: number };
export type TFinishZoomAction = { type: 'charts/FINISH_ZOOM', chartId: number };
export type TToggleVisibilityAction = { type: 'charts/TOGGLE_VISIBILITY', metricId: number };
export type TScrollByAction = { type: 'charts/SCROLL_BY', chartId: number, deltaX: number };
export type TCreateChartsAction = { type: 'charts/CREATE_CHARTS', metrics: TMetric[] };

export type TChartsAction =
    TDefaultAction
  | TRequestZoomAction
  | TBeginZoomAction
  | TSetZoomFactorAction
  | TFinishZoomAction
  | TToggleVisibilityAction
  | TScrollByAction
  | TCreateChartsAction
  ;
