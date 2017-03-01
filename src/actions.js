/* @flow */
import type { TNullableMetricProps, TMetric, TMetricProps, TEditedMetricProps } from './types';
import type {
  TLogMetricAction,
  TStartEditingAction,
  TRequestUpdateMetricAction,
  TSuccessUpdateMetricAction,
  TErrorUpdateMetricAction,
  TStopEditingAction,
  TAddMetricAction,
  TReorderMetricsAction,
  TDeleteMetricAction,
  TUpdateEditedMetricAction,
  TRequestConfirmModalAction,
  TRequestCancelModalAction,
  TSuccessConfirmModalAction,
  TErrorConfirmModalAction,
  TSuccessCancelModalAction,
  TErrorCancelModalAction,
  TBeginSyncDataAction,
  TSuccessSyncDataAction,
  TErrorSyncDataAction,
  TBeginCheckLoginAction,
  TSuccessCheckLoginAction,
  TErrorCheckLoginAction,
  TRequestLogoutAction,
  TSuccessLogoutAction,
  TRequestSyncAction,
  TRequestRestoreCacheAction,
  TSuccessRestoreCacheAction,
  TErrorRestoreCacheAction,
 } from './actionTypes';

export function logMetric(metricId: number, date: string, value: number): TLogMetricAction {
  return { type: 'LOG_METRIC', metricId, date, value };
}

export function startEditingMetric(metricId: number, discard?: boolean = false): TStartEditingAction {
  return { type: 'START_EDITING', metricId, discard };
}

export function requestUpdateMetric(metricId: number, newProps: TEditedMetricProps): TRequestUpdateMetricAction {
  return { type: 'REQUEST_UPDATE_METRIC', metricId, newProps };
}

export function successUpdateMetric(metricId: number, newProps: TMetricProps, lastModified: number): TSuccessUpdateMetricAction {
  return { type: 'SUCCESS_UPDATE_METRIC', metricId, newProps, lastModified };
}

export function errorUpdateMetric(invalidFields: string[]): TErrorUpdateMetricAction {
  return { type: 'ERROR_UPDATE_METRIC', invalidFields };
}

export function stopEditing(discard?:boolean = false): TStopEditingAction {
  return { type: 'STOP_EDITING', discard };
}

export function addMetric(discard?: boolean = false): TAddMetricAction {
  return { type: 'ADD_METRIC', discard };
}

export function reorderMetrics(metricId: number, direction: 'up' | 'down'): TReorderMetricsAction {
  return { type: 'REORDER_METRICS', metricId, direction };
}

export function deleteMetric(metricId: number, confirm?: boolean = false): TDeleteMetricAction {
  return { type: 'DELETE_METRIC', metricId, confirm };
}

export function updateEditedMetric(updatedProps: TNullableMetricProps): TUpdateEditedMetricAction {
  return { type: 'UPDATE_EDITED_METRIC', updatedProps };
}

export function requestConfirmModal(): TRequestConfirmModalAction {
  return { type: 'REQUEST_CONFIRM_MODAL' };
}

export function requestCancelModal(): TRequestCancelModalAction {
  return {
    type: 'REQUEST_CANCEL_MODAL',
  };
}

export function successConfirmModal(): TSuccessConfirmModalAction {
  return { type: 'SUCCESS_CONFIRM_MODAL' };
}

export function errorConfirmModal(): TErrorConfirmModalAction {
  return { type: 'ERROR_CONFIRM_MODAL' };
}

export function successCancelModal(): TSuccessCancelModalAction {
  return { type: 'SUCCESS_CANCEL_MODAL' };
}

export function errorCancelModal(): TErrorCancelModalAction {
  return { type: 'ERROR_CANCEL_MODAL' };
}

export function beginSyncData(): TBeginSyncDataAction {
  return { type: 'BEGIN_SYNC_DATA' };
}

export function successSyncData(data: TMetric[], lastSynced: number): TSuccessSyncDataAction {
  return { type: 'SUCCESS_SYNC_DATA', data, lastSynced };
}

export function errorSyncData(error: string): TErrorSyncDataAction {
  return { type: 'ERROR_SYNC_DATA', error };
}

export function beginCheckLogin(): TBeginCheckLoginAction {
  return { type: 'BEGIN_CHECK_LOGIN' };
}

export function successCheckLogin(accessToken: string, lastAuthenticated: number): TSuccessCheckLoginAction {
  return { type: 'SUCCESS_CHECK_LOGIN', accessToken, lastAuthenticated };
}

export function errorCheckLogin(error: string): TErrorCheckLoginAction {
  return { type: 'ERROR_CHECK_LOGIN', error };
}

export function requestLogout(): TRequestLogoutAction {
  return { type: 'REQUEST_LOGOUT' };
}

export function successLogout(): TSuccessLogoutAction {
  return { type: 'SUCCESS_LOGOUT' };
}

export function requestSync(): TRequestSyncAction {
  return { type: 'REQUEST_SYNC' };
}

export function requestRestoreCache(): TRequestRestoreCacheAction {
  return { type: 'REQUEST_RESTORE_CACHE' };
}

export function successRestoreCache(data: TMetric[]): TSuccessRestoreCacheAction {
  return { type: 'SUCCESS_RESTORE_CACHE', data };
}

export function errorRestoreCache(error: string): TErrorRestoreCacheAction {
  return { type: 'ERROR_RESTORE_CACHE', error };
}
