/* @flow */

export type TDimensions = {
  width: number,
  height: number,
};

export type TLinePoint = {
  x: number,
  y: number,
};

export type TRange = [number, number];

export type TAxisTick = {
  +position: number,
  +label: string,
};

export type TChartPadding = {
  +top?: number,
  +left?: number,
  +right?: number,
  +bottom?: number,
};

