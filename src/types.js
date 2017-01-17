import { PropTypes } from 'react';

export const colorGroupShape = PropTypes.shape({
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
});

export const nullableColorGroupShape = PropTypes.shape({
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  color: PropTypes.string.isRequired,
});

export const propsShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  maxValue: PropTypes.number.isRequired,
  minValue: PropTypes.number.isRequired,
  colorGroups: PropTypes.arrayOf(colorGroupShape).isRequired,
  type: PropTypes.string.isRequired,
});

export const nullablePropsShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  maxValue: PropTypes.number,
  minValue: PropTypes.number,
  colorGroups: PropTypes.arrayOf(nullableColorGroupShape).isRequired,
  type: PropTypes.string.isRequired,
});

export const entryShape = PropTypes.shape({
  date: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
});

export const metricShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  props: propsShape.isRequired,
  lastModified: PropTypes.number,
  entries: PropTypes.arrayOf(entryShape).isRequired,
});

export const editedMetricShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  props: nullablePropsShape.isRequired,
  lastModified: PropTypes.number,
});

export const modalActionShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  action: PropTypes.shape({ type: PropTypes.string }),
});

export const modalShape = PropTypes.shape({
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    confirm: modalActionShape,
    cancel: modalActionShape,
  }),
});

export const stateShapes = {
  metrics: PropTypes.shape({
    isSyncing: PropTypes.bool.isRequired,
    isSynced: PropTypes.bool.isRequired,
    lastSynced: PropTypes.number,
    items: PropTypes.arrayOf(metricShape),
    error: PropTypes.shape({ error: PropTypes.string }),
  }),
  authentication: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    isAuthenticating: PropTypes.bool.isRequired,
    error: PropTypes.shape({ error: PropTypes.string }),
    accessToken: PropTypes.string,
    lastAuthenticated: PropTypes.number,
  }),
  modals: PropTypes.arrayOf(modalShape),
  settings: PropTypes.shape({
    editedMetric: PropTypes.shape({
      id: PropTypes.number.isRequired,
      props: nullablePropsShape,
    }),
    isModified: PropTypes.bool.isRequired,
  }),
};
