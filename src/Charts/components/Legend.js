/* @flow */
import React from 'react';
import Radium from 'radium';
import type { TChartLine, TMetric } from '../../types';

type TLegendProps = {
  lines: TChartLine[],
  metrics: TMetric[],
  cycleMode: (metricId: number) => void,
};

type TLegendIconProps = {
  line: TChartLine,
};

function metricName(line: TChartLine, metrics: TMetric[]): string {
  const metric = metrics.find(m => m.id === line.metricId);
  return metric == null ? '' : metric.props.name;
}

const iconPaths = {
  on: 'M1,4 L3,6 L4,5 L5,3 L7,9 L10,5',
  off: 'M1,4 L3,6 L4,5 L5,3 L7,9 L10,5',
  loess: 'M0 5 Q3 0 5 5 Q7 10 9 5',
};

const LegendIcon = ({ line }: TLegendIconProps) => {
  const iconSize: number = 16;
  return (
    <div
      className={`legend-icon legend-icon-${line.mode}`}
      style={{
        height: `${iconSize}px`,
        width: `${iconSize}px`,
        display: 'inline-block',
      }}
    >
      <svg width={iconSize} height={iconSize}>
        <path
          d={iconPaths[line.mode]}
          fill="transparent"
          stroke={line.color}
          transform={`scale(${iconSize / 10})`}
          opacity={line.mode === 'off' ? 0.3 : 1}
        />
      </svg>
    </div>
  );
};

const Legend = ({ lines, metrics, cycleMode }: TLegendProps) => (
  <div
    className="chart-legend"
    style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      right: '68px',
    }}
  >
    <Radium.Style
      rules={{
        '.legend-item + .legend-item': {
          marginLeft: '8px',
        },
      }}
    />
    {lines.map(line => (
      <div
        key={line.metricId}
        aria-hidden
        className="legend-item"
        role="button"
        onClick={() => cycleMode(line.metricId)}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
      >
        <LegendIcon line={line} />
        <span
          className={`legend-metric-name ${line.mode === 'off' ? 'text-dimmed' : ''}`}
        >
          {metricName(line, metrics)}
        </span>
      </div>
    ))}
  </div>
);

export default Radium(Legend);

