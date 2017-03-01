/* @flow */
/* global document window */
/* eslint-disable global-require */
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import App from './AppContainer/App';
import './index.css';
// $FlowFixMe
import '../node_modules/normalize.css/normalize.css';
// $FlowFixMe
import '../node_modules/@blueprintjs/core/dist/blueprint.css';
import { watcherSaga } from './sagas';
import { reducer } from './reducer';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ // eslint-disable-line no-underscore-dangle
  && window.__REDUX_DEVTOOLS_EXTENSION__(), // eslint-disable-line no-underscore-dangle
  applyMiddleware(sagaMiddleware),
);
sagaMiddleware.run(watcherSaga);

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root'),
);


if (module.hot) {
  // $FlowFixMe
  module.hot.accept('./AppContainer/App', () => {
    const NextApp = require('./AppContainer/App').default;
    ReactDOM.render(
      <Provider store={store}><NextApp /></Provider>,
      document.getElementById('root'),
    );
  });
}
