import React from 'react';
import { connect } from 'react-redux';
import { Toaster } from '@blueprintjs/core';

/* eslint-disable react/prefer-stateless-function */
export class ActivityIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.toaster = null;
  }

  componentDidUpdate() {
    if (this.props.isSyncing) {
      this.toaster.show({ message: 'Syncing ...' });
    }
  }

  render() {
    return (
      <div className="activity-list">
        <Toaster ref={(t) => { this.toaster = t; }} />
      </div>
    );
  }
}
/* eslint-enable react/prefer-stateless-function */

ActivityIndicator.propTypes = {
  isSyncing: React.PropTypes.bool,
};

const stateToProps = state => ({
  isSyncing: state.metrics.isSyncing,
});

export default connect(stateToProps)(ActivityIndicator);
