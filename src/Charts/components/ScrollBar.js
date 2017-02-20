/* @flow */
import React from 'react';
import Measure from 'react-measure';
import Draggable, { DraggableData } from 'react-draggable';
import './ScrollBar.css';

type TScrollBarProps = {
  /**
   * The timestamps bounding all the data
   */
  dateRange: [number, number],

  /**
   * The timestamps bounding the view
   */
  viewRange: [number, number],

  scrollBy: (deltaX: number) => void,
};

type TScrollBarItemProps = {
  viewRange: [number, number],
  dateRange: [number, number],
  width: number,
  scrollBy: (deltaX: number) => void,
};

/**
 * This component is the actual scroll-bar, and should be used for testing.
 * `ScrollBar` is just a proxy used for measuring the size of the chart
 * and passing the dimensions to `ScrollBarItem`.
 */
export const ScrollBarItem = ({ width, viewRange, dateRange, scrollBy }: TScrollBarItemProps) => (
  <div
    className="chart-scrollbar-container"
    style={{ display: 'block', overflow: 'hidden' }}
  >
    <Draggable
      axis="x"
      onDrag={(event: Event, data: DraggableData) => scrollBy(data.deltaX)}
      position={{ x: ((viewRange[0] - dateRange[0]) / (dateRange[1] - dateRange[0])) * width, y: 0 }}
    >
      <div
        className="chart-scrollbar"
        style={{
          display: 'block',
          position: 'relative',
          width: `${((viewRange[1] - viewRange[0]) / (dateRange[1] - dateRange[0])) * width}px`,
        }}
      />
    </Draggable>
  </div>
);

const ScrollBar = ({ dateRange, viewRange, scrollBy }: TScrollBarProps) => (
  <Measure>
    {(dimensions: { width: number, height: number }) => (
      <ScrollBarItem width={dimensions.width} viewRange={viewRange} dateRange={dateRange} scrollBy={scrollBy} />
    )}
  </Measure>
);

export default ScrollBar;
