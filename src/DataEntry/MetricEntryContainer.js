// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Metric, Action, ColorGroup } from '../types';
import { logMetric } from '../actions';
import './MetricEntryContainer.css';

import ButtonRow from './ButtonRow';
import TextInput from './TextInput';

function getColors(values: number[], colorGroups: ColorGroup[]): string[] {
  if (!colorGroups || colorGroups.length === 0) {
    return values.map(() => '');
  }

  const colors: string[] = values.map(() => '');
  colorGroups.forEach((cg) => {
    for (let i = cg.minValue; i <= cg.maxValue; i += 1) {
      colors[i] = cg.color;
    }
  });
  return colors;
}

type MetricEntryContainerProps = {
  metric: Metric,
  dispatch: Action => void,
};

export const MetricEntryContainer = ({ metric, dispatch }: MetricEntryContainerProps) => {
  const { id } = metric;
  const { colorGroups } = metric.props;
  const date = new Date();
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  const dateString = date.toJSON();
  let entryComponent: React.Element<any> = <div />;

  if (metric.props.maxValue - metric.props.minValue <= 12) {
    const values: number[] = [];
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

export default connect()(MetricEntryContainer);
