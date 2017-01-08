import { max } from 'lodash';
import * as Actions from './actions';
import { DEFAULT_METRIC_PROPS } from './constants';

export const INITIAL_STATE = {
  metrics: {
    isSyncing: false,
    isSynced: false,
    lastSynced: null,
    items: null,
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

function beginCheckLogin(state) {
  return {
    ...state,
    authentication: {
      isAuthenticating: true,
      error: null,
    },
  };
}

function successCheckLogin(state, action) {
  return {
    ...state,
    authentication: {
      isAuthenticating: false,
      isAuthenticated: true,
      lastAuthenticated: action.lastAuthenticated,
      accessToken: action.accessToken,
      error: null,
    },
  };
}

function errorCheckLogin(state, action) {
  return {
    ...state,
    authentication: {
      isAuthenticating: false,
      error: action.error,
      isAuthenticated: false,
    },
  };
}

function startEditingMetric(state, action) {
  const { metrics, settings } = state;
  const { editedMetric, isModified } = settings;
  const { items } = metrics;
  const { metricId, discard } = action;
  const index = items.findIndex(m => (m.id === metricId));
  if (index === -1) {
    return state;
  }

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

  if (editedMetric.id === metricId) {
    return state;
  }

  const newModal = {
    title: 'Discard changes?',
    message: 'There are unsaved changes in the metric '
    + editedMetric.props.name
    + '. Do you wish to discard them and start editing '
    + items[index].props.name + '?',
    userResponse: null,
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
          entries: items[index].entries,
          lastModified,
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
    },
  };
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
  }

  return {
    ...state,
    modals: modals.concat({
      title: 'Discard changes?',
      message: ('There are unsaved changes in "' +
        editedMetric.props.name + '". ' +
        'Do you wish to discard them?'),
      userResponse: null,
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

function addMetric(state, action) {
  const { discard } = action;
  const { metrics, settings, modals } = state;
  const { items } = metrics;
  const { editedMetric, isModified } = settings;
  if (items === null) {
    return {
      ...state,
      metrics: {
        ...metrics,
        items: [{
          id: 1,
          props: DEFAULT_METRIC_PROPS,
          lastModified: null,
          entries: [],
        }],
      },
    };
  } else if (editedMetric && isModified && !discard) {
    const newModal = {
      title: 'Discard changes?',
      message: ('There are unsaved changes in "' +
        editedMetric.props.name + '". ' +
        'Do you wish to discard them and create a new metric?'),
      userResponse: null,
      actions: {
        confirm: {
          action: Actions.addMetric(true),
          label: 'Discard changes',
        },
        cancel: {
          action: { type: 'default action' },
          label: 'Continue editing',
        },
      },
    };
    return {
      ...state,
      modals: modals.concat(newModal),
    };
  }

  const id = max(items.map(item => item.id)) + 1;
  return {
    ...state,
    metrics: {
      ...metrics,
      items: items.concat({
        id,
        props: DEFAULT_METRIC_PROPS,
        entries: [],
        lastModified: null,
      }),
    },
    settings: {
      editedMetric: {
        id,
        props: DEFAULT_METRIC_PROPS,
      },
      isModified: true,
    },
  };
}

function reorderMetrics(state, action) {
  const { metrics } = state;
  const { metricId, direction } = action;
  const { items } = metrics;
  if (items === null || (direction !== 'up' && direction !== 'down')) {
    return state;
  }

  const index = items.findIndex(m => (m.id === metricId));
  if (index === -1) {
    return state;
  } else if (index === 0 && direction === 'up') {
    return state;
  } else if (index === items.length - 1 && direction === 'down') {
    return state;
  }

  const before = items.slice(0, index - 1);
  const after = items.slice(index + 2, items.length);
  const left = items.slice(index - 1, index);
  const right = items.slice(index + 1, index + 2);
  const chosen = items.slice(index, index + 1);
  const newItems = before.concat(
    direction === 'up' ? chosen : left,
    direction === 'up' ? left : right,
    direction === 'up' ? right : chosen,
    after,
  );
  return {
    ...state,
    metrics: {
      ...metrics,
      items: newItems,
    },
  };
}

function deleteMetric(state, action) {
  const { metricId, confirm } = action;
  const { metrics, modals } = state;
  const { items } = metrics;
  if (items === null) {
    return state;
  }

  const index = items.findIndex(m => (m.id === metricId));
  if (index === -1) {
    return state;
  } else if (!confirm) {
    const newModal = {
      title: 'Delete metric?',
      message: ('Are you sure you wish to delete "' +
        items[index].props.name + '"?'),
      userResponse: null,
      actions: {
        confirm: {
          label: 'Delete "' + items[index].props.name + '"',
          action: Actions.deleteMetric(metricId, true),
        },
        cancel: {
          label: 'Do not delete',
          action: { type: 'default action' },
        },
      },
    };
    return {
      ...state,
      modals: modals.concat(newModal),
    };
  }

  return {
    ...state,
    metrics: {
      ...metrics,
      items: (items.slice(0, index)
        .concat(items.slice(index + 1, items.length))),
    },
    settings: {
      editedMetric: null,
      isModified: false,
    },
  };
}

function updateEditedMetric(state, action) {
  const { settings } = state;
  const { editedMetric } = settings;
  if (!editedMetric) {
    return state;
  }

  const { props } = editedMetric;
  const { updatedProps } = action;
  const name = updatedProps.name !== undefined ? updatedProps.name : props.name;
  let colorGroups;
  if (updatedProps.colorGroups instanceof Array) {
    colorGroups = updatedProps.colorGroups.map(colorGroup => ({
      minValue: parseInt(colorGroup.minValue, 10) || null,
      maxValue: parseInt(colorGroup.maxValue, 10) || null,
      color: colorGroup.color,
    }));
  } else {
    colorGroups = props.colorGroups;
  }

  let minValue;
  if (updatedProps.minValue !== undefined) {
    minValue = parseInt(updatedProps.minValue, 10) || null;
  } else {
    minValue = props.minValue;
  }

  let maxValue;
  if (updatedProps.maxValue !== undefined) {
    maxValue = parseInt(updatedProps.maxValue, 10) || null;
  } else {
    maxValue = props.maxValue;
  }

  return {
    ...state,
    settings: {
      isModified: true,
      editedMetric: {
        id: editedMetric.id,
        props: {
          name,
          colorGroups,
          type: 'int',
          minValue,
          maxValue,
        },
      },
    },
  };
}

function requestConfirmModal(state) {
  const { modals } = state;
  if (modals.length === 0) {
    return state;
  }

  const index = modals.findIndex(m => (m.userResponse === null));
  return {
    ...state,
    modals: modals.slice(0, index).concat(
      { ...modals[index], userResponse: 'confirm' },
      modals.slice(index + 1, modals.length),
    ),
  };
}

function requestCancelModal(state) {
  const { modals } = state;
  if (modals.length === 0) {
    return state;
  }

  const index = modals.findIndex(m => (m.userResponse === null));
  return {
    ...state,
    modals: modals.slice(0, index).concat(
      { ...modals[index], userResponse: 'cancel' },
      modals.slice(index + 1, modals.length),
    ),
  };
}

function successConfirmModal(state) {
  return {
    ...state,
    modals: state.modals.slice(1, state.modals.length),
  };
}

function successCancelModal(state) {
  return {
    ...state,
    modals: state.modals.slice(1, state.modals.length),
  };
}

function beginSyncData(state) {
  return {
    ...state,
    metrics: {
      ...state.metrics,
      isSyncing: true,
    },
  };
}

function successSyncData(state, action) {
  const { metrics } = state;
  return {
    ...state,
    metrics: {
      ...metrics,
      items: action.data,
      isSyncing: false,
      isSynced: true,
      error: null,
      lastSynced: action.lastSynced,
    },
  };
}

function errorSyncData(state, action) {
  const { metrics } = state;
  return {
    ...state,
    metrics: {
      ...metrics,
      error: action.error,
      isSyncing: false,
    },
  };
}

export function reducer(state = INITIAL_STATE, action) {
  if (!action || !action.type) {
    return state;
  }
  switch (action.type) {
    case 'begin check login':
      return beginCheckLogin(state, action);
    case 'success check login':
      return successCheckLogin(state, action);
    case 'error check login':
      return errorCheckLogin(state, action);
    case 'logout':
      return {
        ...state,
        authentication: {
          isAuthenticated: false,
          isAuthenticating: false,
          accessToken: null,
        },
      };
    case 'log metric':
      return logMetric(state, action);
    case 'start editing':
      return startEditingMetric(state, action);
    case 'update metric':
      return updateMetric(state, action);
    case 'stop editing':
      return stopEditing(state, action);
    case 'add metric':
      return addMetric(state, action);
    case 'reorder metrics':
      return reorderMetrics(state, action);
    case 'delete metric':
      return deleteMetric(state, action);
    case 'update edited metric':
      return updateEditedMetric(state, action);
    case 'request confirm modal':
      return requestConfirmModal(state, action);
    case 'request cancel modal':
      return requestCancelModal(state, action);
    case 'success confirm modal':
      return successConfirmModal(state, action);
    case 'success cancel modal':
      return successCancelModal(state, action);
    case 'begin sync data':
      return beginSyncData(state, action);
    case 'success sync data':
      return successSyncData(state, action);
    case 'error sync data':
      return errorSyncData(state, action);
    case 'request login':
      return state;
    case 'request logout':
      return state;
    case 'success logout':
      return {
        ...state,
        authentication: {
          isAuthenticated: false,
          isAuthenticating: false,
          accessToken: null,
          error: null,
        },
      };
    case 'request sync':
      return state;
    default:
      return state;
  }
}
