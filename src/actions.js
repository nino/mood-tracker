export function logMetric(metricId, date, value) {
  return {
    type: 'LOG_METRIC',
    metricId,
    date,
    value,
  };
}

export function startEditingMetric(metricId, discard = false) {
  return {
    type: 'START_EDITING',
    metricId,
    discard,
  };
}

export function updateMetric(metricId, newProps, lastModified) {
  return {
    type: 'UPDATE_METRIC',
    metricId,
    newProps,
    lastModified,
  };
}

export function stopEditing(discard = false) {
  return {
    type: 'STOP_EDITING',
    discard,
  };
}

export function addMetric(discard = false) {
  return {
    type: 'ADD_METRIC',
    discard,
  };
}

export function reorderMetrics(metricId, direction) {
  return {
    type: 'REORDER_METRICS',
    metricId,
    direction,
  };
}

export function deleteMetric(metricId, confirm = false) {
  return {
    type: 'DELETE_METRIC',
    metricId,
    confirm,
  };
}

export function updateEditedMetric(updatedProps) {
  return {
    type: 'UPDATE_EDITED_METRIC',
    updatedProps,
  };
}

export function requestConfirmModal() {
  return {
    type: 'REQUEST_CONFIRM_MODAL',
  };
}

export function requestCancelModal() {
  return {
    type: 'REQUEST_CANCEL_MODAL',
  };
}

export function successConfirmModal() {
  return {
    type: 'SUCCESS_CONFIRM_MODAL',
  };
}

export function errorConfirmModal() {
  return {
    type: 'ERROR_CONFIRM_MODAL',
  };
}

export function successCancelModal() {
  return {
    type: 'SUCCESS_CANCEL_MODAL',
  };
}

export function errorCancelModal() {
  return {
    type: 'ERROR_CANCEL_MODAL',
  };
}

export function beginSyncData() {
  return {
    type: 'BEGIN_SYNC_DATA',
  };
}

export function successSyncData(data, lastSynced) {
  return {
    type: 'SUCCESS_SYNC_DATA',
    data,
    lastSynced,
  };
}

export function errorSyncData(error) {
  return {
    type: 'ERROR_SYNC_DATA',
    error,
  };
}

export function beginCheckLogin() {
  return {
    type: 'BEGIN_CHECK_LOGIN',
  };
}

export function successCheckLogin(accessToken, lastAuthenticated) {
  return {
    type: 'SUCCESS_CHECK_LOGIN',
    accessToken,
    lastAuthenticated,
  };
}

export function errorCheckLogin(error) {
  return {
    type: 'ERROR_CHECK_LOGIN',
    error,
  };
}

export function requestLogout() {
  return {
    type: 'REQUEST_LOGOUT',
  };
}

export function successLogout() {
  return {
    type: 'SUCCESS_LOGOUT',
  };
}

export function requestSync() {
  return {
    type: 'REQUEST_SYNC',
  };
}

export function requestRestoreCache() {
  return {
    type: 'REQUEST_RESTORE_CACHE',
  };
}

export function successRestoreCache(data) {
  return {
    type: 'SUCCESS_RESTORE_CACHE',
    data,
  };
}

export function errorRestoreCache(error) {
  return {
    type: 'ERROR_RESTORE_CACHE',
    error,
  };
}
