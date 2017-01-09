import React from 'react';
import { connect } from 'react-redux';
import { colorGroupShape } from '../types';
import {
  startEditingMetric,
  updateEditedMetric,
  updateMetric,
  reorderMetrics,
  stopEditing,
  deleteMetric,
} from '../actions';
import Button from '../components/Button';
import ColorGroupsSettings from './ColorGroupsSettings';

import './MetricSettings.css';

/**
 * Settings panel for a single metric, e.g. "Mood" or "Burns depression score".
 * This component displays form fields for all properties of the given metric.
 * By default, the form fields are disabled.
 * This can be changed by passing the prop editing=true.
 * Clicking the component should activate edit-mode.
 */
export const MetricSettings = ({ metric, editing, dispatch }) => {
  let ButtonRow;
  if (editing) {
    ButtonRow = (
      <div className="metric-settings-button-row">
        <Button
          className="move-metric-up-button"
          onClick={() => dispatch(reorderMetrics(metric.id, 'up'))}
        >
          ▲
        </Button>
        <Button
          className="move-metric-down-button"
          onClick={() => dispatch(reorderMetrics(metric.id, 'down'))}
        >
          ▼
        </Button>
        <Button
          className="update-metric-button"
          onClick={() => dispatch(updateMetric(metric.id, metric.props, (new Date()).getTime()))}
        >
          Save
        </Button>
        <Button
          className="stop-editing-button"
          onClick={() => dispatch(stopEditing())}
        >
          Cancel
        </Button>
        <Button
          className="delete-metric-button"
          onClick={() => dispatch(deleteMetric(metric.id))}
        >
          ×
        </Button>
      </div>
    );
  } else {
    ButtonRow = (
      <div className="metric-settings-button-row">
        <Button
          className="start-editing-button"
          onClick={() => dispatch(startEditingMetric(metric.id))}
        >
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="metric-settings">
      <form id={`metric-settings-form-${metric.id}`}>
        <label htmlFor="name">Name</label>
        <input
          name="name"
          className="name-field"
          disabled={!editing}
          value={metric.props.name || ''}
          onChange={event => dispatch(updateEditedMetric({ name: event.target.value }))}
        />
        <br />
        <label htmlFor="minValue">Min</label>
        <input
          name="minValue"
          className="minValue-field"
          disabled={!editing}
          value={metric.props.minValue || ''}
          onChange={event => dispatch(updateEditedMetric({ minValue: event.target.value }))}
        />
        <br />
        <label htmlFor="maxValue">Max</label>
        <input
          name="maxValue"
          className="maxValue-field"
          disabled={!editing}
          value={metric.props.maxValue || ''}
          onChange={event => dispatch(updateEditedMetric({ maxValue: event.target.value }))}
        />
        <br />
        <ColorGroupsSettings
          colorGroups={metric.props.colorGroups}
          editing={editing}
          onUpdate={newProps => dispatch(updateEditedMetric(newProps))}
        />
        <br />
        {ButtonRow}
      </form>
    </div>
  );
};

MetricSettings.propTypes = {
  /**
   * A tracking metric must be provided.
   */
  metric: React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    props: React.PropTypes.shape({
      name: React.PropTypes.string,
      minValue: React.PropTypes.number,
      maxValue: React.PropTypes.number,
      type: React.PropTypes.string,
      colorGroups: React.PropTypes.arrayOf(colorGroupShape).isRequired,
    }).isRequired,
  }).isRequired,

  /**
   * Setting this to true will enable the form fields
   * for manipulation by the user.
   * default value: false.
   */
  editing: React.PropTypes.bool,

  /**
   * Send action to parent.
   */
  dispatch: React.PropTypes.func.isRequired,
};

export default connect()(MetricSettings);
