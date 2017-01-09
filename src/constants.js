export const DATA_FILE_PATH = process.env.NODE_ENV === 'production'
  ? 'data.json'
  : 'data-dev.json';

export const CLIENT_ID = 'i5n1fpuxsfzg39o';

export const DEFAULT_METRIC_PROPS = {
  name: 'Untitled metric',
  minValue: 1,
  maxValue: 10,
  type: 'int',
  colorGroups: [],
};
