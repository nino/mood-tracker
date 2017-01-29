/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import { MoodWithEntries, BurnsWithoutEntries } from '../../test/SampleMetrics';

import { MetricEntryContainer } from './MetricEntryContainer';
import ButtonRow from './ButtonRow';
import TextInput from './TextInput';

describe('MetricEntryContainer', () => {
  it('renders a ButtonRow for 12 or less allowed values', () => {
    const component = shallow(
      <MetricEntryContainer metric={MoodWithEntries} dispatch={jest.fn()} />);
    expect(component.find(ButtonRow)).to.have.length(1);
    expect(component.find(ButtonRow).first().props(), 'must give the ButtonRow exactly 10 values')
      .to.have.property('values').and.to.have.length(10);
  });

  it('renders a TextInput for more than 10 allowed values', () => {
    const component = shallow(
      <MetricEntryContainer metric={BurnsWithoutEntries} dispatch={jest.fn()} />);
    expect(component.find(TextInput)).to.have.length(1);
  });

  it('dispatches "log metric" action on pressing button row button', () => {
    const dispatch = jest.fn();
    const component = mount(<MetricEntryContainer metric={MoodWithEntries} dispatch={dispatch} />);
    component.find('.button-row-button').first().simulate('click');
    expect(dispatch.mock.calls).to.have.length(1);
    expect(dispatch.mock.calls[0][0]).to.have.property('type', 'LOG_METRIC');
    expect(dispatch.mock.calls[0][0]).to.have.property('metricId', 1);
    expect(dispatch.mock.calls[0][0]).to.have.property('value', 1);
    expect(dispatch.mock.calls[0][0]).to.have.property('date').and.to.be.a('string');
    expect(new Date(dispatch.mock.calls[0][0].date)).to.be.ok;
  });

  it('dispatches "log metric" action on submitting text form', () => {
    const dispatch = jest.fn();
    const component = mount(<MetricEntryContainer
      metric={BurnsWithoutEntries} dispatch={dispatch}
    />);
    component.find('input.metric-entry-text-input').get(0).value = '12';
    component.find('input.metric-entry-text-input').first().simulate('change');
    component.find('form').first().simulate('submit');
    expect(dispatch.mock.calls).to.have.length(1);
    expect(dispatch.mock.calls[0][0]).to.have.property('type', 'LOG_METRIC');
    expect(dispatch.mock.calls[0][0]).to.have.property('metricId', 2);
    expect(dispatch.mock.calls[0][0]).to.have.property('value', '12');
    expect(dispatch.mock.calls[0][0]).to.have.property('date').and.to.be.a('string');
  });
});
