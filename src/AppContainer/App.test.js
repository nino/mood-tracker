/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import {
  INITIAL_STATE,
  authSubStates,
  metricsSubStates,
  settingsSubStates,
} from '../../test/SampleApplicationStates';

import ConnectedApp, { App } from './App';
import LoginScreen from '../components/LoginScreen';

const mockStore = configureMockStore();

describe('App', () => {
  it('renders without crashing', () => {
    const dispatch = jest.fn();
    const { metrics, authentication } = INITIAL_STATE;
    const component = shallow(
      <App
        dispatch={dispatch}
        metrics={metrics}
        authentication={authentication}
      />);
    expect(component).to.be.ok;
  });

  it('dispatches "begin sync data" action if authenticated and not syncing', () => {
    const metricsOptions = [
      metricsSubStates.notSyncingNoData,
      metricsSubStates.notSyncingWithData,
    ];
    metricsOptions.forEach((metricsOption) => {
      const store = mockStore({
        metrics: metricsOption,
        settings: settingsSubStates.notEditing,
        authentication: authSubStates.authenticated,
        modals: [],
      });
      store.dispatch = jest.fn();

      mount(<Provider store={store}><ConnectedApp /></Provider>);

      expect(store.dispatch.mock.calls).to.have.length(1);
      expect(store.dispatch.mock.calls[0]).to.have.length(1);
      expect(store.dispatch.mock.calls[0][0]).to.have.property('type', 'BEGIN_SYNC_DATA');
    });
  });

  it('dispatches "begin check login" if not authenticated and not error', () => {
    const store = mockStore({
      metrics: metricsSubStates.notSyncingNoData,
      authentication: authSubStates.notAuthenicatedNotAuthenticating,
      modals: [],
      settings: settingsSubStates.notEditing,
    });
    store.dispatch = jest.fn();

    mount(<Provider store={store}><ConnectedApp /></Provider>);
    expect(store.dispatch.mock.calls).to.have.length(1);
    expect(store.dispatch.mock.calls[0]).to.have.length(1);
    expect(store.dispatch.mock.calls[0][0]).to.have.property('type', 'BEGIN_CHECK_LOGIN');
  });

  it('renders loading screen if authenticated and no data', () => {
    const metricsOptions = [
      metricsSubStates.notSyncingNoData,
      metricsSubStates.syncingNoData,
    ];
    metricsOptions.forEach((metricsOption) => {
      const component = shallow(
        <App
          metrics={metricsOption}
          authentication={authSubStates.authenticated}
        />);
      expect(component.find('LoadingScreen')).to.have.length(1);
    });
  });

  it('renders loading screen if authenticating', () => {
    const metricsOptions = [
      metricsSubStates.notSyncingNoData,
      metricsSubStates.syncingNoData,
    ];
    metricsOptions.forEach((metricsOption) => {
      const component = shallow(
        <App
          metrics={metricsOption}
          authentication={authSubStates.authenticated}
        />);
      expect(component.find('LoadingScreen')).to.have.length(1);
    });
  });

  it('renders loading screen if not authenticated and not authenticating', () => {
    const component = shallow(
      <App
        metrics={metricsSubStates.syncedMetricsWithEntries}
        authentication={authSubStates.notAuthenicatedNotAuthenticating}
        dispatch={() => null}
      />);
    expect(component.find('LoadingScreen')).to.have.length(1);
  });

  it('renders login screen if not authenticated and auth error', () => {
    const component = shallow(
      <App
        metrics={metricsSubStates.syncedMetricsWithEntries}
        authentication={authSubStates.withError}
        dispatch={() => null}
      />);
    expect(component.find(LoginScreen)).to.have.length(1);
  });

  it('renders MainUI if authenticated and has data', () => {
    const component = shallow(
      <App
        metrics={metricsSubStates.syncedMetricsWithEntries}
        authentication={authSubStates.authenticated}
      />);

    expect(component.find('MainUI')).to.have.length(1);
  });
});
