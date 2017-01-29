// @flow
import type { Action } from './actionTypes';

export type Chart = {
    id: number,
    metrics: {
      id: number,
      visible: bool,
    }[],
    animation?: {
      target: {
        zoomFactor?: number,
        viewCenter?: number,
      },
      finishTime: number,
    },
    zoomFactor: number,
    viewCenter: number,
};

export type MetricType = 'int';

export type ColorGroup = {
  minValue: number,
  maxValue: number,
  color: string,
};

export type NullableColorGroup = {
  minValue?: number,
  maxValue?: number,
  color: string,
};

export type MetricProps = {
  name: string,
  maxValue: number,
  minValue: number,
  colorGroups: ColorGroup[],
  type: MetricType,
};

export type NullableMetricProps = {
  name?: string,
  maxValue?: number,
  minValue?: number,
  colorGroups?: NullableColorGroup[],
  type?: MetricType,
};

export type EditedMetricProps = {
  name: string,
  maxValue?: number,
  minValue?: number,
  colorGroups: NullableColorGroup[],
  type?: MetricType,
};

export type MetricEntry = {
  date: string,
  value: number,
};

export type Metric = {
  id: number,
  props: MetricProps,
  lastModified?: number,
  entries: MetricEntry[],
};

export type EditedMetric = {
  id: number,
  props: {
    name: string,
    maxValue?: number,
    minValue?: number,
    colorGroups: NullableColorGroup[],
  },
};

export type AuthenticationState = {
  isAuthenticated: boolean,
  isAuthenticating: boolean,
  accessToken?: string,
  error?: string,
  lastAuthenticated?: number,
};

export type MetricsState = {
  isSyncing: boolean,
  isSynced: boolean,
  lastSynced?: number,
  items?: Metric[],
  error?: string,
};

export type ModalAction = {
  label: string,
  action: Action, // TODO create action types
};

export type Modal = {
  title: string,
  message: string,
  actions: {
    confirm: ModalAction,
    cancel: ModalAction,
  },
};

export type SettingsState = {
    editedMetric?: EditedMetric,
    isModified: boolean,
};

export type ApplicationState = {
  metrics: MetricsState,
  charts: Chart[],
  authentication: AuthenticationState,
  modals: Modal[],
  settings: SettingsState,
};
