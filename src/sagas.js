/* @flow */
/* global window localStorage Generator */
import { takeLatest, takeEvery } from 'redux-saga';
import Dropbox from 'dropbox';
import queryString from 'query-string';
import { put, select, call } from './effect-generators';
import { DATA_FILE_PATH } from './constants';
import {
  successCheckLogin,
  errorCheckLogin,
  beginSyncData,
  successSyncData,
  errorSyncData,
  requestRestoreCache,
  successRestoreCache,
  errorRestoreCache,
  successLogout,
  successConfirmModal,
  errorConfirmModal,
  successCancelModal,
  errorCancelModal,
  successUpdateMetric,
  errorUpdateMetric,
} from './actions';
import type {
  TAuthenticationState,
  TMetric,
  TMetricProps,
  TEditedColorGroup,
} from './types';
import {
  getAuthentication,
  getMetricsItems,
  getModals,
} from './selectors';
import {
  downloadFileAsJSON,
  mergeMetrics,
  uploadAsJSON,
  isValidMetricsArray,
  asTMetricProps,
} from './lib';
import type { TRequestUpdateMetricAction } from './actionTypes';
import chartSagas from './Charts/sagas';

export function* syncData(): Generator<any, any, any> {
  const authentication: TAuthenticationState = yield* select(getAuthentication);
  const accessToken = authentication.accessToken;
  /*
   * We download the data from Dropbox,
   * then we compare the metrics on the server with the metrics in the app state:
   * - For metric props, we take the one with the newer `lastModified` entry.
   * - For entries, we just merge the arrays, keeping them sorted by date.
   */
  if (!accessToken) {
    yield* put(errorSyncData('Not authenticated'));
  } else {
    yield* put(requestRestoreCache());
    const metricsFromStore = yield* select(getMetricsItems);
    const localMetrics = metricsFromStore || [];
    const dbx = new Dropbox({ accessToken });
    const apiResponse: { ok: false, error: string } | { ok: true, data: any[] } = yield* call(downloadFileAsJSON, dbx, DATA_FILE_PATH);
    if (apiResponse.ok === false && apiResponse.error !== 'Error: File not found') {
      localStorage.setItem('metrics', JSON.stringify(localMetrics));
      yield* put(errorSyncData(apiResponse.error));
    } else {
      const remoteMetrics = apiResponse.data ? apiResponse.data : [];
      const mergedMetrics = mergeMetrics(localMetrics.concat(remoteMetrics));
      localStorage.setItem('metrics', JSON.stringify(mergedMetrics));
      const uploadResponse: { ok: true} | { ok: false, error: string } = yield* call(
        uploadAsJSON,
        dbx,
        DATA_FILE_PATH,
        mergedMetrics,
      );
      if (!uploadResponse.ok) {
        yield* put(errorSyncData('Upload error'));
        return;
      }

      yield* put(successSyncData(mergedMetrics, (new Date()).getTime()));
    }
  }
}

export function* restoreCache(): Generator<any, any, any> {
  const metricsItems: ?TMetric[] = yield* select(getMetricsItems);
  try {
    const metricsCache = localStorage.getItem('metrics');
    if (metricsItems == null && metricsCache != null) {
      const restoredMetrics = JSON.parse(metricsCache);
      if (restoredMetrics instanceof Array && isValidMetricsArray(restoredMetrics)) {
        yield* put(successRestoreCache(restoredMetrics));
        return;
      }
    }
    yield* put(errorRestoreCache('Either no cached data present or data already loaded'));
  } catch (error) {
    yield* put(errorRestoreCache('Could not parse localStorage metrics'));
  }
}

export function* checkLogin(): Generator<any, any, any> {
  // Find access token:
  // 1. Try local storage.
  const localToken = localStorage.getItem('accessToken');
  // 2. Try URL hash -- URL hash overrules local storage.
  const hashToken: ?string = queryString.parse(window.location.hash).access_token;
  const token = hashToken || localToken;
  // 3.1. If we have a token, succeed.
  if (token) {
    localStorage.setItem('accessToken', token);
    window.location.hash = '';
    const lastAuthenticated = (new Date()).getTime();
    yield* put(successCheckLogin(token, lastAuthenticated));
  } else { // 3.2. If we don't have a token, fail.
    yield* put(errorCheckLogin('No token found'));
  }
}

export function* executeConfirmModal(): Generator<any, any, any> {
  const modals = yield* select(getModals);
  if (modals.length < 1) {
    yield* put(errorConfirmModal());
  } else {
    yield* put(modals[0].actions.confirm.action);
    yield* put(successConfirmModal());
  }
}

export function* executeCancelModal(): Generator<any, any, any> {
  const modals = yield* select(getModals);
  if (modals.length < 1) {
    yield* put(errorCancelModal());
  } else {
    yield* put(modals[0].actions.cancel.action);
    yield* put(successCancelModal());
  }
}

export function* executeLogout(): Generator<any, any, any> {
  localStorage.removeItem('accessToken');
  yield* put(successLogout());
}

export function* executeSyncData(): Generator<any, any, any> {
  yield put(beginSyncData());
}

export function* updateMetric(action: TRequestUpdateMetricAction): Generator<any, any, any> {
  const newProps: ?TMetricProps = asTMetricProps(action.newProps);
  if (newProps != null) {
    yield* put(successUpdateMetric(action.metricId, newProps, (new Date()).getTime()));
  } else {
    const invalidFields: string[] = [];
    Object.keys(action.newProps).forEach((key: string) => {
      if (action.newProps[key] == null) {
        invalidFields.push(key);
      }
    });
    action.newProps.colorGroups.forEach((colorGroup: TEditedColorGroup, index: number) => {
      Object.keys(colorGroup).forEach((key: string) => {
        if (colorGroup[key] == null) {
          invalidFields.push(`colorGroups/${index}/${key}`);
        }
      });
    });
    yield* put(errorUpdateMetric(invalidFields));
  }
}

export function* watcherSaga(): Generator<any, any, any> {
  yield takeEvery('LOG_METRIC', executeSyncData);
  yield takeEvery('SUCCESS_UPDATE_METRIC', executeSyncData);
  yield takeEvery('DELETE_METRIC', executeSyncData);
  yield takeEvery('REORDER_METRICS', executeSyncData);
  yield takeLatest('BEGIN_CHECK_LOGIN', checkLogin);
  yield takeLatest('BEGIN_SYNC_DATA', syncData);
  yield takeEvery('REQUEST_CONFIRM_MODAL', executeConfirmModal);
  yield takeEvery('REQUEST_CANCEL_MODAL', executeCancelModal);
  yield takeEvery('REQUEST_LOGOUT', executeLogout);
  yield takeEvery('REQUEST_RESTORE_CACHE', restoreCache);
  yield takeEvery('REQUEST_UPDATE_METRIC', updateMetric);
  yield chartSagas();
}
