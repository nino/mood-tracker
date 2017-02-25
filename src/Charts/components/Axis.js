/* @flow */
import React from 'react';
import Line from './Line';
import type { TDimensions, TAxisTick, TChartPadding } from '../types';

const axisColor = '#fff';

type TAxisProps = {
  /**
   * Dimensions of the parent component in pixels
   */
  +dimensions: TDimensions,

  /**
   * Axis ticks, where the position is given in pixels
   */
  +ticks: TAxisTick[],

  /**
   * Is the axis supposed to be the y axis?
   */
  +vertical?: boolean,

  /**
   * How much padding should there be
   * between the boundaries of the chart drawing
   * and the chart container?
   */
  +padding: TChartPadding,
};

export const XAxis = ({ dimensions, ticks, padding }: TAxisProps) => (
  <g className="x-axis">
    {ticks.map(tick => (
      <g key={tick.position}>
        <Line
          points={[
            { x: tick.position, y: 0 },
            { x: tick.position, y: dimensions.height - 16 },
          ]}
          color={axisColor}
          className="axis-tick"
        />
        <text textAnchor="middle" alignmentBaseline="hanging" x={tick.position} y={dimensions.height - (padding.bottom || 0)}>{tick.label}</text>
      </g>
    ))}
  </g>
);

export const YAxis = ({ dimensions, ticks }: TAxisProps) => (
  <g className="y-axis">
    {ticks.map(tick => (
      <g key={tick.position}>
        <Line
          className="yaxis-tick"
          points={[
            { x: 0, y: tick.position * ((dimensions.height - 20) / dimensions.height) },
            { x: dimensions.width, y: tick.position * ((dimensions.height - 20) / dimensions.height) },
          ]}
        />
        <text
          className="yaxis-label"
          x={5}
          y={tick.position * ((dimensions.height - 20) / dimensions.height)}
          textAnchor="left"
          alignmentBaseline="baseline"
        >
          {tick.label}
        </text>
      </g>
    ))}
  </g>
);

const Axis = (props: TAxisProps) => (props.vertical === false ? <XAxis {...props} /> : <YAxis {...props} />);
Axis.defaultProps = { vertical: false };

export default Axis;

