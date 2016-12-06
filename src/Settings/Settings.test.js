import React from 'react';
import ReactDOM from 'react-dom';
import Settings from './Settings';
import {expect} from 'chai';
import {shallow, mount} from 'enzyme';
import SampleMetricsEmpty from '../../test/SampleMetricsEmpty';
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries';
import SampleMetricsWithoutEntries from '../../test/SampleMetricsWithoutEntries';
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData';

describe('Settings', () => {
  it('mounts without crashing', () => {
    expect(mount(
      <Settings
        metrics={SampleMetricsCorruptData}
        onAction={() => null}
      />
    )).to.be.ok;
  });

  it('has two MetricSettings children and a "Add Metric" button', () => {
    const callback = () => null;
    const component = shallow(
      <Settings metrics={SampleMetricsWithoutEntries} onAction={callback} />
    );
    expect(component.find('MetricSettings')).to.have.length(2);
    expect(component.find('Button#add-metric-button')).to.have.length(1);
  });

  it('calls the "add metric" action', () => {
    let cbAction;
    let cbParams;
    const callback = (action, params) => {
      cbAction = action;
      cbParams = params;
    };
    const component = mount(
      <Settings
        metrics={SampleMetricsWithoutEntries}
        onAction={callback}/>
    );
    component.find('button#add-metric-button').simulate('click');
    expect(cbAction).to.equal('add metric');
    expect(cbParams).to.be.empty;
  });
});
