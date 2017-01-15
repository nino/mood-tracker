import React from 'react';
import { connect } from 'react-redux';
import { Button, Dialog, Intent } from '@blueprintjs/core';
import { modalShape } from '../types';
import { requestConfirmModal, requestCancelModal } from '../actions';

export const Modal = ({ modals, dispatch }) => {
  if (!modals || modals.length === 0) {
    return <div className="no-modal" />;
  }

  const modal = modals[0];
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

Modal.propTypes = {
  modals: React.PropTypes.arrayOf(modalShape).isRequired,
  dispatch: React.PropTypes.func.isRequired,
};

const stateToProps = state => ({ modals: state.modals });

export default connect(stateToProps)(Modal);
