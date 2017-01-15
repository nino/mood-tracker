import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import { requestLogout } from '../actions';
import './AppFooter.css';

const LogoutButton = ({ logoutClick }) => (
  <Button onClick={logoutClick} className="logout-button pt-icon-log-out">
    Log out
  </Button>
);

LogoutButton.propTypes = { logoutClick: React.PropTypes.func.isRequired };

export const AppFooter = ({ loggedIn, logoutClick }) => (
  <div className="app-footer" style={{ padding: '12px' }}>
    <small>© 2017, Nino Annighöfer</small>
    {loggedIn ? <LogoutButton logoutClick={logoutClick} /> : <span />}
  </div>
);

AppFooter.propTypes = {
  logoutClick: React.PropTypes.func.isRequired,
  loggedIn: React.PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  loggedIn: state.authentication.isAuthenticated,
});

const dispatchToProps = dispatch => ({
  logoutClick: () => dispatch(requestLogout()),
});

export default connect(stateToProps, dispatchToProps)(AppFooter);
