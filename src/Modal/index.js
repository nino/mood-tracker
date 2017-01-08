import React from 'react';
import { connect } from 'react-redux';
import { modalShape } from '../types';
import Button from '../components/Button';
import { requestConfirmModal, requestCancelModal } from '../actions';

export const Modal = ({ modals, dispatch }) => {
  if (!modals || modals.length === 0) {
    return <div className="no-modal" />;
  }

  const modal = modals[0];
  return (
    <div className="modal-container">
      <div className="modal-window">
        <div className="modal-title">{modal.title}</div>
        <div className="modal-message">{modal.message}</div>
        <div className="modal-buttons">
          <Button className="confirm-modal-button" onClick={() => dispatch(requestConfirmModal())}>
            {modal.actions.confirm.label}
          </Button>
          <Button className="cancel-modal-button" onClick={() => dispatch(requestCancelModal())}>
            {modal.actions.cancel.label}
          </Button>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  modals: React.PropTypes.arrayOf(modalShape).isRequired,
  dispatch: React.PropTypes.func.isRequired,
};

const stateToProps = state => ({ modals: state.modals });

export default connect(stateToProps)(Modal);
