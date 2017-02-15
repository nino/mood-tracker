/* @flow */
import _ from 'lodash';
import type {
  TBeginZoomAction,
  TSetZoomFactorAction,
  TFinishZoomAction,
  TToggleVisibilityAction,
  TScrollByAction,
  TCreateChartsAction,
} from './actionTypes';
import type { TAction } from '../actionTypes';
import type { TChart, TMetric, TMetricEntry } from '../types';
import { MS_PER_PX, FOUR_WEEKS } from './constants';

export type TChartsState = TChart[];

const INITIAL_STATE: TChartsState = [];

function requestZoom(state: TChartsState): TChartsState {
  return state;
}

function beginZoom(state: TChartsState, action: TBeginZoomAction): TChartsState {
  const index = state.findIndex((chart: TChart) => chart.id === action.chartId);
  return index === -1 ? state : [
    ...state.slice(0, index),
    {
      ...state[index],
      animation: {
        finishTime: action.finishTime,
        target: { zoomFactor: action.targetZoomFactor },
      },
    },
    ...state.slice(index + 1, state.length),
  ];
}

function setZoomFactor(state: TChartsState, action: TSetZoomFactorAction): TChartsState {
  const index = state.findIndex((chart: TChart) => chart.id === action.chartId);
  if (index === -1) {
    return state;
  }
  return [
    ...state.slice(0, index),
    { ...state[index], zoomFactor: action.zoomFactor },
    ...state.slice(index + 1, state.length),
  ];
}

function finishZoom(state: TChartsState, action: TFinishZoomAction): TChartsState {
  const index = state.findIndex((chart: TChart) => chart.id === action.chartId);
  if (index === -1) {
    return state;
  }

  const updatedChart = { ...state[index] };
  delete updatedChart.animation;

  return [
    ...state.slice(0, index),
    updatedChart,
    ...state.slice(index + 1, state.length),
  ];
}

function toggleVisibility(state: TChartsState, action: TToggleVisibilityAction): TChartsState {
  return state.map((chart: TChart) => ({
    ...chart,
    metrics: chart.metrics.map(item => ({
      id: item.id,
      visible: item.id === action.metricId ? !item.visible : item.visible,
    })),
  }));
}

function scrollBy(state: TChartsState, action: TScrollByAction): TChartsState {
  const index = state.findIndex((chart: TChart) => chart.id === action.chartId);
  if (index === -1) { return state; }
  const chart: TChart = state[index];
  const scrollDistance: number = (action.deltaX / chart.zoomFactor) * MS_PER_PX;
  return [
    ...state.slice(0, index),
    { ...chart, viewCenter: chart.viewCenter + scrollDistance },
    ...state.slice(index + 1, state.length),
  ];
}

function createCharts(state: TChartsState, action: TCreateChartsAction): TChartsState {
  const { metrics } = action;
  const metricGroups: TMetric[][] = _.values(_.groupBy(metrics, m => JSON.stringify(_.omit(m.props, 'name'))));
  return _.map(metricGroups, (metricGroup, index) => {
    const allEntryDates: number[] = _.flattenDeep(_.map(metricGroup, metric => _.map(metric.entries, entry => (new Date(entry.date)).getTime())));
    let zoomFactor: number = 1;
    let viewCenter: number = 0;
    if (allEntryDates.length > 1) {
      const dateRange: [number, number] = [_.min(allEntryDates), _.max(allEntryDates)];
      if (dateRange[1] - dateRange[0] > FOUR_WEEKS) {
        viewCenter = dateRange[1] - (FOUR_WEEKS / 2);
      } else {
        viewCenter = (dateRange[1] + dateRange[0]) / 2;
        zoomFactor = MS_PER_PX / (dateRange[1] - dateRange[0]);
      }
    }

    return {
      id: index,
      metrics: _.map(metricGroup, metric => ({ id: metric.id, visible: true })),
      viewCenter,
      zoomFactor,
    };
  });
}

export default function reducer(state: TChartsState = INITIAL_STATE, action?: TAction): TChartsState {
  if (!action || !action.type) {
    return state;
  }

  switch (action.type) {
    case 'charts/DEFAULT_ACTION':
      return state;
    case 'charts/REQUEST_ZOOM':
      return requestZoom(state, action);
    case 'charts/BEGIN_ZOOM':
      return beginZoom(state, action);
    case 'charts/SET_ZOOM_FACTOR':
      return setZoomFactor(state, action);
    case 'charts/FINISH_ZOOM':
      return finishZoom(state, action);
    case 'charts/TOGGLE_VISIBILITY':
      return toggleVisibility(state, action);
    case 'charts/SCROLL_BY':
      return scrollBy(state, action);
    case 'charts/CREATE_CHARTS':
      return createCharts(state, action);
    default:
      return state;
  }
}
