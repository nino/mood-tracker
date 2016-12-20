import { MoodWithEntries, MoodWithoutEntries, BurnsWithEntries, BurnsWithoutEntries } from './SampleMetrics';

export const INITIAL_STATE = {
  metrics: {
    isSyncing: false,
    isLoaded: true,
    lastSynced: null,
    items: [],
    hasError: false,
  },
  authentication: {
    isAuthenticated: false,
    hasError: false,
    accessToken: null,
    lastAuthenticated: null,
    isAuthenticating: false,
  },
  modals: [],
  settings: {
    editedMetric: null,
    isModified: false,
  },
};

export const STATE_WITH_SOME_METRICS = {
  metrics: {
    isSyncing: false,
    isLoaded: true,
    lastSynced: null,
    items: [
      MoodWithEntries,
      BurnsWithoutEntries,
    ],
    hasError: false,
  },
  authentication: {
    isAuthenticated: false,
    hasError: false,
    accessToken: null,
    lastAuthenticated: null,
    isAuthenticating: false,
  },
  modals: [],
  settings: {
    editedMetric: null,
    isModified: false,
  },
};

export const EDITING_SETTINGS = null; // TODO
