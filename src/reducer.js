export const INITIAL_STATE = {
  metrics: {
    isSyncing: false,
    isSynced: false,
    lastSynced: null,
    items: null,
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
  if (!action || !action.type) {
    return state;
  }
  switch(action.type) {
    case 'log metric':
      return logMetric(state, action);
    default:
      return state;
  }
};
  return state;
function logMetric(state, action) {
  const { metrics } = state;
  const { items } = metrics;
  const { metricId, date, value } = action;
  const metricIndex = items.findIndex(m => (m.id === metricId));
  if (metricIndex === -1) {
    return state;
  }
  else {
    const updatedMetric = {
      ...items[metricIndex],
      entries: items[metricIndex].entries.concat({
        date,
        value,
      }),
    };
    const updatedItems = items.slice(0, metricIndex).concat(
      updatedMetric,
      items.slice(metricIndex + 1, items.length),
    );
    return {
      ...state,
      metrics: {
        ...metrics,
        items: updatedItems,
      }
    }
  }
}
