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

export function reducer(state=INITIAL_STATE, action) {
  return state;
}
