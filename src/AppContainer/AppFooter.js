// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import { requestLogout } from '../actions';
import type { TApplicationState } from '../types';
import type { TAction } from '../actionTypes';
import './AppFooter.css';

type LogoutButtonProps = { logoutClick: (void) => void };

const LogoutButton = ({ logoutClick }: LogoutButtonProps) => (
  <Button onClick={logoutClick} className="logout-button pt-icon-log-out">
    Log out
  </Button>
);

type AppFooterProps = {
  logoutClick: (void) => void,
  loggedIn?: bool,
};

export const AppFooter = ({ loggedIn, logoutClick }: AppFooterProps) => (
  <div className="app-footer" style={{ padding: '12px' }}>
    <small>© 2017, Nino Annighöfer</small>
    {loggedIn ? <LogoutButton logoutClick={logoutClick} /> : <span />}
  </div>
);

AppFooter.defaultProps = { loggedIn: false };

const stateToProps = (state: TApplicationState) => ({
  loggedIn: state.authentication.isAuthenticated,
});

const dispatchToProps = (dispatch: TAction => void) => ({
  logoutClick: () => dispatch(requestLogout()),
});

export default connect(stateToProps, dispatchToProps)(AppFooter);
