/* @flow */
import React from 'react';
import ChartsContainer from '../Charts/ChartsContainer';
import DataEntryContainer from '../DataEntry/DataEntryContainer';
import Settings from '../Settings/Settings';

const MainUI = () => (
  <div style={{ padding: '10px' }}>
    <DataEntryContainer />
    <hr />
    <ChartsContainer />
    <hr />
    <Settings />
  </div>
);

export default MainUI;
