/* @flow */
import { takeLatest, delay } from 'redux-saga';
import moment from 'moment';
import { select, put } from '../effect-generators';
import { beginZoom, setMsPerPx, finishZoom } from './actions';
import type { TRequestZoomAction } from './actionTypes';
import type { TChart } from '../types';
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

export default function* rootSaga(): Generator<any, any, any> {
  yield* takeLatest('charts/REQUEST_ZOOM', animateZoom);
}

