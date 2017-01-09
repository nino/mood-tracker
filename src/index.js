/* global document window */
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import App from './AppContainer/App';
import './index.css';
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
