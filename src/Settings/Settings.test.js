/* eslint-env jest */
import React from 'react';
import { Provider } from 'react-redux';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import {
  MoodWithEntries,
  BurnsWithoutEntries,
} from '../../test/SampleMetrics';
import { INITIAL_STATE } from '../../test/SampleApplicationStates';

import Connected, { Settings } from './Settings';
import MetricSettings from './MetricSettings';

const mockStore = configureMockStore();

describe('Settings', () => {
  it('renders MetricSettings for each metric', () => {
    const component = shallow(
      <Settings metrics={[MoodWithEntries, BurnsWithoutEntries]} editedMetric={null} />);
    expect(component.find(MetricSettings)).to.have.length(2);
  });

  it('renders Add Metric button', () => {
    const component = shallow(<Settings metrics={[MoodWithEntries]} />);
    expect(component.find('#add-metric-button')).to.have.length(1);
    expect(component.find('#add-metric-button').first()).to.have.property('props')
      .and.to.be.a('function');
    expect(component.find('#add-metric-button').first().props())
      .to.have.property('disabled', false);
  });

  it('disables Add Metric button if editing', () => {
    const component = shallow(
      <Settings
        metrics={[MoodWithEntries, BurnsWithoutEntries]}
        editedMetric={{ id: 1, props: MoodWithEntries.props }}
      />);
    expect(component.find('#add-metric-button')).to.have.length(1);
    expect(component.find('#add-metric-button').first()).to.have.property('props')
      .and.to.be.a('function');
    expect(component.find('#add-metric-button').first().props())
      .to.have.property('disabled', true);
  });

  it('dispatches the addMetric action upon clicking the add metric button', () => {
    const store = mockStore(INITIAL_STATE);
    store.dispatch = jest.fn();
    const component = mount(
      <Provider store={store}>
        <Connected />
      </Provider>);
    const button = component.find('#add-metric-button');
    button.simulate('click');
    expect(store.dispatch.mock.calls).to.have.length(1);
    expect(store.dispatch.mock.calls[0]).to.have.length(1);
    expect(store.dispatch.mock.calls[0][0]).to.have.property('type', 'ADD_METRIC');
  });
});
