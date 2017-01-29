/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
/* global wrapComponent */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { AppFooter } from './AppFooter';

const ComponentWrapper = wrapComponent(AppFooter);

describe('AppFooter', () => {
  it('mounts without crashing', () => {
    const props = {
      logoutClick: jest.fn(),
      loggedIn: true,
    };
    const component = mount(<ComponentWrapper {...props} />);
    expect(component).to.be.ok;
  });

  it('renders a logout button if logged in', () => {
    const action = jest.fn();
    const component = mount(
      <ComponentWrapper
        logoutClick={action}
        loggedIn
      />);

    const button = component.find('button.logout-button');
    expect(button).to.have.length(1);
    button.first().simulate('click');
    expect(action.mock.calls).to.have.length(1);
  });

  it('does not render logout button if not logged in', () => {
    const action = jest.fn();
    const component = mount(
      <ComponentWrapper
        logoutClick={action}
        loggedIn={false}
      />);

    const button = component.find('button.logout-button');
    expect(button).to.have.length(0);
  });
});
