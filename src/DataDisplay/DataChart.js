import React from 'react';
import { VictoryChart, VictoryLine } from 'victory';

import { metricShape } from '../types';

const DataChart = ({ metric }) => (
  <div className="data-chart-container">
    <VictoryChart>
      <VictoryLine data={metric.entries} x="date" y="value" />
    </VictoryChart>
  </div>
);

DataChart.propTypes = {
  metric: metricShape.isRequired,
};

export default DataChart;
