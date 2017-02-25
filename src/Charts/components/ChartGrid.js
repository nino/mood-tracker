/* @flow */
import React from 'react';
import type { TColorGroup } from '../../types';
import type { TChartPadding, TDimensions, TRange } from '../types';
import Axis from './Axis';
import { getXAxisTicks, getYAxisTicks } from '../svg-utils';

type TColorGroupRectProps = {
  colorGroup: TColorGroup,
  dimensions: TDimensions,
  valueRange: TRange,
  padding: TChartPadding,
};

export const ColorGroupRect = ({ colorGroup, dimensions, valueRange, padding }: TColorGroupRectProps) => {
  const paddingTop = padding.top || 0;
  const paddingBottom = padding.bottom || 0;
  const drawingHeight = dimensions.height - (paddingTop + paddingBottom);
  const topEdge = paddingTop + (((valueRange[1] - colorGroup.maxValue) / (valueRange[1] - valueRange[0])) * drawingHeight);
  const bottomEdge = paddingTop + (((valueRange[1] - colorGroup.minValue) / (valueRange[1] - valueRange[0])) * drawingHeight);
  return (
    <rect
      className="chart-background-rect"
      fillOpacity={0.2}
      fill={colorGroup.color}
      x={0}
      y={topEdge}
      width={dimensions.width}
      height={bottomEdge - topEdge}
    />
  );
};

type TChartGridProps = {
  /**
   * The dimensions of the parent Chart component, in pixels.
   */
  dimensions: { width: number, height: number },

  /**
   * The displayed range of dates.
   */
  dateRange: [number, number],

  /**
   * The min and max allowed values for the metrics drawn in this chart.
   */
  valueRange: [number, number],

  /**
   * Color groups of the metrics to be graphed
   */
  colorGroups: TColorGroup[],
};

/**
 * This component contains all the chrome associated with a chart.
 * In here will be grid lines, axes, axis ticks, axis annotations, etc.
 */
const ChartGrid = ({ dimensions, dateRange, valueRange, colorGroups }: TChartGridProps) => (
  <g className="chart-grid">
    {colorGroups.map((colorGroup: TColorGroup, idx: number) => (
      <ColorGroupRect
        key={idx}
        dimensions={dimensions}
        valueRange={valueRange}
        colorGroup={colorGroup}
        padding={{ bottom: 20 }}
      />
    ))}
    <Axis
      vertical
      dimensions={dimensions}
      ticks={getYAxisTicks(dimensions.height, valueRange, { bottom: 20 })}
      padding={{ bottom: 20 }}
    />
    <Axis
      dimensions={dimensions}
      ticks={getXAxisTicks(dimensions.width, dateRange, { bottom: 20 })}
      padding={{ bottom: 20 }}
    />
  </g>
);

export default ChartGrid;

