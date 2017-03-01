/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import moment from 'moment';
import {
  MoodWithEntries,
  BurnsWithoutEntries,
} from '../../test/SampleMetrics';
import { LINE_COLORS } from './constants';

import { ChartsContainer } from './ChartsContainer';
import Chart from './components/Chart';

describe('ChartsContainer', () => {
  it('shows a message if no metrics exist yet', () => {
    const component = shallow(
      <ChartsContainer metrics={[]} charts={[]} dispatch={jest.fn()} />);
    expect(component.text()).to.include('yet');
  });

  it('dispatches charts/CREATE_CHARTS if data is provided', () => {
    const dispatch = jest.fn();
    const component = mount(
      <ChartsContainer metrics={[MoodWithEntries, BurnsWithoutEntries]} charts={[]} dispatch={dispatch} />);
    expect(component).to.be.ok;
    expect(dispatch.mock.calls).to.have.length(1);
    expect(dispatch.mock.calls).to.have.deep.property('[0][0].type', 'charts/CREATE_CHARTS');
    expect(dispatch.mock.calls).to.have.deep.property('[0][0].metrics').and.to.eql([MoodWithEntries, BurnsWithoutEntries]);
  });

  it('renders Chart objects', () => {
    const component = shallow(
      <ChartsContainer
        metrics={[MoodWithEntries, BurnsWithoutEntries]}
        charts={[{
          id: 1,
          lines: [{
            metricId: MoodWithEntries.id,
            mode: 'on',
            color: LINE_COLORS[MoodWithEntries.id % LINE_COLORS.length],
          }],
          zoomFactor: 1,
          viewCenter: +moment('2012-02-02T23:42'),
        }, {
          id: 2,
          lines: [{
            metricId: BurnsWithoutEntries.id,
            mode: 'on',
            color: LINE_COLORS[BurnsWithoutEntries.id % LINE_COLORS.length],
          }],
          zoomFactor: 1,
          viewCenter: +moment('2015-02-05T23:11'),
        }]}
        dispatch={jest.fn()}
      />);
    expect(component.find(Chart)).to.have.length(2);
  });
});

