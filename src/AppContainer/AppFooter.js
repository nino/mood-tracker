import React from 'react';
import { connect } from 'react-redux';
import Button from '../components/Button';
import { requestLogout } from '../actions';

const LogoutButton = ({ logoutClick }) => (
  <Button onClick={logoutClick} className="logout-button">
    Log out
  </Button>
);

LogoutButton.propTypes = { logoutClick: React.PropTypes.func.isRequired };

export const AppFooter = ({ loggedIn, logoutClick }) => (
  <div className="app-footer">
    <small>© 2016, Nino Annighöfer</small>
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
