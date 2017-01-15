import React from 'react';
import { connect } from 'react-redux';
import { metricShape } from '../types';
import { logMetric } from '../actions';
import './MetricEntryContainer.css';

import ButtonRow from './ButtonRow';
import TextInput from './TextInput';

function getColors(values, colorGroups) {
  if (!colorGroups || colorGroups.length === 0) {
    return values.map(() => null);
  }

  const colors = values.map(() => null);
  colorGroups.forEach((cg) => {
    for (let i = cg.minValue; i <= cg.maxValue; i += 1) {
      colors[i] = cg.color;
    }
  });
  return colors;
}

export const MetricEntryContainer = ({ metric, dispatch }) => {
  const { id } = metric;
  const { colorGroups } = metric.props;
  const date = new Date();
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  const dateString = date.toJSON();
  let entryComponent = null;

  if (metric.props.maxValue - metric.props.minValue <= 12) {
    const values = [];
    for (let i = metric.props.minValue; i <= metric.props.maxValue; i += 1) {
      values.push(i);
    }

    entryComponent = (
      <ButtonRow
        values={values}
        colors={getColors(values, colorGroups)}
        onClick={value => dispatch(logMetric(id, dateString, value))}
      />);
  } else {
    entryComponent = <TextInput onSubmit={value => dispatch(logMetric(id, dateString, value))} />;
  }

  return (
    <div className="metric-entry-container">
      <h4>{metric.props.name}</h4>
      {entryComponent}
    </div>
  );
};

MetricEntryContainer.propTypes = {
  metric: metricShape.isRequired,
  dispatch: React.PropTypes.func.isRequired,
};

export default connect()(MetricEntryContainer);
