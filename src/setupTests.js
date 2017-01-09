import React from 'react';

const localStorageMock = {
  setItem: function(key, item) {
    this[key] = item;
  },

  getItem: function(key) {
    return this[key];
  },

  removeItem: function(key) {
    this[key] = undefined;
  }
}

let DropboxControllerMock = {
};

const wrapComponent = (Component) => (
  class ComponentWrapper extends React.Component {
    render() {
      return (
        <Component {...this.props}>{this.children}</Component>
      );
    }
  }
);

global.localStorage = localStorageMock;
global.DropboxController = DropboxControllerMock;
global.wrapComponent = wrapComponent;
