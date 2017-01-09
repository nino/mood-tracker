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

const wrapComponent = Component => (
  class ComponentWrapper extends React.Component {
    render() {
      return (<Component {...this.props}>{this.children}</Component>);
    }
  }
);

global.localStorage = localStorageMock;
global.DropboxController = DropboxControllerMock;
global.wrapComponent = wrapComponent;
