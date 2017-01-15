/* eslint-env jest */
/* eslint-disable no-unused-expressions */
/* global wrapComponent document */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import { Dialog } from '@blueprintjs/core';
import { modalsSubStates } from '../../test/SampleApplicationStates';

import { Modal } from '../Modal';

/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/prop-types */
class WrappedComponent extends React.Component {
  render() {
    return (
      <Modal modals={this.props.modals} dispatch={this.props.dispatch} />
    );
  }
}
/* eslint-enable react/prefer-stateless-function */
/* eslint-enable react/prop-types */

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

    it('renders one modal-container div', () => {
      expect(component.find('div.no-modal')).to.have.length(0);
      expect(component.find(Dialog)).to.have.length(1);
    });

    it('renders a modal-window div', () => {
      expect(component.find('.pt-dialog-body')).to.have.length(1);
    });

    it('renders a confirm button', () => {
      expect(component.find('.confirm-modal-button')).to.have.length(1);
    });

    it('renders a cancel button', () => {
      expect(component.find('.cancel-modal-button')).to.have.length(1);
    });
  });

  describe('actions', () => {
    const dispatch = jest.fn();

    beforeAll(() => {
      mount(
        <WrappedComponent
          modals={modalsSubStates.oneModal}
          dispatch={dispatch}
        />,
        { attachTo: document.body },
      );
    });

    it('dispatches confirmModal on click confirm', () => {
      expect(document.getElementsByClassName('confirm-modal-button')).to.have.length(1);
      document.getElementsByClassName('confirm-modal-button')[0].click();
      expect(dispatch.mock.calls).to.have.length(1);
      expect(dispatch.mock.calls[0][0]).to.have.property('type', 'request confirm modal');
    });

    it('dispatches cancelModal on click cancel', () => {
      expect(document.getElementsByClassName('cancel-modal-button')).to.have.length(1);
      document.getElementsByClassName('cancel-modal-button')[0].click();
      expect(dispatch.mock.calls).to.have.length(2);
      expect(dispatch.mock.calls[1][0]).to.have.property('type', 'request cancel modal');
    });
  });
});
