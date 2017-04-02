/* @flow */
import {
  takeLatest,
  takeEvery,
  delay,
} from 'redux-saga';
import moment from 'moment';
import { select, put } from '../effect-generators';
import {
  beginZoom,
  setMsPerPx,
  finishZoom,
  createCharts,
} from './actions';
import type { TRequestZoomAction } from './actionTypes';
import type {
  TSuccessUpdateMetricAction,
  TDeleteMetricAction,
} from '../actionTypes';
import type {
  TMetric,
  TChart,
} from '../types';
import { getMetricsItems } from '../selectors';
import { getChart } from './selectors';

export function* animateZoom(action: TRequestZoomAction): Generator<any, any, any> {
  const animationDuration = 200; // ms
  const delayDuration = 6; // ms between animation frames
  const chart: ?TChart = yield* select(getChart, action.chartId);
  if (chart == null) {
    yield* put(finishZoom(action.chartId));
    return;
  }

  const finishTime = +moment() + animationDuration;
  /* We divide by the zoom factor because zooming in (i.e. factor > 1) causes the ms/px
   * ratio to decrease. */
  const targetMsPerPx = chart.animation != null && chart.animation.target.msPerPx != null
    ? chart.animation.target.msPerPx / action.factor
    : chart.msPerPx / action.factor;
  yield* put(beginZoom(action.chartId, finishTime, targetMsPerPx));

  const startTime = +moment();
  const initialMsPerPx = chart.msPerPx;
  let currentMsPerPx = chart.msPerPx;
  let fractionOfAnimationLeft = 1;
  let fractionOfAnimationCompleted = 0;
  for (let currentTime = +moment(); currentTime < finishTime; currentTime = +moment()) {
    fractionOfAnimationLeft = (finishTime - currentTime) / (finishTime - startTime);
    fractionOfAnimationCompleted = 1 - fractionOfAnimationLeft;
    currentMsPerPx = (fractionOfAnimationLeft * initialMsPerPx) + (fractionOfAnimationCompleted * targetMsPerPx);
    yield* put(setMsPerPx(action.chartId, currentMsPerPx));
    yield delay(delayDuration);
  }
  yield* put(setMsPerPx(action.chartId, targetMsPerPx));
  yield delay(delayDuration);
  yield* put(finishZoom(action.chartId));
}

export function* updateCharts(action: TDeleteMetricAction | TSuccessUpdateMetricAction): Generator<any, any, any> {
  if (action.type === 'DELETE_METRIC' && action.confirm !== true) {
    return;
  }
  const metrics: ?TMetric[] = yield* select(getMetricsItems);
  if (metrics == null) {
    return;
  }
  yield* put(createCharts(metrics));
}

export default function* rootSaga(): Generator<any, any, any> {
  yield takeLatest('charts/REQUEST_ZOOM', animateZoom);
  yield takeEvery('DELETE_METRIC', updateCharts);
  yield takeEvery('SUCCESS_UPDATE_METRIC', updateCharts);
}

