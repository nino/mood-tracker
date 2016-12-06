import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import MetricEntryFormField from './MetricEntryFormField';
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries';
import SampleMetricsWithoutEntries from '../../test/SampleMetricsWithoutEntries';
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData';

describe('MetricEntryFormField', () => {
  it('renders an input field and a button', () => {
    const callback = () => null;
    const component = shallow(
      <MetricEntryFormField metric={SampleMetricsWithEntries[1]} onAction={callback} />
    );
    expect(component.find('Input')).to.have.length(1);
    expect(component.find('Button')).to.have.length(1);
  });

  it('calls the correct callback', () => {
    let cbAction;
    let cbParams;
    const callback = (action, params) => {
      cbAction = action;
      cbParams = params;
    };
    const component = mount(
      <MetricEntryFormField metric={SampleMetricsWithEntries[1]} onAction={callback} />
    );

    const inputField = component.find('input');
    inputField.node.value = '32';
    component.find('input').simulate('change', inputField);
    component.find('form').simulate('submit');
    expect(component.find('button')).to.have.length(1);
    expect(cbAction).to.equal('log metric');
    expect(cbParams).to.have.property('id').and.to.equal(2);
    expect(cbParams).to.have.property('rating', '32');
  });
});
