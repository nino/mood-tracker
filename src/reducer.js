/* @flow */
import { max } from 'lodash';
import * as Actions from './actions';
import { DEFAULT_METRIC_PROPS } from './constants';
import chartsReducer from './Charts/reducer';
import type {
  TApplicationState,
  TEditedColorGroup,
  TNullableColorGroup,
  TEditedMetricProps,
} from './types';
import type {
  TAction,
  TLogMetricAction,
  TStartEditingAction,
  TStopEditingAction,
  TSuccessUpdateMetricAction,
  TErrorUpdateMetricAction,
  TAddMetricAction,
  TReorderMetricsAction,
  TDeleteMetricAction,
  TUpdateEditedMetricAction,
  TSuccessSyncDataAction,
  TErrorSyncDataAction,
  TSuccessCheckLoginAction,
  TErrorCheckLoginAction,
  TSuccessRestoreCacheAction,
} from './actionTypes';

export const INITIAL_STATE: TApplicationState = {
  metrics: {
    isSyncing: false,
    isSynced: false,
  },
  charts: [],
  authentication: {
    isAuthenticated: false,
    isAuthenticating: false,
  },
  modals: [],
  settings: {
    isModified: false,
  },
};

function beginCheckLogin(state: TApplicationState): TApplicationState {
  return {
    ...state,
    authentication: {
      isAuthenticating: true,
      isAuthenticated: false,
    },
  };
}

function successCheckLogin(state: TApplicationState, action: TSuccessCheckLoginAction): TApplicationState {
  if (!action.lastAuthenticated || !action.accessToken) {
    return state;
  }

  return {
    ...state,
    authentication: {
      isAuthenticating: false,
      isAuthenticated: true,
      lastAuthenticated: action.lastAuthenticated,
      accessToken: action.accessToken,
    },
  };
}

function errorCheckLogin(state: TApplicationState, action: TErrorCheckLoginAction): TApplicationState {
  if (!action.error) {
    return state;
  }

  return {
    ...state,
    authentication: {
      isAuthenticating: false,
      error: action.error,
      isAuthenticated: false,
    },
  };
}

function startEditingMetric(state: TApplicationState, action: TStartEditingAction): TApplicationState {
  const { metrics, settings } = state;
  const { editedMetric, isModified } = settings;
  const { items } = metrics;
  const { metricId, discard } = action;
  if (metricId === null || metricId === undefined) {
    return state;
  }
  if (discard === null || discard === undefined) {
    return state;
  }
  if (items === null || items === undefined) {
    return state;
  }
  const index = items.findIndex(m => (m.id === metricId));
  if (index === -1) {
    return state;
  }

  if (!editedMetric || discard || !isModified) {
    if (items[index] == null) {
      return state;
    }

    const editedMetricProps: TEditedMetricProps = { ...items[index].props };
    return {
      ...state,
      settings: {
        editedMetric: {
          id: metricId,
          props: editedMetricProps,
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
    message: (`There are unsaved changes in the metric ${editedMetric.props.name}`
      + `. Do you wish to discard them and start editing ${items[index].props.name}?`),
    userResponse: null,
    actions: {
      confirm: {
        label: 'Discard changes',
        action: Actions.startEditingMetric(metricId, true),
      },
      cancel: {
        label: `Continue editing ${editedMetric.props.name}`,
        action: { type: 'DEFAULT_ACTION' },
      },
    },
  };
  return {
    ...state,
    modals: state.modals.concat(newModal),
  };
}

function requestUpdateMetric(state: TApplicationState): TApplicationState {
  return state;
}

function successUpdateMetric(state: TApplicationState, action: TSuccessUpdateMetricAction): TApplicationState {
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

function errorUpdateMetric(state: TApplicationState, action: TErrorUpdateMetricAction): TApplicationState {
  return {
    ...state,
    modals: [{
      title: 'Some fields are not quite right.',
      message: `${JSON.stringify(action.invalidFields)}`,
      actions: {
        confirm: { action: { type: 'DEFAULT_ACTION' }, label: 'Ok' },
        cancel: { action: { type: 'DEFAULT_ACTION' }, label: 'Ok' },
      },
    }],
  };
}

function logMetric(state: TApplicationState, action: TLogMetricAction): TApplicationState {
  const { metrics } = state;
  const { items } = metrics;
  if (!items) {
    return state;
  }
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

function stopEditing(state: TApplicationState, action: TStopEditingAction): TApplicationState {
  const { settings, modals } = state;
  const { editedMetric, isModified } = settings;
  const { discard } = action;
  if (!editedMetric) {
    return state;
  } else if (!isModified || discard) {
    return {
      ...state,
      settings: {
        isModified: false,
      },
    };
  }

  return {
    ...state,
    modals: modals.concat({
      title: 'Discard changes?',
      message: (`There are unsaved changes in "${editedMetric.props.name}".`
        + 'Do you wish to discard them?'),
      userResponse: null,
      actions: {
        confirm: {
          action: Actions.stopEditing(true),
          label: 'Discard changes',
        },
        cancel: {
          action: { type: 'DEFAULT_ACTION' },
          label: 'Continue editing',
        },
      },
    }),
  };
}

function addMetric(state: TApplicationState, action: TAddMetricAction): TApplicationState {
  const { discard } = action;
  const { metrics, settings, modals } = state;
  const { items } = metrics;
  const { editedMetric, isModified } = settings;
  if (!items) {
    return {
      ...state,
      metrics: {
        ...metrics,
        items: [{
          id: 1,
          props: DEFAULT_METRIC_PROPS,
          entries: [],
        }],
      },
    };
  } else if (editedMetric && isModified && !discard) {
    const newModal = {
      title: 'Discard changes?',
      message: (`There are unsaved changes in "${editedMetric.props.name}". `
        + 'Do you wish to discard them and create a new metric?'),
      userResponse: null,
      actions: {
        confirm: {
          action: Actions.addMetric(true),
          label: 'Discard changes',
        },
        cancel: {
          action: { type: 'DEFAULT_ACTION' },
          label: 'Continue editing',
        },
      },
    };
    return {
      ...state,
      modals: modals.concat(newModal),
    };
  }

  const id: number = max(items.map(item => item.id)) + 1;
  const editedMetricProps: TEditedMetricProps = { ...DEFAULT_METRIC_PROPS };
  return {
    ...state,
    metrics: {
      ...metrics,
      items: items.concat({
        id,
        props: DEFAULT_METRIC_PROPS,
        entries: [],
      }),
    },
    settings: {
      editedMetric: {
        id,
        props: editedMetricProps,
      },
      isModified: true,
    },
  };
}

function reorderMetrics(state: TApplicationState, action: TReorderMetricsAction): TApplicationState {
  const { metrics } = state;
  const { metricId, direction } = action;
  const { items } = metrics;
  if (items == null || (direction !== 'up' && direction !== 'down')) {
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

function deleteMetric(state: TApplicationState, action: TDeleteMetricAction): TApplicationState {
  const { metricId, confirm } = action;
  const { metrics, modals } = state;
  const { items } = metrics;
  if (items == null) {
    return state;
  }

  const index = items.findIndex(m => (m.id === metricId));
  if (index === -1) {
    return state;
  } else if (!confirm) {
    const newModal = {
      title: 'Delete metric?',
      message: `Are you sure you wish to delete "${items[index].props.name}"?`,
      userResponse: null,
      actions: {
        confirm: {
          label: `Delete "${items[index].props.name}"`,
          action: Actions.deleteMetric(metricId, true),
        },
        cancel: {
          label: 'Do not delete',
          action: { type: 'DEFAULT_ACTION' },
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
      items: (items.slice(0, index).concat(items.slice(index + 1, items.length))),
    },
    settings: {
      isModified: false,
    },
  };
}

function updateEditedMetric(state: TApplicationState, action: TUpdateEditedMetricAction): TApplicationState {
  const { settings } = state;
  const { editedMetric } = settings;
  if (!editedMetric) {
    return state;
  }

  const { props } = editedMetric;
  const { updatedProps } = action;
  const name = updatedProps.name !== undefined ? updatedProps.name : props.name;
  let colorGroups: TEditedColorGroup[] = [];
  if (updatedProps.colorGroups != null) {
    colorGroups = updatedProps.colorGroups.map((colorGroup: TNullableColorGroup) => {
      let minValue = null;
      let maxValue = null;
      let color = '';

      if (typeof colorGroup.minValue === 'number') {
        minValue = colorGroup.minValue;
      } else if (typeof colorGroup.minValue === 'string') {
        const numValue = parseInt(colorGroup.minValue, 10);
        minValue = isNaN(numValue) ? null : numValue;
      }

      if (typeof colorGroup.maxValue === 'number') {
        maxValue = colorGroup.maxValue;
      } else if (typeof colorGroup.maxValue === 'string') {
        const numValue = parseInt(colorGroup.maxValue, 10);
        maxValue = isNaN(numValue) ? null : numValue;
      }

      if (colorGroup.color !== undefined) {
        color = colorGroup.color;
      }

      const result: TEditedColorGroup = {
        minValue,
        maxValue,
        color,
      };
      return result;
    });
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

function requestConfirmModal(state: TApplicationState): TApplicationState {
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

function requestCancelModal(state: TApplicationState) {
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

function successConfirmModal(state: TApplicationState): TApplicationState {
  return {
    ...state,
    modals: state.modals.slice(1, state.modals.length),
  };
}

function successCancelModal(state: TApplicationState): TApplicationState {
  return {
    ...state,
    modals: state.modals.slice(1, state.modals.length),
  };
}

function beginSyncData(state: TApplicationState): TApplicationState {
  return {
    ...state,
    metrics: {
      ...state.metrics,
      isSyncing: true,
    },
  };
}

function successSyncData(state: TApplicationState, action: TSuccessSyncDataAction): TApplicationState {
  const { metrics } = state;
  return {
    ...state,
    metrics: {
      ...metrics,
      items: action.data,
      isSyncing: false,
      isSynced: true,
      lastSynced: action.lastSynced,
    },
  };
}

function errorSyncData(state: TApplicationState, action: TErrorSyncDataAction): TApplicationState {
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

function requestRestoreCache(state: TApplicationState): TApplicationState {
  return state;
}

function successRestoreCache(state: TApplicationState, action: TSuccessRestoreCacheAction): TApplicationState {
  return {
    ...state,
    metrics: {
      ...state.metrics,
      items: action.data,
    },
  };
}

function errorRestoreCache(state: TApplicationState): TApplicationState {
  return state;
}

export function reducer(state: TApplicationState = INITIAL_STATE, action?: TAction): TApplicationState {
  if (!action || !action.type) {
    return {
      ...state,
      charts: chartsReducer(state.charts),
    };
  }
  switch (action.type) {
    case 'BEGIN_CHECK_LOGIN':
      return beginCheckLogin(state, action);
    case 'SUCCESS_CHECK_LOGIN':
      return successCheckLogin(state, action);
    case 'ERROR_CHECK_LOGIN':
      return errorCheckLogin(state, action);
    case 'LOG_METRIC':
      return logMetric(state, action);
    case 'START_EDITING':
      return startEditingMetric(state, action);
    case 'REQUEST_UPDATE_METRIC':
      return requestUpdateMetric(state, action);
    case 'SUCCESS_UPDATE_METRIC':
      return successUpdateMetric(state, action);
    case 'ERROR_UPDATE_METRIC':
      return errorUpdateMetric(state, action);
    case 'STOP_EDITING':
      return stopEditing(state, action);
    case 'ADD_METRIC':
      return addMetric(state, action);
    case 'REORDER_METRICS':
      return reorderMetrics(state, action);
    case 'DELETE_METRIC':
      return deleteMetric(state, action);
    case 'UPDATE_EDITED_METRIC':
      return updateEditedMetric(state, action);
    case 'REQUEST_CONFIRM_MODAL':
      return requestConfirmModal(state, action);
    case 'REQUEST_CANCEL_MODAL':
      return requestCancelModal(state, action);
    case 'SUCCESS_CONFIRM_MODAL':
      return successConfirmModal(state, action);
    case 'SUCCESS_CANCEL_MODAL':
      return successCancelModal(state, action);
    case 'BEGIN_SYNC_DATA':
      return beginSyncData(state, action);
    case 'SUCCESS_SYNC_DATA':
      return successSyncData(state, action);
    case 'ERROR_SYNC_DATA':
      return errorSyncData(state, action);
    case 'REQUEST_RESTORE_CACHE':
      return requestRestoreCache(state, action);
    case 'SUCCESS_RESTORE_CACHE':
      return successRestoreCache(state, action);
    case 'ERROR_RESTORE_CACHE':
      return errorRestoreCache(state, action);
    case 'REQUEST_LOGOUT':
      return state;
    case 'SUCCESS_LOGOUT':
      return {
        ...state,
        authentication: {
          isAuthenticated: false,
          isAuthenticating: false,
        },
        metrics: {
          isSynced: false,
          isSyncing: false,
        },
      };
    case 'REQUEST_SYNC':
      return state;
    default:
      return {
        ...state,
        charts: chartsReducer(state.charts, action),
      };
  }
}
