import React from 'react';
import {shallow, render, mount} from 'enzyme';
import {expect} from 'chai';
import DataEntryContainer from './DataEntryContainer';
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries';
import SampleMetricsWithoutEntries from '../../test/SampleMetricsWithEntries';
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData';

describe('DataEntryContainer', () => {
  it('renders 2 MetricEntryContainers', () => {
    const callback = () => null;
    const component = shallow(
      <DataEntryContainer metrics={SampleMetricsWithEntries} onAction={callback} />
    );
    expect(component.find('MetricEntryContainer')).to.have.length(2);
  });
});
