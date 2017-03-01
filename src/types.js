// @flow
import type { TAction } from './actionTypes';

export type TChartLine = {
  +metricId: number,
  +mode: 'on' | 'off' | 'loess',
  +color: string,
};

export type TChart = {
  +id: number;
  +lines: TChartLine[];
  +animation?: {
    +target: {
      +zoomFactor?: number,
      +viewCenter?: number,
    },
    +finishTime: number,
  },
  +zoomFactor: number,
  +viewCenter: number,
};

export type TMetricType = 'int';

export type TColorGroup = {
  +minValue: number,
  +maxValue: number,
  +color: string,
};

export type TEditedColorGroup = {
  +minValue: ?number,
  +maxValue: ?number,
  +color: string,
};

export type TNullableColorGroup = {
  +minValue?: ?number | string,
  +maxValue?: ?number | string,
  +color?: string,
};

export type TMetricProps = {
  +name: string,
  +maxValue: number,
  +minValue: number,
  // $FlowFixMe
  +colorGroups: TColorGroup[],
  +type: TMetricType,
};

export type TNullableMetricProps = {
  +name?: string,
  +maxValue?: ?number | string,
  +minValue?: ?number | string,
  +colorGroups?: TNullableColorGroup[],
  +type?: ?TMetricType,
};

export type TEditedMetricProps = {
  +name: string,
  +maxValue: ?number,
  +minValue: ?number,
  +colorGroups: TEditedColorGroup[],
  +type: ?TMetricType,
};

export type TMetricEntry = {
  +date: string,
  +value: number,
};

export type TMetric = {
  +id: number,
  +props: TMetricProps,
  +lastModified?: number,
  +entries: TMetricEntry[],
};

export type TOldMetric = {
  id: number,
  name?: ?string,
  maxValue?: ?number,
  minValue?: ?number,
  type?: ?TMetricType,
  colorGroups?: ?TColorGroup[],
  entries?: ?TMetricEntry[],
};

export type TEditedMetric = {
  +id: number,
  +props: TEditedMetricProps,
};

export type TAuthenticationState = {
  +isAuthenticated: boolean,
  +isAuthenticating: boolean,
  +accessToken?: string,
  +error?: string,
  +lastAuthenticated?: number,
};

export type TMetricsState = {
  +isSyncing: boolean,
  +isSynced: boolean,
  +lastSynced?: number,
  +items?: TMetric[],
  +error?: string,
};

export type TModalAction = {
  +label: string,
  +action: TAction,
};

export type TModal = {
  +title: string,
  +message: string,
  +actions: {
    +confirm: TModalAction,
    +cancel: TModalAction,
  },
  +userResponse?: 'confirm' | 'cancel' | null,
};

export type TSettingsState = {
  +editedMetric?: TEditedMetric,
  +isModified: boolean,
  +error?: string,
};

export type TChartsState = TChart[];

export type TApplicationState = {
  +metrics: TMetricsState,
  +charts: TChartsState,
  +authentication: TAuthenticationState,
  +modals: TModal[],
  +settings: TSettingsState,
};
