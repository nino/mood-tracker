import React from 'react';
import { connect } from 'react-redux';
import MetricSettings from './MetricSettings';
import Button from '../components/Button';
import * as Actions from '../actions';
import { metricShape, propsShape } from '../types';

/**
 * Container for the settings UI elements.
 * The primary purpose of the settings is
 * to add, modify, and delete tracked metrics.
 */
export const Settings = ({ metrics, editedMetric, addMetric }) => (
  <div className="settings">
    {metrics.map((metric) => {
      if (editedMetric && metric.id === editedMetric.id) {
        return <MetricSettings key={metric.id} metric={editedMetric} editing />;
      }
      return <MetricSettings key={metric.id} metric={metric} />;
    })}
    <Button onClick={addMetric} id="add-metric-button" disabled={!!editedMetric}>
      Add metric
    </Button>
  </div>
);

Settings.propTypes = {
  metrics: React.PropTypes.arrayOf(metricShape),
  editedMetric: React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    props: propsShape,
  }),
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
