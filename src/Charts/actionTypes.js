/* @flow */
/* TODO add docs */
import type { TMetric } from '../types';
import type { TRange } from './types';

export type TDefaultAction = {
  type: 'charts/DEFAULT_ACTION',
};

/**
 * Request-zoom action.
 *
 * Triggered by UI events like the user clicking
 * on one of the zoom buttons in a chart.
 */
export type TRequestZoomAction = {
  type: 'charts/REQUEST_ZOOM',

  /**
   * The id of the selected chart
   */
  chartId: number,

  /**
   * The (relative) zoom factor
   *
   * Numbers greater than 1 magnify,
   * numbers less than 1 zoom out.
   */
  factor: number,
};

export type TBeginZoomAction = {
  type: 'charts/BEGIN_ZOOM',
  chartId: number,
  finishTime: number,
  targetMsPerPx: number,
};

export type TSetMsPerPxAction = {
  type: 'charts/SET_MS_PER_PX',
  chartId: number,
  msPerPx: number,
};

export type TFinishZoomAction = {
  type: 'charts/FINISH_ZOOM',
  chartId: number,
};

export type TCycleModeAction = {
  type: 'charts/CYCLE_MODE',
  metricId: number
};

export type TScrollByAction = {
  type: 'charts/SCROLL_BY',
  chartId: number,
  deltaX: number
};

export type TCreateChartsAction = {
  type: 'charts/CREATE_CHARTS',
  metrics: TMetric[]
};

export type TSetDateRangeAction = {
  type: 'charts/SET_DATE_RANGE',
  chartId: number,
  dateRange: TRange,
};

export type TChartsAction
  = TDefaultAction
  | TRequestZoomAction
  | TBeginZoomAction
  | TSetMsPerPxAction
  | TFinishZoomAction
  | TCycleModeAction
  | TScrollByAction
  | TCreateChartsAction
  | TSetDateRangeAction
  ;

