/* @flow */
import type { TApplicationState } from './types';

export const getAuthentication = (state: TApplicationState) => state.authentication;
export const getMetrics = (state: TApplicationState) => state.metrics;
export const getMetricsItems = (state: TApplicationState) => state.metrics.items;
export const getSettings = (state: TApplicationState) => state.settings;
export const getModals = (state: TApplicationState) => state.modals;
