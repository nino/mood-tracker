import { put, select, call } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import Dropbox from 'dropbox';
import { CLIENT_ID, DATA_FILE_PATH } from './constants';
import queryString from 'query-string';
import { successCheckLogin, errorCheckLogin, successSyncData, errorSyncData } from './actions';
import { getAuthentication, getMetricsItems } from './selectors';
import { downloadFileAsJSON, mergeMetrics } from './lib';

export function* syncData() {
  yield put(successSyncData({});
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
    yield put(errorCheckLogin('No token found'))
  }
}

export function* watcherSaga() {
  yield takeLatest('begin check login', checkLogin);
  yield takeLatest('begin sync data', syncData);
}
