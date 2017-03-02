/* @flow */
import {
  values,
  map,
  flattenDeep,
  groupBy,
  omit,
  min,
  max,
} from 'lodash';
import type {
  TBeginZoomAction,
  TSetZoomFactorAction,
  TFinishZoomAction,
  TCycleModeAction,
  TScrollByAction,
  TCreateChartsAction,
} from './actionTypes';
import type { TAction } from '../actionTypes';
import type { TChart, TMetric } from '../types';
import { MS_PER_PX, FOUR_WEEKS, LINE_COLORS } from './constants';

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

function cycleMode(state: TChartsState, action: TCycleModeAction): TChartsState {
  const nextMode = {
    on: 'loess',
    off: 'on',
    loess: 'off',
  };
  return state.map((chart: TChart) => ({
    ...chart,
    lines: chart.lines.map(line => ({
      metricId: line.metricId,
      mode: action.metricId === line.metricId ? nextMode[line.mode] : line.mode,
      color: line.color,
    })),
  }));
}

function scrollBy(state: TChartsState, action: TScrollByAction): TChartsState {
  const index = state.findIndex((chart: TChart) => chart.id === action.chartId);
  if (index === -1) {
    return state;
  }
  const chart: TChart = state[index];
  const scrollDistance: number = action.deltaX * (chart.zoomFactor * MS_PER_PX);
  return [
    ...state.slice(0, index),
    {
      ...chart,
      viewCenter: chart.viewCenter + scrollDistance,
    },
    ...state.slice(index + 1, state.length),
  ];
}

function createCharts(state: TChartsState, action: TCreateChartsAction): TChartsState {
  const { metrics } = action;
  const metricGroups: TMetric[][] = values(groupBy(metrics, m => JSON.stringify(omit(m.props, 'name'))));
  return map(metricGroups, (metricGroup, index) => {
    const allEntryDates: number[] = flattenDeep(map(metricGroup, metric => map(metric.entries, entry => (new Date(entry.date)).getTime())));
    let zoomFactor: number = 1;
    let viewCenter: number = 0;
    if (allEntryDates.length > 1) {
      const dateRange: [number, number] = [min(allEntryDates), max(allEntryDates)];
      if (dateRange[1] - dateRange[0] > FOUR_WEEKS) {
        viewCenter = dateRange[1] - (FOUR_WEEKS / 2);
      } else {
        viewCenter = (dateRange[1] + dateRange[0]) / 2;
        zoomFactor = MS_PER_PX / (dateRange[1] - dateRange[0]);
      }
    }

    return {
      id: index,
      lines: map(metricGroup, metric => ({ metricId: metric.id, mode: 'on', color: LINE_COLORS[metric.id % LINE_COLORS.length] })),
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
    case 'charts/CYCLE_MODE':
      return cycleMode(state, action);
    case 'charts/SCROLL_BY':
      return scrollBy(state, action);
    case 'charts/CREATE_CHARTS':
      return createCharts(state, action);
    default:
      return state;
  }
}

