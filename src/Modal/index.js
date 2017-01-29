/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import type { Modal as TModal, Action, ApplicationState } from '../types';
import { requestConfirmModal, requestCancelModal } from '../actions';

type ModalProps = {
  modals: TModal[],
  dispatch: Action => void,
};

export const Modal = ({ modals, dispatch }: ModalProps) => {
  if (modals.length === 0) {
    return <div className="no-modal" />;
  }

  const modal: TModal = modals[0];
  return (
    <Dialog isOpen title={modal.title}>
      <div className="pt-dialog-body">
        {modal.message}
      </div>
      <div className="pt-dialog-footer">
        <div className="pt-dialog-footer-actions">
          <Button
            className="cancel-modal-button"
            onClick={() => dispatch(requestCancelModal())}
          >
            {modal.actions.cancel.label}
          </Button>
          <Button
            intent={Intent.PRIMARY}
            className="confirm-modal-button"
            onClick={() => dispatch(requestConfirmModal())}
          >
            {modal.actions.confirm.label}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const stateToProps = (state: ApplicationState) => ({ modals: state.modals });

export default connect(stateToProps)(Modal);
