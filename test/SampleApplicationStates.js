import {
  MoodWithEntries,
  MoodWithoutEntries,
  BurnsWithEntries,
  BurnsWithoutEntries,
} from './SampleMetrics';

export const INITIAL_STATE = {
  metrics: {
    isSyncing: false,
    isSynced: true,
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
    isSynced: true,
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

export const STATE_WITH_LOTS_OF_METRICS = {
  metrics: {
    isSyncing: false,
    isSynced: true,
    lastSynced: null,
    items: [
      MoodWithEntries,
      BurnsWithEntries,
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

export const STATE_EDITING_METRIC1_MODIFIED = {
  metrics: {
    isSyncing: false,
    isSynced: true,
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
    editedMetric: {
      id: MoodWithEntries.id,
      props: {
        ...MoodWithEntries.props,
        maxValue: 12,
      },
    },
    isModified: true,
  },
};

export const STATE_EDITING_METRIC1_NOT_MODIFIED = {
  metrics: {
    isSyncing: false,
    isSynced: true,
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
    editedMetric: {
      id: MoodWithEntries.id,
      props: MoodWithEntries.props,
    },
    isModified: false,
  },
};
