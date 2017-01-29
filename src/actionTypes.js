// @flow
import type { NullableMetricProps, Metric } from './types';
import type { ChartAction } from './DataDisplay/actionTypes';

export type Action =
    { type: 'LOG_METRIC', metricId: number, date: string }
  | { type: 'START_EDITING', metricId: number, discard?: boolean }
  | { type: 'UPDATE_METRIC', metricId: number, newProps: NullableMetricProps }
  | { type: 'STOP_EDITING', discard?: boolean }
  | { type: 'ADD_METRIC', discard?: boolean }
  | { type: 'REORDER_METRICS', metricId: number, direction: 'up' | 'down' }
  | { type: 'DELETE_METRIC', metricId: number, confirm?: boolean }
  | { type: 'UPDATE_EDITED_METRIC', updatedProps: NullableMetricProps }
  | { type: 'REQUEST_CONFIRM_MODAL' }
  | { type: 'REQUEST_CANCEL_MODAL' }
  | { type: 'SUCCESS_CONFIRM_MODAL' }
  | { type: 'ERROR_CONFIRM_MODAL' }
  | { type: 'SUCCESS_CANCEL_MODAL' }
  | { type: 'ERROR_CANCEL_MODAL' }
  | { type: 'BEGIN_SYNC_DATA' }
  | { type: 'SUCCESS_SYNC_DATA', data: Metric[], lastSynced: number}
  | { type: 'ERROR_SYNC_DATA', error: string }
  | { type: 'BEGIN_CHECK_LOGIN' }
  | { type: 'SUCCESS_CHECK_LOGIN', accessToken: string, lastAuthenticated: number }
  | { type: 'ERROR_CHECK_LOGIN', error: string }
  | { type: 'REQUEST_LOGOUT' }
  | { type: 'SUCCESS_LOGOUT' }
  | { type: 'REQUEST_SYNC' }
  | { type: 'REQUEST_RESTORE_CACHE' }
  | { type: 'SUCCESS_RESTORE_CACHE', data: Metric[] }
  | { type: 'ERROR_RESTORE_CACHE', error: string }
  | ChartAction
  ;
