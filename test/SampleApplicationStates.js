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
    error: null,
  },
  authentication: {
    isAuthenticated: false,
    error: null,
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
    error: null,
  },
  authentication: {
    isAuthenticated: false,
    error: null,
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
    error: null,
  },
  authentication: {
    isAuthenticated: false,
    error: null,
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
    error: null,
  },
  authentication: {
    isAuthenticated: false,
    error: null,
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
    error: null,
  },
  authentication: {
    isAuthenticated: false,
    error: null,
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

export const authSubStates = {
  authenticated: {
    isAuthenticated: true,
    isAuthenticating: false,
    accessToken: 'abc',
    error: null,
    lastAuthenticated: 123,
  },
  authenticating: {
    isAuthenticating: true,
    isAuthenticated: false,
    accessToken: null,
    error: null,
    lastAuthenticated: 123,
  },
  notAuthenicatedNotAuthenticating: {
    isAuthenticating: false,
    isAuthenticated: false,
    accessToken: null,
    error: null,
    lastAuthenticated: 0,
  },
  withError: {
    isAuthenticating: false,
    isAuthenticated: false,
    lastAuthenticated: null,
    accessToken: null,
    error: { error: 'Could not authenticate' },
  },
};

export const metricsSubStates = {
  notSyncingWithData: {
    isSynced: false,
    isSyncing: false,
    hasError: false,
    items: [MoodWithEntries, BurnsWithoutEntries],
    lastSynced: 0,
  },
  notSyncingNoData: {
    isSynced: false,
    isSyncing: false,
    hasError: false,
    lastSynced: null,
    items: null,
  },
  syncingNoData: {
    isSynced: false,
    isSyncing: true,
    lastSynced: null,
    items: null,
    hasError: false,
  },
  syncingWithData: {
    isSynced: false,
    isSyncing: true,
    lastSynced: 123,
    items: [MoodWithEntries, BurnsWithoutEntries],
    hasError: false,
  },
  syncedMetricsWithEntries: {
    isSynced: true,
    isSyncing: false,
    lastSynced: 123,
    items: [MoodWithEntries, BurnsWithEntries],
    hasError: false,
  },
  syncedMetricsWithoutEntries: {
    isSynced: true,
    isSyncing: false,
    lastSynced: 123,
    items: [MoodWithoutEntries, BurnsWithoutEntries],
    hasError: false,
  },
  withErrorWithData: {
    isSynced: false,
    isSyncing: false,
    lastSynced: 123,
    items: [MoodWithoutEntries, BurnsWithoutEntries],
    hasError: { error: 'Sync error' },
  },
  withErrorNoData: {
    isSynced: false,
    isSyncing: false,
    lastSynced: null,
    items: null,
    hasError: { error: 'Sync error' },
  },
};

export const modalsSubStates = {
  noModals: [],
  oneModal: [{
    title: 'Test modal',
    message: '...',
    userResponse: null,
    actions: {
      confirm: {
        label: 'Yes',
        action: { type: 'test confirm ' },
      },
      cancel: {
        label: 'No',
        action: { type: 'test cancel' },
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
          action: { type: 'test confirm ' },
        },
        cancel: {
          label: 'No',
          action: { type: 'test cancel' },
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
          action: { type: 'test confirm ' },
        },
        cancel: {
          label: 'No',
          action: { type: 'test cancel' },
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
          action: { type: 'test confirm ' },
        },
        cancel: {
          label: 'No',
          action: { type: 'test cancel' },
        },
      },
    },
  ],
};

export const settingsSubStates = {
  notEditing: {
    editedMetric: null,
    isModified: false,
  },
  editingNotModified: {
    editedMetric: {
      id: 1,
      props: MoodWithEntries.props,
    },
    isModified: false,
  },
  editingAndModified: {
    editedMetric: {
      id: 1,
      props: MoodWithEntries.props,
    },
    isModified: true,
  },
};
