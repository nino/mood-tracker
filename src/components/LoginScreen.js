/* @flow */
/* global window */
import React from 'react';
import Dropbox from 'dropbox';
import { Button } from '@blueprintjs/core';
import { CLIENT_ID } from '../constants';

function dropboxAuthRedirect() {
  const dbx = new Dropbox({ clientId: CLIENT_ID });
  const authUrl = dbx.getAuthenticationUrl(window.location);
  window.location = authUrl;
}

export const LoginScreen = () => (
  <div className="hero-wrapper">
    <Button onClick={dropboxAuthRedirect}>
      Log in using Dropbox
    </Button>
  </div>
);

export default LoginScreen;
