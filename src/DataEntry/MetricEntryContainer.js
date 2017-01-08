import React from 'react';
import { connect } from 'react-redux';
import { metricShape } from '../types';
import { logMetric } from '../actions';

import ButtonRow from './ButtonRow';
import TextInput from './TextInput';

export const MetricEntryContainer = ({ metric, dispatch }) => {
  const { id } = metric;
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
        onClick={value => dispatch(logMetric(id, dateString, value))}
      />);
  } else {
    entryComponent = <TextInput onSubmit={value => dispatch(logMetric(id, dateString, value))} />;
  }

  return <div className="metric-entry-container">{entryComponent}</div>;
};

MetricEntryContainer.propTypes = {
  metric: metricShape.isRequired,
  dispatch: React.PropTypes.func.isRequired,
};

export default connect()(MetricEntryContainer);
