import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import MetricSettings from './MetricSettings';
import * as Actions from '../actions';
import { metricShape, editedMetricShape } from '../types';

/**
 * Container for the settings UI elements.
 * The primary purpose of the settings is
 * to add, modify, and delete tracked metrics.
 */
export const Settings = ({ metrics, editedMetric, addMetric }) => (
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
    >
      Add metric
    </Button>
  </div>
);

Settings.propTypes = {
  metrics: React.PropTypes.arrayOf(metricShape),
  editedMetric: editedMetricShape,
  addMetric: React.PropTypes.func.isRequired,
};

const stateToProps = state => ({
  metrics: state.metrics.items,
  editedMetric: state.settings.editedMetric,
});

const dispatchToProps = dispatch => ({
  addMetric: () => dispatch(Actions.addMetric()),
});

export default connect(stateToProps, dispatchToProps)(Settings);
