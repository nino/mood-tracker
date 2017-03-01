/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import {
  MoodWithEntries,
  BurnsWithoutEntries,
} from '../../test/SampleMetrics';

import { DataEntryContainer } from './DataEntryContainer';
import MetricEntryContainer from './MetricEntryContainer';

describe('DataEntryContainer', () => {
  it('renders `MetricEntryContainer`s', () => {
    const component = shallow(
      <DataEntryContainer metrics={[MoodWithEntries, BurnsWithoutEntries]} />);
    expect(component.find(MetricEntryContainer)).to.have.length(2);
  });

  it('renders a message if no metrics', () => {
    const component = shallow(<DataEntryContainer metrics={[]} />);
    expect(component.text()).to.include('yet');
  });
});
