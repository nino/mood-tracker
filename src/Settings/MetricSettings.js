/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import type { TEditedMetric, TMetric, TNullableMetricProps } from '../types';
import type { TAction } from '../actionTypes';
import {
  startEditingMetric,
  updateEditedMetric,
  updateMetric,
  reorderMetrics,
  stopEditing,
  deleteMetric,
} from '../actions';
import ColorGroupsSettings from './ColorGroupsSettings';

import './MetricSettings.css';

type TMetricSettingsProps = {
  /**
   * A tracking metric must be provided.
   */
  metric: TEditedMetric | TMetric,

  /**
   * Setting this to true will enable the form fields
   * for manipulation by the user.
   * default value: false.
   */
  editing: boolean,

  /**
   * Send action to parent.
   */
  dispatch: (TAction) => void,
};


/**
 * Settings panel for a single metric, e.g. "Mood" or "Burns depression score".
 * This component displays form fields for all properties of the given metric.
 * By default, the form fields are disabled.
 * This can be changed by passing the prop editing=true.
 * Clicking the component should activate edit-mode.
 */
export const MetricSettings = ({ metric, editing, dispatch }: TMetricSettingsProps) => {
  let ButtonRow;
  if (editing) {
    ButtonRow = (
      <div className="metric-settings-button-row">
        <Button
          className="move-metric-up-button pt-icon-arrow-up"
          onClick={() => dispatch(reorderMetrics(metric.id, 'up'))}
        />
        <Button
          className="move-metric-down-button pt-icon-arrow-down"
          onClick={() => dispatch(reorderMetrics(metric.id, 'down'))}
        />
        <Button
          className="delete-metric-button pt-icon-delete pt-intent-danger"
          onClick={() => dispatch(deleteMetric(metric.id))}
        >
          Delete metric
        </Button>
        <span style={{ marginLeft: '1em' }} />
        <Button
          className="stop-editing-button pt-icon-cross pt-intention"
          onClick={() => dispatch(stopEditing())}
        >
          Cancel
        </Button>
        <Button
          className="update-metric-button pt-intent-success pt-icon-tick"
          onClick={() => dispatch(updateMetric(metric.id, metric.props, (new Date()).getTime()))}
        >
          Save
        </Button>
      </div>
    );
  } else {
    ButtonRow = (
      <div className="metric-settings-button-row">
        <Button
          className="start-editing-button pt-icon-edit"
          onClick={() => dispatch(startEditingMetric(metric.id))}
        >
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="metric-settings pt-card">
      <form id={`metric-settings-form-${metric.id}`}>
        <label className="pt-label" htmlFor="name">
          Name
          <input
            name="name"
            className="name-field pt-input"
            disabled={!editing}
            value={metric.props.name || ''}
            onChange={event => dispatch(updateEditedMetric({ name: event.target.value }))}
          />
        </label>
        <label className="pt-label" htmlFor="minValue">
          Min
          <input
            name="minValue"
            className="minValue-field pt-input"
            disabled={!editing}
            value={metric.props.minValue || ''}
            onChange={(event: SyntheticInputEvent) => dispatch(updateEditedMetric({ minValue: event.target.value }))}
          />
        </label>
        <label className="pt-label" htmlFor="maxValue">
          Max
          <input
            name="maxValue"
            className="maxValue-field pt-input"
            disabled={!editing}
            value={metric.props.maxValue || ''}
            onChange={event => dispatch(updateEditedMetric({ maxValue: event.target.value }))}
          />
        </label>
        <ColorGroupsSettings
          colorGroups={metric.props.colorGroups}
          editing={editing}
          onUpdate={newProps => dispatch(updateEditedMetric(newProps))}
        />
        {ButtonRow}
      </form>
    </div>
  );
};

export default connect()(MetricSettings);
