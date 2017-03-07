// @flow
import type { TNullableMetricProps, TMetric, TMetricProps, TEditedMetricProps } from './types';
import type { TChartsAction } from './Charts/actionTypes';

export type TDefaultAction = { +type: 'DEFAULT_ACTION' };
export type TLogMetricAction = { +type: 'LOG_METRIC', +metricId: number, +date: string, +value: number };
export type TStartEditingAction = { +type: 'START_EDITING', +metricId: number, +discard?: boolean };
export type TRequestUpdateMetricAction = { +type: 'REQUEST_UPDATE_METRIC', +metricId: number, +newProps: TEditedMetricProps };
export type TSuccessUpdateMetricAction = { +type: 'SUCCESS_UPDATE_METRIC', +metricId: number, +newProps: TMetricProps, +lastModified: number };
export type TErrorUpdateMetricAction = { +type: 'ERROR_UPDATE_METRIC', +invalidFields: string[] };
export type TStopEditingAction = { +type: 'STOP_EDITING', +discard?: boolean };
export type TAddMetricAction = { +type: 'ADD_METRIC', +discard?: boolean };
export type TReorderMetricsAction = { +type: 'REORDER_METRICS', +metricId: number, +direction: 'up' | 'down' };
export type TDeleteMetricAction = { +type: 'DELETE_METRIC', +metricId: number, +confirm?: boolean };
export type TUpdateEditedMetricAction = { +type: 'UPDATE_EDITED_METRIC', +updatedProps: TNullableMetricProps };
export type TRequestConfirmModalAction = { +type: 'REQUEST_CONFIRM_MODAL' };
export type TRequestCancelModalAction = { +type: 'REQUEST_CANCEL_MODAL' };
export type TSuccessConfirmModalAction = { +type: 'SUCCESS_CONFIRM_MODAL' };
export type TErrorConfirmModalAction = { +type: 'ERROR_CONFIRM_MODAL' };
export type TSuccessCancelModalAction = { +type: 'SUCCESS_CANCEL_MODAL' };
export type TErrorCancelModalAction = { +type: 'ERROR_CANCEL_MODAL' };
export type TBeginSyncDataAction = { +type: 'BEGIN_SYNC_DATA' };
export type TSuccessSyncDataAction = { +type: 'SUCCESS_SYNC_DATA', +data: TMetric[], +lastSynced: number};
export type TErrorSyncDataAction = { +type: 'ERROR_SYNC_DATA', +error: string };
export type TBeginCheckLoginAction = { +type: 'BEGIN_CHECK_LOGIN' };
export type TSuccessCheckLoginAction = { +type: 'SUCCESS_CHECK_LOGIN', +accessToken: string, +lastAuthenticated: number };
export type TErrorCheckLoginAction = { +type: 'ERROR_CHECK_LOGIN', +error: string };
export type TRequestLogoutAction = { +type: 'REQUEST_LOGOUT' };
export type TSuccessLogoutAction = { +type: 'SUCCESS_LOGOUT' };
export type TRequestSyncAction = { +type: 'REQUEST_SYNC' };
export type TRequestRestoreCacheAction = { +type: 'REQUEST_RESTORE_CACHE' };
export type TSuccessRestoreCacheAction = { +type: 'SUCCESS_RESTORE_CACHE', +data: TMetric[] };
export type TErrorRestoreCacheAction = { +type: 'ERROR_RESTORE_CACHE', +error: string };


export type TAction =
    TDefaultAction
  | TLogMetricAction
  | TStartEditingAction
  | TRequestUpdateMetricAction
  | TSuccessUpdateMetricAction
  | TErrorUpdateMetricAction
  | TStopEditingAction
  | TAddMetricAction
  | TReorderMetricsAction
  | TDeleteMetricAction
  | TUpdateEditedMetricAction
  | TRequestConfirmModalAction
  | TRequestCancelModalAction
  | TSuccessConfirmModalAction
  | TErrorConfirmModalAction
  | TSuccessCancelModalAction
  | TErrorCancelModalAction
  | TBeginSyncDataAction
  | TSuccessSyncDataAction
  | TErrorSyncDataAction
  | TBeginCheckLoginAction
  | TSuccessCheckLoginAction
  | TErrorCheckLoginAction
  | TRequestLogoutAction
  | TSuccessLogoutAction
  | TRequestSyncAction
  | TRequestRestoreCacheAction
  | TSuccessRestoreCacheAction
  | TErrorRestoreCacheAction
  | TChartsAction
  ;
