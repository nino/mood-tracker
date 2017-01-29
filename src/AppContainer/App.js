// @flow
import React from 'react';
import { connect } from 'react-redux';
import './App.css';
import MainUI from './MainUI';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import LoginScreen from '../components/LoginScreen';
import { beginSyncData, beginCheckLogin } from '../actions';
import Modal from '../Modal';
import ActivityIndicator from '../ActivityIndicator';
import type {
  ApplicationState,
  MetricsState,
  AuthenticationState,
} from '../types';

type AppProps = {
  // TODO add doc
  dispatch: (action: any) => void,
  metrics: MetricsState,
  authentication: AuthenticationState,
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
      child = (<ErrorMessage>Could not load data ...</ErrorMessage>);
    } else {
      child = <LoadingScreen />;
    }

    return (
      <div id="app-root">
        <AppHeader />
        {child}
        <AppFooter />
        <ActivityIndicator />
        <Modal />
      </div>
    );
  }
}

const stateToProps = (state: ApplicationState) => ({
  authentication: state.authentication,
  metrics: state.metrics,
});

export default connect(stateToProps)(App);
