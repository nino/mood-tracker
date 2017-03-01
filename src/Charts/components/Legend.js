/* @flow */
import React from 'react';
import type { TChartLine, TMetric } from '../../types';

type TLegendProps = {
  lines: TChartLine[],
  metrics: TMetric[],
  cycleMode: (metricId: number) => void,
};

function metricName(line: TChartLine, metrics: TMetric[]): string {
  const metric = metrics.find(m => m.id === line.metricId);
  return metric == null ? '' : metric.props.name;
}

const Legend = ({ lines, metrics, cycleMode }: TLegendProps) => (
  <div className="chart-legend">
    {lines.map(line => (
      <div
        key={line.metricId}
        aria-hidden
        className="legend-item"
        role="button"
        onClick={() => cycleMode(line.metricId)}
      >
        <span className={`legend-icon legend-icon-${line.mode}`} />
        <span className={`legend-metric-name ${line.mode === 'off' ? 'text-dimmed' : ''}`}>
          {metricName(line, metrics)}
        </span>
      </div>
    ))}
  </div>
);

export default Legend;
