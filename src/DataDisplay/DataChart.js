import React from 'react';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory';
import './DataChart.css';

import { metricShape } from '../types';

const DataChart = ({ metric }) => (
  <div className="data-chart-container">
    <VictoryChart theme={VictoryTheme.material}>
      <VictoryLine
        data={metric.entries}
        x={datum => new Date(datum.date)}
        y="value"
      />
    </VictoryChart>
  </div>
);

DataChart.propTypes = {
  metric: metricShape.isRequired,
};

export default DataChart;
