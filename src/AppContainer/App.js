// @flow
import React from 'react';
import Radium, { Style } from 'radium';
import normalize from 'radium-normalize';
import { connect } from 'react-redux';
import MainUI from './MainUI';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import LoadingScreen from '../components/LoadingScreen';
import LoginScreen from '../components/LoginScreen';
import { beginSyncData, beginCheckLogin } from '../actions';
import Modal from '../Modal';
import ActivityIndicator from '../ActivityIndicator';
import type {
  TApplicationState,
  TMetricsState,
  TAuthenticationState,
} from '../types';
import type { TAction } from '../actionTypes';
import rootStyles from '../rootStyles';

type AppProps = {
  dispatch: (TAction) => void,
  metrics: TMetricsState,
  authentication: TAuthenticationState,
};

export class App extends React.Component {
  props: AppProps;
  state: void;

  componentDidMount() {
    const { dispatch, metrics, authentication } = this.props;
    const { isAuthenticated, isAuthenticating } = authentication;
    const { isSynced, isSyncing } = metrics;
    if (!isSynced && !isSyncing && isAuthenticated) {
      dispatch(beginSyncData());
    }
    if (!isAuthenticated && !isAuthenticating && !authentication.error) {
      dispatch(beginCheckLogin());
    }
  }

  componentDidUpdate() {
    const { dispatch, metrics, authentication } = this.props;
    if (!metrics.isSynced
      && authentication.isAuthenticated
      && !metrics.isSyncing
      && !metrics.error) {
      dispatch(beginSyncData());
    }
  }

  render() {
    const { metrics, authentication } = this.props;
    const { isAuthenticated } = authentication;
    const { items } = metrics;
    let child: React.Element<any> = <div />;

    if (!isAuthenticated) {
      child = authentication.error ? <LoginScreen /> : <LoadingScreen />;
    } else if (items) {
      child = <MainUI />;
    } else if (metrics.error) {
      child = (<div className="error-message">Could not load data ...</div>);
    } else {
      child = <LoadingScreen />;
    }

    return (
      <div id="app-root">
        <Style rules={normalize} />
        <Style rules={rootStyles} />
        <AppHeader />
        {child}
        <AppFooter />
        <ActivityIndicator />
        <Modal />
      </div>
    );
  }
}

const stateToProps = (state: TApplicationState) => ({
  authentication: state.authentication,
  metrics: state.metrics,
});

export default connect(stateToProps)(Radium(App));

