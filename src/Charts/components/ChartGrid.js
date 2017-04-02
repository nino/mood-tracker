/* @flow */
import React from 'react';
import { map } from 'lodash';
import type { TColorGroup } from '../../types';
import type { TChartPadding, TDimensions, TRange } from '../types';
import Axis from './Axis';
import { getXAxisTicks, getYAxisTicks, yValueToPixels } from '../svg-utils';
import { CHART_PADDING } from '../constants';

type TColorGroupRectProps = {
  colorGroup: TColorGroup,
  dimensions: TDimensions,
  valueRange: TRange,
  padding: TChartPadding,
};

export const ColorGroupRect = ({ colorGroup, dimensions, valueRange, padding }: TColorGroupRectProps) => {
  if (dimensions.width <= 0 || dimensions.height <= 0) {
    return null;
  }
  const topEdge = yValueToPixels(colorGroup.maxValue + 0.5, valueRange, dimensions.height, padding);
  const bottomEdge = yValueToPixels(colorGroup.minValue - 0.5, valueRange, dimensions.height, padding);
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
    {map(colorGroups, (colorGroup: TColorGroup) => (
      <ColorGroupRect
        key={JSON.stringify(colorGroup)}
        dimensions={dimensions}
        valueRange={valueRange}
        colorGroup={colorGroup}
        padding={CHART_PADDING}
      />
    ))}
    <Axis
      dimensions={dimensions}
      ticks={getXAxisTicks(dimensions.width, dateRange, CHART_PADDING)}
      padding={CHART_PADDING}
    />
    <Axis
      vertical
      dimensions={dimensions}
      ticks={getYAxisTicks(dimensions.height, valueRange, CHART_PADDING)}
      padding={CHART_PADDING}
    />
  </g>
);

export default ChartGrid;

