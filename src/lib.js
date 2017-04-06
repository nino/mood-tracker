/* @flow */
/* global FileReader, Blob */
import type { Dropbox } from 'dropbox';
import {
  isEqual,
  omit,
  slice,
} from 'lodash';
import type {
  TMetric,
  TMetricEntry,
  TMetricProps,
  TEditedMetricProps,
  TColorGroup,
  TEditedColorGroup,
  TEditedMetric,
} from './types';
import { DEFAULT_METRIC_PROPS } from './constants';

function readFileBlobAsJSON(fileBlob: Blob): Promise<Object | Error> {
  const blobReader = new FileReader();
  return new Promise((resolve, reject) => {
    blobReader.addEventListener('loadend', () => {
      if (blobReader.result) {
        resolve(JSON.parse(blobReader.result));
      } else {
        reject(Error('could not read file'));
      }
    });
    blobReader.readAsText(fileBlob);
  });
}

function asTColorGroups(colorGroups: TEditedColorGroup[]): ?Array<TColorGroup> {
  const result: TColorGroup[] = [];
  colorGroups.forEach((colorGroup: TEditedColorGroup) => {
    if (colorGroup.minValue != null && colorGroup.maxValue != null) {
      result.push({
        minValue: colorGroup.minValue,
        maxValue: colorGroup.maxValue,
        color: colorGroup.color,
      });
    }
  });
  if (colorGroups.length === result.length) {
    return result;
  }
  return null;
}

export function asTMetricProps(props: TEditedMetricProps): ?TMetricProps {
  const colorGroups: ?TColorGroup[] = asTColorGroups(props.colorGroups);
  if (colorGroups != null && props.name != null && props.maxValue != null && props.minValue != null && props.type != null) {
    return {
      name: props.name,
      minValue: props.minValue,
      maxValue: props.maxValue,
      type: props.type,
      colorGroups,
    };
  }

  return null;
}

export function isValidMetricProps(props: Object): ?TMetricProps {
  if (typeof props !== 'object') {
    return null;
  }
  if (typeof props.name !== 'string') {
    return null;
  }
  if (typeof props.maxValue !== 'number') {
    return null;
  }
  if (typeof props.minValue !== 'number') {
    return null;
  }
  if (typeof props.type !== 'string') {
    return null;
  }

  if (!(props.colorGroups instanceof Array)) {
    return null;
  }
  let allColorGroupsOk: boolean = true;
  props.colorGroups.forEach((colorGroup: TEditedColorGroup | TColorGroup) => {
    if (colorGroup.minValue == null || colorGroup.maxValue == null || colorGroup.color == null) {
      allColorGroupsOk = false;
    }
  });
  if (!allColorGroupsOk) {
    return null;
  }

  return props;
}

function isValidMetric<T: TMetric | Object>(metric: T): ?TMetric {
  if (typeof metric !== 'object') {
    return null;
  }
  if (typeof metric.id !== 'number') {
    return null;
  }
  if (!isValidMetricProps(metric.props)) {
    return null;
  }
  if (typeof metric.lastModified !== 'number') {
    return null;
  }
  if (!(metric.entries instanceof Array)) {
    return null;
  }
  return metric;
}

function upgradeOneMetric(metric: Object): TMetric {
  if (isValidMetric(metric)) {
    return metric;
  }

  if (typeof metric.props === 'object') {
    const props = (metric.props: Object);
    return {
      id: metric.id || 1,
      lastModified: metric.lastModified || 0,
      props: {
        name: props.name || 'Untitled metric',
        maxValue: props.maxValue != null ? props.maxValue : 10,
        minValue: props.minValue != null ? props.minValue : 1,
        type: props.type || 'int',
        colorGroups: props.colorGroups || [],
      },
      entries: metric.entries || [],
    };
  }

  return {
    id: metric.id || 1,
    lastModified: 0,
    props: {
      name: metric.name || 'Untitled metric',
      maxValue: metric.maxValue || 10,
      minValue: metric.minValue || 1,
      type: metric.type || 'int',
      colorGroups: metric.colorGroups || [],
    },
    entries: metric.entries || [],
  };
}

export function upgradeDataFormat(metrics: Object[]): TMetric[] {
  if (!metrics.length) {
    return metrics;
  }
  return metrics.map(upgradeOneMetric);
}

export function isValidMetricsArray(metrics: Object[]): boolean {
  if (!metrics || !(metrics instanceof Array)) {
    return false;
  }
  return (metrics.findIndex((m: Object) => !isValidMetric(m)) === -1);
}

function removeDuplicateEntries(entries: TMetricEntry[]): TMetricEntry[] {
  const result = [];
  entries.forEach((entry) => {
    const isNewEntry = result.findIndex(e => (
      e.date === entry.date && e.value === entry.value)) === -1;
    const isValidEntry = !isNaN(new Date(entry.date).getTime())
      && (typeof entry.value === 'number');
    if (isValidEntry && isNewEntry) {
      result.push(entry);
    }
  });

  return result.sort((a, b) => (
    (new Date(a.date)).getTime() - (new Date(b.date)).getTime()
  ));
}

function concatMergedMetrics(outputMetrics: TMetric[], inputMetrics: TMetric[]): TMetric[] {
  if (!inputMetrics || inputMetrics.length === 0) {
    return outputMetrics;
  }

  if (!outputMetrics || outputMetrics.length === 0) {
    return concatMergedMetrics([inputMetrics[0]], inputMetrics.slice(1, inputMetrics.length));
  }

  const currentMetric = inputMetrics[0];
  const index = outputMetrics.findIndex(m => m.id === currentMetric.id);
  if (index === -1) {
    return concatMergedMetrics(
      outputMetrics.concat(currentMetric),
      inputMetrics.slice(1, inputMetrics.length),
    );
  }

  const metricA = outputMetrics[index];
  const metricB = currentMetric;
  const newerMetric = (metricA.lastModified && metricB.lastModified && metricA.lastModified > metricB.lastModified)
    ? metricA : metricB;
  const mergedMetric = {
    id: currentMetric.id,
    lastModified: newerMetric.lastModified,
    props: newerMetric.props,
    entries: removeDuplicateEntries(metricA.entries.concat(metricB.entries)),
  };
  const newOutputMetrics = outputMetrics.slice(0, index)
    .concat(mergedMetric)
    .concat(outputMetrics.slice(index + 1, outputMetrics.length));
  return concatMergedMetrics(newOutputMetrics, inputMetrics.slice(1, inputMetrics.length));
}

export function mergeMetrics(metrics: TMetric[]): TMetric[] {
  if (!metrics || !metrics.length) {
    return [];
  }
  return concatMergedMetrics([], upgradeDataFormat(metrics));
}

function throwError(err) {
  throw Error(err);
}

export function downloadFileAsJSON(dbx: Dropbox, path: string): Promise<{ ok: true, data: Object } | { ok: false, error: string }> {
  return dbx.filesListFolder({ path: '' })
    .then((response: { entries: Array<{ name: string }> }) => response.entries.map(e => e.name))
    .then((fileNames: string[]) => fileNames.includes(path) || throwError('File not found'))
    .then(() => dbx.filesDownload({ path: `/${path}` }).catch(() => throwError('Download error')))
    .then((response: { fileBlob: Blob }) => readFileBlobAsJSON(response.fileBlob))
    .then((data: Object) => ({ ok: true, data }))
    .catch(error => ({ ok: false, error: error.toString() }));
}

export function uploadAsJSON(dbx: Dropbox, fileName: string, content: TMetric[]): Promise<{ ok: true} | { ok: false, error: string }> {
  const path = `/${fileName}`;
  const stringifiedMetrics = JSON.stringify(content, null, 2);
  const uploadArgs = {
    path,
    mode: { '.tag': 'overwrite' },
    contents: stringifiedMetrics,
    mute: true,
  };
  return dbx.filesUpload(uploadArgs)
    .then(() => ({ ok: true }))
    .catch(error => ({ ok: false, error }));
}

export function areMetricsSameGroup(a: TMetric, b: TMetric): boolean {
  return isEqual(
    omit(a.props, 'name'),
    omit(b.props, 'name'),
  );
}

export function withoutIndex<T>(array: Array<T>, index: number): Array<T> {
  if (index < 0 || index >= array.length) {
    return array;
  }
  return [
    ...slice(array, 0, index),
    ...slice(array, index + 1, array.length),
  ];
}

export function setAt<T>(array: Array<T>, index: number, value: T): Array<T> {
  if (index < 0 || index >= array.length) {
    return array;
  }
  return [
    ...slice(array, 0, index),
    value,
    ...slice(array, index + 1, array.length),
  ];
}

export function metric2editedMetric(metric: TMetric): TEditedMetric {
  return {
    id: metric.id,
    props: metric.props,
  };
}

export function createMetric(id: number, props?: TMetricProps = DEFAULT_METRIC_PROPS) {
  return {
    id,
    props,
    lastModified: 0,
    entries: [],
  };
}

