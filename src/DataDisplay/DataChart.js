import React from 'react';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryZoom } from 'victory';

import { metricShape } from '../types';

const DataChart = ({ metric }) => (
  <div className="data-chart-container">
    <VictoryZoom>
      <VictoryChart theme={VictoryTheme.material} height={300}>
        <VictoryLine
          data={metric.entries}
          x={datum => new Date(datum.date)}
          y="value"
        />
      </VictoryChart>
    </VictoryZoom>
  </div>
);

DataChart.propTypes = {
  metric: metricShape.isRequired,
};

export default DataChart;
