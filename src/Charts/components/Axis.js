/* @flow */
import React from 'react';
import Radium from 'radium';
import Line from './Line';
import type { TDimensions, TAxisTick, TChartPadding } from '../types';

const axisColor = '#fff';
const labelStyle = {
  fontSize: '10px',
};

type TAxisProps = {
  /**
   * Dimensions of the parent component in pixels
   */
  dimensions: TDimensions,

  /**
   * Axis ticks, where the position is given in pixels
   */
  ticks: TAxisTick[],

  /**
   * Is the axis supposed to be the y axis?
   */
  vertical?: boolean,

  /**
   * How much padding should there be
   * between the boundaries of the chart drawing
   * and the chart container?
   */
  padding: TChartPadding,
};

export const XAxis = ({ dimensions, ticks, padding }: TAxisProps) => (
  <g className="x-axis">
    {ticks.map(tick => (
      <g key={JSON.stringify(tick)}>
        <Line
          points={[
            { x: tick.position, y: (padding.top || 0) },
            { x: tick.position, y: dimensions.height - (padding.bottom || 0) },
          ]}
          color={axisColor}
          className="axis-tick"
        />
        <text
          textAnchor="middle"
          alignmentBaseline="hanging"
          x={tick.position}
          y={dimensions.height - (padding.bottom || 0)}
          style={{
            zIndex: '100',
            ...labelStyle,
          }}
        >
          {tick.label}
        </text>
      </g>
    ))}
  </g>
);

XAxis.defaultProps = {
  vertical: false,
};

export const YAxis = ({ dimensions, ticks, padding }: TAxisProps) => (
  <g className="y-axis">
    {ticks.map(tick => (
      <g key={tick.position}>
        <Line
          className="yaxis-tick"
          points={[{
            x: (padding.left || 0),
            y: tick.position,
          }, {
            x: dimensions.width - (padding.right || 0),
            y: tick.position,
          }]}
          color={axisColor}
        />
        <text
          className="yaxis-label"
          x={5}
          y={tick.position}
          textAnchor="left"
          alignmentBaseline="middle"
          style={{
            zIndex: '100',
            ...labelStyle,
          }}
        >
          {tick.label}
        </text>
      </g>
    ))}
  </g>
);
YAxis.defaultProps = { vertical: true };

const Axis = (props: TAxisProps) => (props.vertical === false ? <XAxis {...props} /> : <YAxis {...props} />);
Axis.defaultProps = { vertical: false };

export default Radium(Axis);

