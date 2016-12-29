import * as Actions from './actions';

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
    case 'start editing':
      return startEditingMetric(state, action);
    case 'update metric':
      return updateMetric(state, action);
    case 'stop editing':
      return stopEditing(state, action);
    default:
      return state;
  }
};

function startEditingMetric(state, action) {
  const { metrics, settings } = state;
  const { editedMetric, isModified } = settings;
  const { items } = metrics;
  const { metricId, discard } = action;
  const index = items.findIndex(m => (m.id === metricId));
  if (index === -1) {
    return state;
  }
  else {
    if (!editedMetric || discard || !isModified) {
      return {
        ...state,
        settings: {
          editedMetric: {
            id: metricId,
            props: items[index].props,
          },
          isModified: false,
        },
      };
    }
    else if (editedMetric.id === metricId) {
      return state;
    }
    else {
      const newModal = {
        title: 'Discard changes?',
        message: 'There are unsaved changes in the metric '
        + editedMetric.props.name
        + '. Do you wish to discard them and start editing '
        + items[index].props.name + '?',
        actions: {
          confirm: {
            label: 'Discard changes',
            action: Actions.startEditingMetric(metricId, true),
          },
          cancel: {
            label: 'Continue editing ' + editedMetric.props.name,
            action: { type: 'default action' },
          },
        },
      };
      return {
        ...state,
        modals: state.modals.concat(newModal),
      };
    }
  }
}

function updateMetric(state, action) {
  const { metricId, newProps, lastModified } = action;
  const { metrics } = state;
  const { items } = metrics;
  if (!items) {
    return state;
  }
  const index = items.findIndex(m => (m.id === metricId));

  return {
    ...state,
    settings: {
      editedMetric: null,
      isModified: false,
    },
    metrics: {
      ...metrics,
      items: items.slice(0, index).concat(
        {
          id: metricId,
          props: newProps,
          lastModified,
          entries: items[index].entries,
        },
        items.slice(index + 1, items.length),
      ),
    },
  };
}

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

function stopEditing(state, action) {
  const { settings, modals } = state;
  const { editedMetric, isModified } = settings;
  const { discard } = action;
  if (!editedMetric) {
    return state;
  } else if (!isModified || discard) {
    return {
      ...state,
      settings: {
        editedMetric: null,
        isModified: false,
      },
    };
  } else {
    const newModal = {
    };
    return {
      ...state,
      modals: modals.concat({
        title: 'Discard changes?',
        message: ('There are unsaved changes in "' +
          editedMetric.props.name + '". ' +
          'Do you wish to discard them?'),
        actions: {
          confirm: {
            action: Actions.stopEditing(true),
            label: 'Discard changes',
          },
          cancel: {
            action: { type: 'default action' },
            label: 'Continue editing',
          },
        },
      }),
    };
  }
  return state;
}
