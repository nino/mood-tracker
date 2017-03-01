/* @flow */
import React from 'react';

const localStorageMock = {
  setItem(key, item) {
    this[key] = item;
  },

  getItem(key) {
    return this[key];
  },

  removeItem(key) {
    this[key] = undefined;
  },
};

const DropboxControllerMock = {};

const wrapComponent = (Component: any) => (
  class ComponentWrapper extends React.Component { // eslint-disable-line react/prefer-stateless-function
    props: any;
    render() {
      return (<Component {...this.props}>{this.props.children}</Component>);
    }
  }
);

global.localStorage = localStorageMock;
global.DropboxController = DropboxControllerMock;
global.wrapComponent = wrapComponent;
