import { takeLatest } from 'redux-saga';

export function* watcherSaga() {
  yield takeLatest('begin check login', checkLogin);
  yield takeLatest('begin sync data', syncData);
}
