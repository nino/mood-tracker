import { put, select, call } from 'redux-saga/effects';
import { takeLatest, takeEvery } from 'redux-saga';
import Dropbox from 'dropbox';
import { DATA_FILE_PATH } from './constants';
import queryString from 'query-string';
import {
  successCheckLogin,
  errorCheckLogin,
  successSyncData,
  errorSyncData,
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
    return;
  }
  else {
    const metricsFromStore = yield select(getMetricsItems);
    const localMetrics = metricsFromStore ? metricsFromStore : [];
    const dbx = new Dropbox({ accessToken });
    const apiResponse = yield call(downloadFileAsJSON, dbx, DATA_FILE_PATH);
    if (!apiResponse.ok && apiResponse.error !== 'Error: File not found') {
      localStorage.metrics = localMetrics;
      yield put(errorSyncData(apiResponse.error));
    }
    else {
      const remoteMetrics = apiResponse.data ? apiResponse.data : [];
      const mergedMetrics = mergeMetrics(localMetrics.concat(remoteMetrics));
      localStorage.metrics = mergedMetrics;
      const uploadResponse = yield call(
        uploadAsJSON,
        dbx,
        DATA_FILE_PATH,
        mergedMetrics
      );
      if (!uploadResponse.ok) {
        yield put(errorSyncData('Upload error'));
        return;
      }
      yield put(successSyncData(mergedMetrics, (new Date()).getTime()));
    }
  }
}

export function* checkLogin() {
  // Find access token:
  // 1. Try local storage.
  const localToken = localStorage.accessToken;
  // 2. Try URL hash -- URL hash overrules local storage.
  const hashToken = queryString.parse(window.location.hash).access_token;
  const token = hashToken ? hashToken : localToken;
  // 3.1. If we have a token, succeed.
  if (token) {
    localStorage.accessToken = token;
    window.location.hash = '';
    const lastAuthenticated = (new Date()).getTime();
    yield put(successCheckLogin(token, lastAuthenticated));
  }
  // 3.2. If we don't have a token, fail.
  else {
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

export function* watcherSaga() {
  yield takeLatest('begin check login', checkLogin);
  yield takeLatest('begin sync data', syncData);
  yield takeEvery('request confirm modal', executeConfirmModal);
  yield takeEvery('request cancel modal', executeCancelModal);
  yield takeEvery('request logout', executeLogout);
}
