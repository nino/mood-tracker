/* @flow */
import React from 'react';
import DataDisplayContainer from '../DataDisplay/DataDisplayContainer';
import DataEntryContainer from '../DataEntry/DataEntryContainer';
import Settings from '../Settings/Settings';
import Divider from '../components/Divider';

const MainUI = () => (
  <div style={{ padding: '10px' }}>
    <DataEntryContainer />
    <Divider />
    <DataDisplayContainer />
    <Divider />
    <Settings />
  </div>
);

export default MainUI;
