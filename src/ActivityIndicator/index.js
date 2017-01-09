import React from 'react';
import { connect } from 'react-redux';

export const ActivityIndicator = ({ isSyncing }) => (
  <div className="activity-list">
    {isSyncing ? <div className="activity">Syncing data ...</div> : null}
  </div>
);

ActivityIndicator.propTypes = {
  isSyncing: React.PropTypes.bool,
};

const stateToProps = state => ({
  isSyncing: state.metrics.isSyncing,
});

export default connect(stateToProps)(ActivityIndicator);
