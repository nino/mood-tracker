/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import { ActivityIndicator } from '../ActivityIndicator';

describe('ActivityIndicator', () => {
  it('renders a Toaster if syncing', () => {
    const component = shallow(<ActivityIndicator isSyncing />);
    expect(component.find('Toaster')).to.have.length(1);
  });

  it('renders a Toaster if not syncing', () => {
    const component = shallow(<ActivityIndicator isSyncing={false} />);
    expect(component.find('Toaster')).to.have.length(1);
  });

  it('renders a toast in the toaster if syncing', () => {
    const component = mount(<ActivityIndicator isSyncing />).update();
    // $FlowFixMe
    expect(component.find('Toaster').get(0).getToasts).to.be.a('function');
    // $FlowFixMe
    expect(component.find('Toaster').get(0).getToasts().length).to.equal(1);
  });

  it('renders no toast in the toaster if not syncing', () => {
    const component = mount(<ActivityIndicator isSyncing={false} />).update();
    // $FlowFixMe
    expect(component.find('Toaster').get(0).getToasts).to.be.a('function');
    // $FlowFixMe
    expect(component.find('Toaster').get(0).getToasts().length).to.equal(0);
  });
});
