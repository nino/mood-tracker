function readFileBlobAsJSON(fileBlob) {
  let blobReader = new FileReader();
  return new Promise((resolve, reject) => {
    blobReader.addEventListener('loadend', () => {
      if (blobReader.result) {
        resolve(JSON.parse(blobReader.result));
      }
      else {
        reject(Error('could not read file'));
      }
    });
    blobReader.readAsText(fileBlob);
  });
}

export function upgradeDataFormat(metrics) {
  if (!metrics.length) {
    return metrics;
  }
  else {
    return metrics.map(upgradeOneMetric);
  }
}

function upgradeOneMetric(metric) {
  if (isValidMetric(metric)) {
    return metric;
  }
  else if (metric.props) {
    return {
      id: metric.id,
      lastModified: metric.lastModified ? metric.lastModified : 0,
      props: {
        name: metric.props.name ? metric.props.name : 'Untitled metric',
        maxValue: metric.props.maxValue ? metric.props.maxValue : 10,
        minValue: metric.props.minValue ? metric.props.minValue : 1,
        type: metric.props.type ? metric.props.type : 'int',
        colorGroups: metric.props.colorGroups ? metric.props.colorGroups : [],
      },
      entries: metric.entries ? metric.entries : [],
    };
  }
  else {
    return {
      id: metric.id,
      lastModified: 0,
      props: {
        name: metric.name ? metric.name : 'Untitled metric',
        maxValue: metric.maxValue ? metric.maxValue : 10,
        minValue: metric.minValue ? metric.minValue : 1,
        type: metric.type ? metric.type : 'int',
        colorGroups: metric.colorGroups ? metric.colorGroups : [],
      },
      entries: metric.entries ? metric.entries : [],
    };
  }
}

function isValidMetric(metric) {
  if (typeof metric !== 'object') {
    return false;
  }
  if (typeof metric.id !== 'number') {
    return false;
  }
  if (typeof metric.props !== 'object') {
    return false;
  }
  if (typeof metric.props.name !== 'string') {
    return false;
  }
  if (typeof metric.props.maxValue !== 'number') {
    return false;
  }
  if (typeof metric.props.minValue !== 'number') {
    return false;
  }
  if (!(metric.props.colorGroups instanceof Array)) {
    return false;
  }
  if (typeof metric.props.type !== 'string') {
    return false;
  }
  if (typeof metric.lastModified !== 'number') {
    return false;
  }
  if (!(metric.entries instanceof Array)) {
    return false;
  }
  return true;
}

export function isValidMetricsArray(metrics) {
  if (!metrics || !(metrics instanceof Array)) {
    return false;
  }
  else {
    return (metrics.findIndex(m => !isValidMetric(m)) === -1);
  }
}

export function mergeMetrics(metrics) {
  if (!metrics || !metrics.length) {
    return null;
  }
  else {
    return concatMergedMetrics([], upgradeDataFormat(metrics));
  }
}

function concatMergedMetrics(outputMetrics, inputMetrics) {
  if (!inputMetrics || inputMetrics.length == 0) {
    return outputMetrics;
  }
  else if (!outputMetrics || outputMetrics.length == 0) {
    return concatMergedMetrics([inputMetrics[0]], inputMetrics.slice(1, inputMetrics.length));
  }
  else {
    const currentMetric = inputMetrics[0];
    const index = outputMetrics.findIndex(m => m.id === currentMetric.id);
    if (index === -1) {
      return concatMergedMetrics(
        outputMetrics.concat(currentMetric),
        inputMetrics.slice(1, inputMetrics.length)
      );
    }
    else { // merge two metrics
      const metricA = outputMetrics[index];
      const metricB = currentMetric;
      const newerMetric = metricA.lastModified > metricB.lastModified ? metricA : metricB;
      const mergedMetric = {
        id: currentMetric.id,
        lastModified: newerMetric.lastModified,
        props: newerMetric.props,
        entries: removeDuplicateEntries(metricA.entries.concat(metricB.entries)),
      };
      const newOutputMetrics = outputMetrics.slice(0, index)
        .concat(mergedMetric)
        .concat(outputMetrics.slice(index+1, outputMetrics.length));
      return concatMergedMetrics(newOutputMetrics, inputMetrics.slice(1, inputMetrics.length));
    }
  }
}

function removeDuplicateEntries(entries) {
  const result = [];
  entries.forEach((entry) => {
    const isNewEntry = result.findIndex(e => (e.date === entry.date && e.value === entry.value)) === -1;
    const isValidEntry = !isNaN(new Date(entry.date).getTime()) && (typeof entry.value === 'number');
    if (isValidEntry && isNewEntry) {
      result.push(entry);
    }
  });
  return result.sort((a,b) => (
    (new Date(a.date)).getTime() - (new Date(b.date)).getTime()
  ));
}

export function downloadFileAsJSON(dbx, path) {
  return (
    dbx.filesListFolder({ path: '' }).then((response) => {
      return response.entries.map(e => e.name);
    }).then((fileNames) => {
      if (fileNames.includes(path)) {
        return;
      }
      else {
        throw Error('File not found');
      }
    }).then(() => {
      return dbx.filesDownload({ 'path': path }).catch((error) => {
        throw Error('Download error');
      });
    }).then((response) => {
      return readFileBlobAsJSON(response.fileBlob);
    }).then((data) => {
      return ({
        ok: true,
        data,
      });
    }).catch((error) => {
      return { ok: false, error: error.toString() };
    })
  );
}
