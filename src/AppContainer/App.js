import React from 'react';
import './App.css';
import MainUI from './MainUI';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import LoginScreen from '../components/LoginScreen';
import { beginSyncData, beginCheckLogin } from '../actions';
import { connect } from 'react-redux';
import Modal from '../Modal';
import ActivityIndicator from '../ActivityIndicator';
import { stateShapes } from '../types';

export class App extends React.Component {
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
    let child;

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

App.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  metrics: stateShapes.metrics,
  authentication: stateShapes.authentication,
};

const stateToProps = state => ({
  authentication: state.authentication,
  metrics: state.metrics,
});

export default connect(stateToProps)(App);
