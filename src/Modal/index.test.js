/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import { modalsSubStates } from '../../test/SampleApplicationStates';

import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders an invisible div if no modals exist', () => {
    const component = shallow(<Modal modals={[]} dispatch={jest.fn()} />);
    expect(component.find('div.no-modal')).to.have.length(1);
    expect(component.find('div.modal')).to.have.length(0);
  });

  describe('if modals exist', () => {
    const component = shallow(
      <Modal
        modals={modalsSubStates.oneModal}
        dispatch={jest.fn()}
      />);

    it('renders _one_ modal-container div', () => {
      expect(component.find('div.no-modal')).to.have.length(0);
      expect(component.find('div.modal-container')).to.have.length(1);
    });

    it('renders a modal-window div', () => {
      expect(component.find('div.modal-window')).to.have.length(1);
    });

    it('renders a confirm button', () => {
      expect(component.find('.confirm-modal-button')).to.have.length(1);
    });

    it('renders a cancel button', () => {
      expect(component.find('.cancel-modal-button')).to.have.length(1);
    });

    it('renders a title and message', () => {
      expect(component.find('.modal-title')).to.have.length(1);
      expect(component.find('.modal-message')).to.have.length(1);
    });
  });

  describe('actions', () => {
    const dispatch = jest.fn();
    const component = mount(
      <Modal
        modals={modalsSubStates.oneModal}
        dispatch={dispatch}
      />);

    it('dispatches confirmModal on click confirm', () => {
      component.find('.confirm-modal-button').simulate('click');
      expect(dispatch.mock.calls).to.have.length(1);
      expect(dispatch.mock.calls[0][0]).to.have.property('type', 'request confirm modal');
    });

    it('dispatches cancelModal on click cancel', () => {
      component.find('.cancel-modal-button').simulate('click');
      expect(dispatch.mock.calls).to.have.length(2);
      expect(dispatch.mock.calls[1][0]).to.have.property('type', 'request cancel modal');
    });
  });
});
