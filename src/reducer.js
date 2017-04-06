/* @flow */
import { combineReducers } from 'redux';
import { max } from 'lodash';
import * as Actions from './actions';
import { DEFAULT_METRIC_PROPS } from './constants';
import chartsReducer from './Charts/reducer';
import type {
  TApplicationState,
  TMetricsState,
  TAuthenticationState,
  TModal,
  TSettingsState,
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
import {
  getMetricsItems,
  getEditedMetric,
  isEditedMetricModified,
  getModals,
  getMetrics,
} from './selectors';
import { createMetric, metric2editedMetric } from './lib';

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

function placeholderMetricsReducer(
  state: TMetricsState = INITIAL_STATE.metrics,
): TMetricsState {
  return state;
}

function placeholderAuthenticationReducer(
  state: TAuthenticationState = INITIAL_STATE.authentication,
): TAuthenticationState {
  return state;
}

function placeholderModalsReducer(
  state: TModal[] = INITIAL_STATE.modals,
): TModal[] {
  return state;
}

function placeholderSettingsReducer(
  state: TSettingsState = INITIAL_STATE.settings,
): TSettingsState {
  return state;
}

const externalReducers: (state: TApplicationState, action?: TAction) => TApplicationState =
  combineReducers({
    charts: chartsReducer,
    metrics: placeholderMetricsReducer,
    authentication: placeholderAuthenticationReducer,
    modals: placeholderModalsReducer,
    settings: placeholderSettingsReducer,
  });

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
  const metrics = getMetrics(state);
  const items = getMetricsItems(state);
  const editedMetric = getEditedMetric(state);
  const isModified = isEditedMetricModified(state);
  const modals = getModals(state);
  if (!items) {
    return {
      ...state,
      metrics: {
        ...metrics,
        items: [{
          id: 1,
          props: DEFAULT_METRIC_PROPS,
          entries: [],
          lastModified: 0,
        }],
      },
    };
  } else if (editedMetric && isModified && !discard) {
    const newModal: TModal = {
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

  // Actually creating a new metric
  const id: number = max(items.map(item => item.id)) + 1;
  const metric = createMetric(id);
  const newEditedMetric = metric2editedMetric(metric);
  return {
    ...state,
    metrics: {
      ...metrics,
      items: [
        ...items,
        metric,
      ],
    },
    settings: {
      editedMetric: newEditedMetric,
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
    return externalReducers(state);
  }
  let newState: TApplicationState = { ...state };
  switch (action.type) {
    case 'BEGIN_CHECK_LOGIN':
      newState = beginCheckLogin(state, action);
      break;
    case 'SUCCESS_CHECK_LOGIN':
      newState = successCheckLogin(state, action);
      break;
    case 'ERROR_CHECK_LOGIN':
      newState = errorCheckLogin(state, action);
      break;
    case 'LOG_METRIC':
      newState = logMetric(state, action);
      break;
    case 'START_EDITING':
      newState = startEditingMetric(state, action);
      break;
    case 'REQUEST_UPDATE_METRIC':
      newState = requestUpdateMetric(state, action);
      break;
    case 'SUCCESS_UPDATE_METRIC':
      newState = successUpdateMetric(state, action);
      break;
    case 'ERROR_UPDATE_METRIC':
      newState = errorUpdateMetric(state, action);
      break;
    case 'STOP_EDITING':
      newState = stopEditing(state, action);
      break;
    case 'ADD_METRIC':
      newState = addMetric(state, action);
      break;
    case 'REORDER_METRICS':
      newState = reorderMetrics(state, action);
      break;
    case 'DELETE_METRIC':
      newState = deleteMetric(state, action);
      break;
    case 'UPDATE_EDITED_METRIC':
      newState = updateEditedMetric(state, action);
      break;
    case 'REQUEST_CONFIRM_MODAL':
      newState = requestConfirmModal(state, action);
      break;
    case 'REQUEST_CANCEL_MODAL':
      newState = requestCancelModal(state, action);
      break;
    case 'SUCCESS_CONFIRM_MODAL':
      newState = successConfirmModal(state, action);
      break;
    case 'SUCCESS_CANCEL_MODAL':
      newState = successCancelModal(state, action);
      break;
    case 'BEGIN_SYNC_DATA':
      newState = beginSyncData(state, action);
      break;
    case 'SUCCESS_SYNC_DATA':
      newState = successSyncData(state, action);
      break;
    case 'ERROR_SYNC_DATA':
      newState = errorSyncData(state, action);
      break;
    case 'REQUEST_RESTORE_CACHE':
      newState = requestRestoreCache(state, action);
      break;
    case 'SUCCESS_RESTORE_CACHE':
      newState = successRestoreCache(state, action);
      break;
    case 'ERROR_RESTORE_CACHE':
      newState = errorRestoreCache(state, action);
      break;
    case 'REQUEST_LOGOUT':
      newState = state;
      break;
    case 'SUCCESS_LOGOUT':
      newState = {
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
      break;
    case 'REQUEST_SYNC':
      newState = state;
      break;
    default:
      newState = state;
      break;
  }
  return externalReducers(newState, action);
}
