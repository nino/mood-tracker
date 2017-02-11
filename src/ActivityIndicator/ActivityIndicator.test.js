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
    expect(typeof component.find('Toaster').get(0).props.getToasts === 'function');
    expect(component.find('Toaster').get(0).props.getToasts().length).to.equal(1);
  });

  it('renders no toast in the toaster if not syncing', () => {
    const component = mount(<ActivityIndicator isSyncing={false} />).update();
    expect(typeof component.find('Toaster').get(0).props.getToasts === 'function');
    expect(component.find('Toaster').get(0).props.getToasts().length === 0);
  });
});
