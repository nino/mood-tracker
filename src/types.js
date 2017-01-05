import { PropTypes } from 'react';

export const colorGroupShape = PropTypes.shape({
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
});

export const propsShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  maxValue: PropTypes.number.isRequired,
  minValue: PropTypes.number.isRequired,
  colorGroups: PropTypes.arrayOf(colorGroupShape).isRequired,
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
