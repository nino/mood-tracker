/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
/* global wrapComponent */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import Legend from './Legend';
import { MoodWithEntries } from '../../../test/SampleMetrics';
import type { TMetric, TChartLine } from '../../types';

const Mood1: TMetric = {
  ...MoodWithEntries,
  id: 1,
  props: {
    ...MoodWithEntries.props,
    name: 'Mood1',
  },
};

const Mood2: TMetric = {
  ...MoodWithEntries,
  id: 2,
  props: {
    ...MoodWithEntries.props,
    name: 'Mood2',
  },
};

const Mood3: TMetric = {
  ...MoodWithEntries,
  id: 3,
  props: {
    ...MoodWithEntries.props,
    name: 'Mood3',
  },
};

const lines: TChartLine[] = [
  {
    metricId: 1,
    color: 'green',
    mode: 'on',
  }, {
    metricId: 2,
    color: 'red',
    mode: 'loess',
  }, {
    metricId: 3,
    color: 'blue',
    mode: 'off',
  },
];

const cycleMode = jest.fn();
const shallowComponent = shallow(<Legend metrics={[Mood1, Mood2, Mood3]} lines={lines} cycleMode={jest.fn()} />);
const mountedComponent = mount(<Legend metrics={[Mood1, Mood2, Mood3]} lines={lines} cycleMode={cycleMode} />);

describe('Legend', () => {
  it('renders a div.chart-legend', () => {
    expect(shallowComponent.find('div.chart-legend')).to.have.length(1);
  });

  it('contains a .legend-item with role=button for each line', () => {
    const legendItems = shallowComponent.find('.legend-item');
    expect(legendItems).to.have.length(3);
    legendItems.forEach((item) => {
      expect(item.get(0)).to.have.deep.property('props.role', 'button');
    });
  });

  it('renders the correct .legend-icon for each .legend-item, depending on mode', () => {
    const legendItems = shallowComponent.find('.legend-icon');
    expect(legendItems.get(0).props).to.have.property('className', 'legend-icon legend-icon-on');
    expect(legendItems.get(1).props).to.have.property('className', 'legend-icon legend-icon-loess');
    expect(legendItems.get(2).props).to.have.property('className', 'legend-icon legend-icon-off');
  });

  it('renders each metric\'s name', () => {
    const metricNames = shallowComponent.find('.legend-item > .legend-metric-name');
    expect(metricNames).to.have.length(3);
    expect(metricNames.get(0).props.children).to.eql('Mood1');
    expect(metricNames.get(1).props.children).to.eql('Mood2');
    expect(metricNames.get(2).props.children).to.eql('Mood3');
  });

  it('renders invisible metrics\' names with class .text-dimmed', () => {
    expect(shallowComponent.find('.legend-item > .legend-metric-name').get(2)).to.have.deep.property('props.className').and.to.include('text-dimmed');
  });

  it('calls cycleMode on click on a .legend-item', () => {
    const legendItems = mountedComponent.find('.legend-item');
    legendItems.at(0).simulate('click');
    legendItems.at(1).simulate('click');
    legendItems.at(2).simulate('click');
    expect(cycleMode.mock.calls).to.have.length(3);
    expect(cycleMode.mock.calls[0]).to.eql([1]);
    expect(cycleMode.mock.calls[1]).to.eql([2]);
    expect(cycleMode.mock.calls[2]).to.eql([3]);
  });
});

