import React from 'react';
import { AppFooter } from './AppFooter';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

const ComponentWrapper = wrapComponent(AppFooter);

describe('AppFooter', () => {
  it('mounts without crashing', () => {
    const props = {
      logoutClick: jest.fn(),
      loggedIn: true,
    };
    const component = mount(
      <ComponentWrapper {...props} />
    );
    expect(component).to.be.ok;
  });

  it('renders a logout button if logged in', () => {
    const action = jest.fn();
    const component = mount(
      <ComponentWrapper logoutClick={action} loggedIn={true} />
    );

    const button = component.find('button.logout-button');
    expect(button).to.have.length(1);
    button.first().simulate('click');
    expect(action.mock.calls).to.have.length(1);
  });

  it('does not render logout button if not logged in', () => {
    const action = jest.fn();
    const component = mount(
      <ComponentWrapper logoutClick={action} loggedIn={false} />
    );

    const button = component.find('button.logout-button');
    expect(button).to.have.length(0);
  });
});
