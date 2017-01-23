/* global window localStorage */
import { put, select, call } from 'redux-saga/effects';
import { takeLatest, takeEvery } from 'redux-saga';
import Dropbox from 'dropbox';
import queryString from 'query-string';
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
} from './actions';
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
} from './lib';

export function* syncData() {
  const authentication = yield select(getAuthentication);
  const accessToken = authentication.accessToken;
  /*
   * We download the data from Dropbox,
   * then we compare the metrics on the server with the metrics in the app state:
   * - For metric props, we take the one with the newer `lastModified` entry.
   * - For entries, we just merge the arrays, keeping them sorted by date.
   */
  if (!accessToken) {
    yield put(errorSyncData('Not authenticated'));
  } else {
    yield put(requestRestoreCache());
    const metricsFromStore = yield select(getMetricsItems);
    const localMetrics = metricsFromStore || [];
    const dbx = new Dropbox({ accessToken });
    const apiResponse = yield call(downloadFileAsJSON, dbx, DATA_FILE_PATH);
    if (!apiResponse.ok && apiResponse.error !== 'Error: File not found') {
      localStorage.metrics = JSON.stringify(localMetrics);
      yield put(errorSyncData(apiResponse.error));
    } else {
      const remoteMetrics = apiResponse.data ? apiResponse.data : [];
      const mergedMetrics = mergeMetrics(localMetrics.concat(remoteMetrics));
      localStorage.metrics = JSON.stringify(mergedMetrics);
      const uploadResponse = yield call(
        uploadAsJSON,
        dbx,
        DATA_FILE_PATH,
        mergedMetrics,
      );
      if (!uploadResponse.ok) {
        yield put(errorSyncData('Upload error'));
        return;
      }

      yield put(successSyncData(mergedMetrics, (new Date()).getTime()));
    }
  }
}

export function* restoreCache() {
  const metricsItems = yield select(getMetricsItems);
  if (metricsItems === null && typeof localStorage.metrics === 'string') {
    const restoredMetrics = JSON.parse(localStorage.metrics);
    if (restoredMetrics instanceof Array && isValidMetricsArray(restoredMetrics)) {
      yield put(successRestoreCache(restoredMetrics));
      return;
    }
  }

  yield put(errorRestoreCache('Either no cached data present or data already loaded'));
}

export function* checkLogin() {
  // Find access token:
  // 1. Try local storage.
  const localToken = localStorage.accessToken;
  // 2. Try URL hash -- URL hash overrules local storage.
  const hashToken = queryString.parse(window.location.hash).access_token;
  const token = hashToken || localToken;
  // 3.1. If we have a token, succeed.
  if (token) {
    localStorage.accessToken = token;
    window.location.hash = '';
    const lastAuthenticated = (new Date()).getTime();
    yield put(successCheckLogin(token, lastAuthenticated));
  } else { // 3.2. If we don't have a token, fail.
    yield put(errorCheckLogin('No token found'));
  }
}

export function* executeConfirmModal() {
  const modals = yield select(getModals);
  if (modals.length < 1) {
    yield put(errorConfirmModal());
  } else {
    yield put(modals[0].actions.confirm.action);
    yield put(successConfirmModal());
  }
}

export function* executeCancelModal() {
  const modals = yield select(getModals);
  if (modals.length < 1) {
    yield put(errorCancelModal());
  } else {
    yield put(modals[0].actions.cancel.action);
    yield put(successCancelModal());
  }
}

export function* executeLogout() {
  delete localStorage.accessToken;
  yield put(successLogout());
}

export function* executeSyncData() {
  yield put(beginSyncData());
}

export function* watcherSaga() {
  yield takeEvery('LOG_METRIC', executeSyncData);
  yield takeEvery('UPDATE_METRIC', executeSyncData);
  yield takeEvery('DELETE_METRIC', executeSyncData);
  yield takeEvery('REORDER_METRICS', executeSyncData);
  yield takeLatest('BEGIN_CHECK_LOGIN', checkLogin);
  yield takeLatest('BEGIN_SYNC_DATA', syncData);
  yield takeEvery('REQUEST_CONFIRM_MODAL', executeConfirmModal);
  yield takeEvery('REQUEST_CANCEL_MODAL', executeCancelModal);
  yield takeEvery('REQUEST_LOGOUT', executeLogout);
  yield takeEvery('REQUEST_RESTORE_CACHE', restoreCache);
}
