// @flow
import type {
  TApplicationState,
  TAuthenticationState,
  TMetricsState,
  TModal,
  TSettingsState,
} from '../src/types';
import {
  MoodWithEntries,
  MoodWithoutEntries,
  BurnsWithEntries,
  BurnsWithoutEntries,
} from './SampleMetrics';

export const INITIAL_STATE: TApplicationState = {
  metrics: {
    isSyncing: false,
    isSynced: true,
    items: [],
  },
  authentication: {
    isAuthenticated: false,
    isAuthenticating: false,
  },
  modals: [],
  charts: [],
  settings: {
    isModified: false,
  },
};

export const STATE_WITH_SOME_METRICS: TApplicationState = {
  metrics: {
    isSyncing: false,
    isSynced: true,
    items: [
      MoodWithEntries,
      BurnsWithoutEntries,
    ],
  },
  authentication: {
    isAuthenticated: false,
    isAuthenticating: false,
  },
  modals: [],
  charts: [],
  settings: {
    isModified: false,
  },
};

export const STATE_WITH_LOTS_OF_METRICS: TApplicationState = {
  metrics: {
    isSyncing: false,
    isSynced: true,
    items: [
      MoodWithEntries,
      BurnsWithEntries,
    ],
  },
  authentication: {
    isAuthenticated: false,
    isAuthenticating: false,
  },
  modals: [],
  charts: [],
  settings: {
    isModified: false,
  },
};

export const STATE_EDITING_METRIC1_MODIFIED: TApplicationState = {
  metrics: {
    isSyncing: false,
    isSynced: true,
    items: [
      MoodWithEntries,
      BurnsWithoutEntries,
    ],
  },
  authentication: {
    isAuthenticated: false,
    isAuthenticating: false,
  },
  modals: [],
  charts: [],
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

export const STATE_EDITING_METRIC1_NOT_MODIFIED: TApplicationState = {
  metrics: {
    isSyncing: false,
    isSynced: true,
    items: [
      MoodWithEntries,
      BurnsWithoutEntries,
    ],
  },
  authentication: {
    isAuthenticated: false,
    isAuthenticating: false,
  },
  modals: [],
  charts: [],
  settings: {
    editedMetric: {
      id: MoodWithEntries.id,
      props: { ...MoodWithEntries.props },
    },
    isModified: false,
  },
};

export const authSubStates: { [string]: TAuthenticationState } = {
  authenticated: {
    isAuthenticated: true,
    isAuthenticating: false,
    accessToken: 'abc',
    lastAuthenticated: 123,
  },
  authenticating: {
    isAuthenticating: true,
    isAuthenticated: false,
    lastAuthenticated: 123,
  },
  notAuthenicatedNotAuthenticating: {
    isAuthenticating: false,
    isAuthenticated: false,
    lastAuthenticated: 0,
  },
  withError: {
    isAuthenticating: false,
    isAuthenticated: false,
    error: 'Could not authenticate',
  },
};

export const metricsSubStates: { [string]: TMetricsState } = {
  notSyncingWithData: {
    isSynced: false,
    isSyncing: false,
    items: [MoodWithEntries, BurnsWithoutEntries],
    lastSynced: 0,
  },
  notSyncingNoData: {
    isSynced: false,
    isSyncing: false,
  },
  syncingNoData: {
    isSynced: false,
    isSyncing: true,
  },
  syncingWithData: {
    isSynced: false,
    isSyncing: true,
    lastSynced: 123,
    items: [MoodWithEntries, BurnsWithoutEntries],
  },
  syncedMetricsWithEntries: {
    isSynced: true,
    isSyncing: false,
    lastSynced: 123,
    items: [MoodWithEntries, BurnsWithEntries],
  },
  syncedMetricsWithoutEntries: {
    isSynced: true,
    isSyncing: false,
    lastSynced: 123,
    items: [MoodWithoutEntries, BurnsWithoutEntries],
  },
  withErrorWithData: {
    isSynced: false,
    isSyncing: false,
    lastSynced: 123,
    items: [MoodWithoutEntries, BurnsWithoutEntries],
    error: 'Sync error',
  },
  withErrorNoData: {
    isSynced: false,
    isSyncing: false,
    error: 'Sync error',
  },
};

export const modalsSubStates: { [string]: TModal[] } = {
  noModals: [],
  oneModal: [{
    title: 'Test modal',
    message: '...',
    userResponse: null,
    actions: {
      confirm: {
        label: 'Yes',
        action: { type: 'DELETE_METRIC', metricId: 1 },
      },
      cancel: {
        label: 'No',
        action: { type: 'DEFAULT_ACTION' },
      },
    },
  }],
  answeredYesNoNull: [
    {
      title: 'Test modal 1',
      message: '...',
      userResponse: 'confirm',
      actions: {
        confirm: {
          label: 'Yes',
          action: { type: 'DELETE_METRIC', metricId: 1 },
        },
        cancel: {
          label: 'No',
          action: { type: 'DEFAULT_ACTION' },
        },
      },
    },
    {
      title: 'Test modal 2',
      message: '...',
      userResponse: 'cancel',
      actions: {
        confirm: {
          label: 'Yes',
          action: { type: 'REORDER_METRICS', metricId: 2, direction: 'down' },
        },
        cancel: {
          label: 'No',
          action: { type: 'DEFAULT_ACTION' },
        },
      },
    },
    {
      title: 'Test modal 3',
      message: '...',
      userResponse: null,
      actions: {
        confirm: {
          label: 'Yes',
          action: { type: 'DELETE_METRIC', metricId: 1 },
        },
        cancel: {
          label: 'No',
          action: { type: 'DEFAULT_ACTION' },
        },
      },
    },
  ],
};

export const settingsSubStates: { [string]: TSettingsState } = {
  notEditing: {
    isModified: false,
  },
  editingNotModified: {
    editedMetric: {
      id: 1,
      props: { ...MoodWithEntries.props },
    },
    isModified: false,
  },
  editingAndModified: {
    editedMetric: {
      id: 1,
      props: {
        name: MoodWithEntries.props.name,
        type: MoodWithEntries.props.type,
        colorGroups: MoodWithEntries.props.colorGroups,
        minValue: MoodWithEntries.props.minValue,
        maxValue: MoodWithEntries.props.maxValue,
      },
    },
    isModified: true,
  },
};
