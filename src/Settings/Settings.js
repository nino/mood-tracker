/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import MetricSettings from './MetricSettings';
import * as Actions from '../actions';
import type { TMetric, TEditedMetric, TApplicationState } from '../types';
import type { TAction } from '../actionTypes';

type TSettingsProps = {
  metrics: TMetric[],
  editedMetric: TEditedMetric | null,
  addMetric: (TAction) => void,
};

/**
 * Container for the settings UI elements.
 * The primary purpose of the settings is
 * to add, modify, and delete tracked metrics.
 */
export const Settings = ({ metrics, editedMetric, addMetric }: TSettingsProps) => (
  <div className="settings">
    <h4>Settings</h4>
    {metrics.map((metric) => {
      if (editedMetric && metric.id === editedMetric.id) {
        return <MetricSettings key={metric.id} metric={editedMetric} editing />;
      }
      return <MetricSettings key={metric.id} metric={metric} />;
    })}
    <Button
      onClick={addMetric}
      id="add-metric-button"
      disabled={!!editedMetric}
      className="pt-icon-add"
      style={{
        marginTop: '2ex',
      }}
    >
      Add metric
    </Button>
  </div>
);

const stateToProps = (state: TApplicationState) => ({
  metrics: state.metrics.items,
  editedMetric: state.settings.editedMetric,
});

const dispatchToProps = (dispatch: (TAction) => void) => ({
  addMetric: () => dispatch(Actions.addMetric()),
});

export default connect(stateToProps, dispatchToProps)(Settings);
