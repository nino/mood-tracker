import * as Actions from './actions';
import { DEFAULT_METRIC_PROPS } from './constants';
import { max } from 'lodash';

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
    case 'begin check login':
      return beginCheckLogin(state, action);
    case 'success check login':
      return successCheckLogin(state, action);
    case 'error check login':
      return errorCheckLogin(state, action);
    case 'login clicked':
      return loginClicked();
    case 'logout':
      return {
        ...state,
        authentication: {
          isAuthenticated: false,
          isAuthenticating: false,
          accessToken: null,
        }
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
    case 'confirm modal':
      return confirmModal(state, action);
    case 'cancel modal':
      return cancelModal(state, action);
    case 'begin sync data':
      return beginSyncData(state, action);
    case 'success sync data':
      return successSyncData(state, action);
    case 'error sync data':
      return errorSyncData(state, action);
    default:
      return state;
  }
};


function beginCheckLogin(state, action) {
  return {
    ...state,
    authentication: {
      isAuthenticating: true,
      hasError: false,
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
  return state;
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
  } else {
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
}

function reorderMetrics(state, action) {
  const { metrics } = state;
  const { metricId, direction } = action;
  const { items } = metrics;
  if (items === null || (direction !== 'up' && direction !== 'down')) {
    return state;
  } else {
    const index = items.findIndex(m => (m.id === metricId));
    if (index === -1) {
      return state;
    } else if (index === 0 && direction === 'up') {
      return state;
    } else if (index === items.length - 1 && direction === 'down') {
      return state;
    } else {
      const before = items.slice(0, index - 1);
      const after = items.slice(index + 2, items.length);
      const left = items.slice(index - 1, index);
      const right = items.slice(index + 1, index + 2);
      const chosen = items.slice(index, index + 1);
      const newItems = before.concat(
        direction === 'up' ? chosen : left,
        direction === 'up' ? left : right,
        direction === 'up' ? right : chosen,
        after
      );
      return {
        ...state,
        metrics: {
          ...metrics,
          items: newItems,
        },
      };
    }
  }
  return state;
}

function deleteMetric(state, action) {
  const { metricId, confirm } = action;
  const { metrics, settings, modals } = state;
  const { items } = metrics;
  const { editedMetric, isModified } = settings;
  if (items === null) {
    return state;
  } else {
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
    } else {
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
  }
}

function updateEditedMetric(state, action) {
  const { settings } = state;
  const { editedMetric, isModified } = settings;
  if (!editedMetric) {
    return state;
  } else {
    const { props } = editedMetric;
    const { updatedProps } = action;
    const name = updatedProps.name || props.name;
    let colorGroups;
    if (updatedProps.colorGroups instanceof Array) {
      colorGroups = updatedProps.colorGroups.map((colorGroup) => ({
        minValue: parseInt(colorGroup.minValue) || null,
        maxValue: parseInt(colorGroup.maxValue) || null,
        color: colorGroup.color,
      }));
    } else {
      colorGroups = props.colorGroups;
    }

    let minValue;
    if (updatedProps.minValue !== undefined) {
      minValue = parseInt(updatedProps.minValue) || null;
    } else {
      minValue = props.minValue;
    }

    let maxValue;
    if (updatedProps.maxValue !== undefined) {
      maxValue = parseInt(updatedProps.maxValue) || null;
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
}

function confirmModal(state, action) {
  const { modals } = state;
  if (modals.length === 0) {
    return state;
  } else {
    const index = modals.findIndex(m => (m.userResponse === null));
    return {
      ...state,
      modals: modals.slice(0, index).concat(
        { ...modals[index], userResponse: 'confirm' },
        modals.slice(index + 1, modals.length),
      ),
    };
  }
}

function cancelModal(state, action) {
  const { modals } = state;
  if (modals.length === 0) {
    return state;
  } else {
    const index = modals.findIndex(m => (m.userResponse === null));
    return {
      ...state,
      modals: modals.slice(0, index).concat(
        { ...modals[index], userResponse: 'cancel' },
        modals.slice(index + 1, modals.length),
      ),
    };
  }
}

function beginSyncData(state, action) {
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
  const { items } = metrics;
  return {
    ...state,
    metrics: {
      ...metrics,
      items: action.data,
      isSyncing: false,
      isSynced: true,
      hasError: false,
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
      hasError: action.error,
      isSyncing: false,
    },
  };
}
