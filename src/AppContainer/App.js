import React from 'react';
import './App.css';
import MainUI from './MainUI';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import LoginScreen from '../LoginScreen';
import { beginSyncData, beginCheckLogin } from '../actions';
import { connect } from 'react-redux';
import Modal from '../Modal';
// import ActivityList from '../ActivityIndicator';

export class App extends React.Component {
  propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    metrics: React.PropTypes.object.isRequired,
    authentication: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { dispatch, metrics, authentication } = this.props;
    const { isAuthenticated, isAuthenticating } = authentication;
    const { isSynced, isSyncing } = metrics;
    if (!isSynced && isAuthenticated) {
      dispatch(beginSyncData());
    }
    if (!isAuthenticated && !isAuthenticating && !authentication.hasError) {
      dispatch(beginCheckLogin());
    }
  }

  componentDidUpdate() {
    const { dispatch, metrics, authentication } = this.props;
    if (!metrics.isSynced
      && authentication.isAuthenticated
      && !metrics.isSyncing
      && !metrics.hasError) {
      dispatch(beginSyncData());
    }
  }

  render() {
    const { metrics, authentication } = this.props;
    const { isAuthenticated, isAuthenticating } = authentication;
    const { isSyncing, isSynced, items } = metrics;
    let child;

    if (!isAuthenticated) {
      child = authentication.hasError ? <LoginScreen /> : <LoadingScreen />;
    } else {
      if (items) {
        child = <MainUI />;
      } else if (metrics.hasError) {
        child = (<ErrorMessage>Could not load data ...</ErrorMessage>);
      } else {
        child = <LoadingScreen />;
      }
    }

    return (
      <div id='app-root'>
        <AppHeader />
        {child}
        <AppFooter />
        <Modal />
      </div>
    );
  }
}

const stateToProps = (state) => ({
  authentication: state.authentication,
  metrics: state.metrics,
});

export default connect(stateToProps)(App);
