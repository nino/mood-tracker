// @flow
import React from 'react';
import Radium, { Style } from 'radium';
import { connect } from 'react-redux';
import type { TMetric, TColorGroup } from '../types';
import type { TAction } from '../actionTypes';
import { logMetric } from '../actions';

import ButtonRow from './ButtonRow';
import TextInput from './TextInput';

function getColors(values: number[], colorGroups: TColorGroup[]): string[] {
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
  metric: TMetric,
  dispatch: TAction => void,
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
        onClick={(value: number) => dispatch(logMetric(id, dateString, value))}
      />);
  } else {
    entryComponent = <TextInput onSubmit={value => dispatch(logMetric(id, dateString, value))} />;
  }

  return (
    <div
      className="metric-entry-container"
      style={{
        marginBottom: '1em',
      }}
    >
      <Style
        scopeSelector=".metric-entry-container + .metric-entry-container"
        rules={{
          marginTop: '1.6em',
        }}
      />
      <h4>{metric.props.name}</h4>
      {entryComponent}
    </div>
  );
};

export default connect()(Radium(MetricEntryContainer));
