/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import {
  MoodWithEntries,
  BurnsWithoutEntries,
} from '../../test/SampleMetrics';

import { DataDisplayContainer } from './DataDisplayContainer';
import DataChart from './DataChart';

describe('DataDisplayContainer', () => {
  it('shows a message if no metrics exist yet', () => {
    const component = shallow(
      <DataDisplayContainer
        metrics={[]}
      />);
    expect(component.text()).to.include('yet');
  });

  it('renders graphs if data is provided', () => {
    const component = shallow(
      <DataDisplayContainer
        metrics={[MoodWithEntries, BurnsWithoutEntries]}
      />);
    expect(component.find(DataChart)).to.have.length(2);
  });

  it('shows a message if metrics is null', () => {
    const component = shallow(<DataDisplayContainer />);
    expect(component.text()).to.include('yet');
  });
});
