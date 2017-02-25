/* @flow */
import { createElement as c } from 'react';
import _ from 'lodash';
import type { TLinePoint } from '../types';

export function pathString(points: TLinePoint[]): string {
  return `M${_.join(_.map(points, point => `${point.x},${point.y}`), 'L')}`;
}

type TLineProps = {
  /**
   * Vertices of the path.
   * Each vertex must have an x and y value
   * and can optionally be assigned a color.
   */
  points: TLinePoint[],

  /**
   * Line width, in pixels.
   * Defaults to 1.
   */
  width?: number,

  /**
   * Line stroke color.
   * Defaults to 'black'.
   */
  color?: string,

  /**
   * Class name for the path
   */
  className?: string,
};

const Line = ({ points, width = 1, color = 'black', className = '' }: TLineProps) => c(
  'path', {
    d: pathString(points),
    stroke: color,
    strokeWidth: width,
    ...(className === '' ? {} : { className }),
  },
);

export default Line;

