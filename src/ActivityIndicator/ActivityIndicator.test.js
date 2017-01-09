import React from 'react';
import { ActivityIndicator } from '../ActivityIndicator';
import { shallow } from 'enzyme';
import { expect } from 'chai';

describe('ActivityIndicator', () => {
  it('renders a string if syncing', () => {
    const component = shallow(<ActivityIndicator isSyncing />);
    expect(component.text()).to.include('Syncing');
  });

  it('renders an empty div if not syncing', () => {
    const component = shallow(<ActivityIndicator isSyncing={false} />);
    expect(component.text()).not.to.include('Syncing');
  });
});
