/* @flow */
import { takeLatest, delay } from 'redux-saga';
import { select, put } from '../effect-generators';
import { beginZoom, setZoomFactor, finishZoom } from './actions';
import type { TRequestZoomAction } from './actionTypes';
import type { TChart } from '../types';
import { getChart } from './selectors';

export function* animateZoom(action: TRequestZoomAction): Generator<any, any, any> {
  const animationDuration = 200; // ms
  const delayDuration = 10; // ms between animation frames
  const chart: ?TChart = yield* select(getChart, action.chartId);
  if (chart == null) {
    yield* put(finishZoom(action.chartId));
    return;
  }

  const finishTime = (new Date()).getTime() + animationDuration;
  const targetZoomFactor = chart.animation != null && chart.animation.target.zoomFactor != null
    ? chart.animation.target.zoomFactor * action.zoomFactor
    : chart.zoomFactor * action.zoomFactor;
  yield* put(beginZoom(action.chartId, finishTime, targetZoomFactor));

  const totalZoomFactorDiff = targetZoomFactor - chart.zoomFactor;
  let currentZoomFactor = chart.zoomFactor;
  let stepsLeft = animationDuration / delayDuration;
  let fractionOfAnimationLeft = 1;
  for (let currentTime = (new Date()).getTime(); currentTime < finishTime; currentTime = (new Date()).getTime()) {
    fractionOfAnimationLeft = (targetZoomFactor - currentZoomFactor) / totalZoomFactorDiff;
    stepsLeft = (animationDuration / delayDuration) * fractionOfAnimationLeft;
    currentZoomFactor += fractionOfAnimationLeft / stepsLeft;
    yield* put(setZoomFactor(action.chartId, currentZoomFactor));
    yield delay(delayDuration);
  }
  yield* put(setZoomFactor(action.chartId, targetZoomFactor));
  yield delay(delayDuration);
  yield* put(finishZoom(action.chartId));
}

export default function* rootSaga(): Generator<any, any, any> {
  yield* takeLatest('charts/REQUEST_ZOOM', animateZoom);
}
