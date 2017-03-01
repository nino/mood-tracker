/* @flow */
import React from 'react';
import Radium from 'radium';

const AppHeader = () => (
  <h3
    id="app-header"
    style={{
      backgroundColor: '#eee',
      marginTop: '0px',
      marginLeft: '0px',
      marginRight: '0px',
      marginBottom: '12px',
      padding: '3mm',
    }}
  >
    Mood Tracking App
  </h3>
);

export default Radium(AppHeader);
