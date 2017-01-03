export function logMetric(metricId, value, date) {
  return {
    type: 'log metric',
    metricId,
    value,
    date,
  };
};

export function startEditingMetric(metricId, discard=false) {
  return {
    type: 'start editing',
    metricId,
    discard,
  };
};

export function updateMetric(metricId, newProps, lastModified) {
  return {
    type: 'update metric',
    metricId,
    newProps,
    lastModified,
  };
};

export function stopEditing(discard=false) {
  return {
    type: 'stop editing',
    discard,
  };
};

export function addMetric(discard=false) {
  return {
    type: 'add metric',
    discard,
  };
};

export function reorderMetrics(metricId, direction) {
  return {
    type: 'reorder metrics',
    metricId,
    direction,
  };
};

export function deleteMetric(metricId, confirm=false) {
  return {
    type: 'delete metric',
    metricId,
    confirm,
  };
};

export function updateEditedMetric(updatedProps) {
  return {
    type: 'update edited metric',
    updatedProps,
  };
};

export function requestConfirmModal() {
  return {
    type: 'request confirm modal',
  };
};

export function requestCancelModal() {
  return {
    type: 'request cancel modal',
  };
};

export function successConfirmModal() {
  return {
    type: 'success confirm modal',
  };
}

export function errorConfirmModal() {
  return {
    type: 'error confirm modal',
  };
}

export function successCancelModal() {
  return {
    type: 'success cancel modal',
  };
}

export function errorCancelModal() {
  return {
    type: 'error cancel modal',
  };
}

export function beginSyncData() {
  return {
    type: 'begin sync data',
  };
};

export function successSyncData(data, lastSynced) {
  return {
    type: 'success sync data',
    data,
    lastSynced,
  };
};

export function errorSyncData(error) {
  return {
    type: 'error sync data',
    error,
  };
};

export function beginCheckLogin() {
  return {
    type: 'begin check login',
  };
};

export function successCheckLogin(accessToken, lastAuthenticated) {
  return {
    type: 'success check login',
    accessToken,
    lastAuthenticated,
  };
};

export function errorCheckLogin(error) {
  return {
    type: 'error check login',
    error,
  };
};

export function requestLogout() {
  return {
    type: 'request logout',
  };
}

export function successLogout() {
  return {
    type: 'success logout',
  };
}

export function requestSync() {
  return {
    type: 'request sync',
  };
}
