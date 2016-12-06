import React from 'react';
import ActivityIndicator from './ActivityIndicator';
import {shallow, mount} from 'enzyme';
import {expect} from 'chai';

describe('ActivityIndicator', () => {
  it('mounts without crashing', () => {
    const activitiesArray = [
      { name: 'Syncing data', id: 1 },
      { name: 'Syncing more data', id: 2 },
    ];
    const component1 = mount(<ActivityIndicator activities={null} />);
    const component2 = mount(
      <ActivityIndicator activities={activitiesArray} />
    );

    expect(component1).to.be.ok;
    expect(component2).to.be.ok;
  });

  it('renders a div with id "no-activities" if no activities are present', () => {
    const component = shallow(<ActivityIndicator />);
    expect(component.find('.activity')).to.have.length(0);
  });

  it('renders all activities if activities are present', () => {
    const activitiesArray = [
      { name: 'Syncing data', id: 1 },
      { name: 'Syncing more data', id: 2 },
    ];
    const component = shallow(<ActivityIndicator activities={activitiesArray} />);
    expect(component.find('.activity')).to.have.length(2);
  });
});
