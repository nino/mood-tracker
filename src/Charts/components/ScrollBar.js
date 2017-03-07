/* @flow */
import React from 'react';
import Radium from 'radium';
import Draggable, { type DraggableData } from 'react-draggable';

type TScrollBarProps = {
  /**
   * The timestamps bounding all the data
   */
  dateRange: [number, number],

  /**
   * The timestamps bounding the view
   */
  viewRange: [number, number],

  /**
   * Width of the parent container in pixels
   */
  width: number,

  /**
   * Callback function to dispatch scrollBy action
   */
  scrollBy: (deltaX: number) => void,
};

const ScrollBar = ({ width, viewRange, dateRange, scrollBy }: TScrollBarProps) => (
  <div
    className="chart-scrollbar-container"
    style={{
      display: 'block',
      width: '100%',
      height: '1ex',
      backgroundColor: '#eee',
      overflow: 'hidden',
    }}
  >
    <Draggable
      axis="x"
      onDrag={(event: Event, data: DraggableData) => scrollBy(data.deltaX)}
      position={{
        x: ((viewRange[0] - dateRange[0]) / (dateRange[1] - dateRange[0])) * width,
        y: 0,
      }}
    >
      <div
        className="chart-scrollbar"
        style={{
          left: `${((viewRange[0] - dateRange[0]) / (dateRange[1] - dateRange[0])) * width}px`,
          display: 'block',
          position: 'relative',
          height: '100%',
          backgroundColor: 'grey',
          width: `${((viewRange[1] - viewRange[0]) / (dateRange[1] - dateRange[0])) * width}px`,
        }}
      />
    </Draggable>
  </div>
);

export default Radium(ScrollBar);
