/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { Toaster } from '@blueprintjs/core';
import type { TApplicationState } from '../types';

type ActivityIndicatorProps = {
  isSyncing: bool,
};

/* eslint-disable react/prefer-stateless-function */
export class ActivityIndicator extends React.Component {
  props: ActivityIndicatorProps;
  toaster: any;

  constructor(props: ActivityIndicatorProps) {
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

const stateToProps = (state: TApplicationState) => ({
  isSyncing: state.metrics.isSyncing,
});

export default connect(stateToProps)(ActivityIndicator);
