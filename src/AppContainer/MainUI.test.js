/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import MainUI from './MainUI';
import DataEntryContainer from '../DataEntry/DataEntryContainer';
import DataDisplayContainer from '../DataDisplay/DataDisplayContainer';
import Settings from '../Settings/Settings';

describe('MainUI', () => {
  it('renders all subcomponents', () => {
    const component = shallow(<MainUI />);
    expect(
      component.find(DataEntryContainer),
      'must render DataEntryContainer',
    ).to.have.length(1);
    expect(
      component.find(DataDisplayContainer),
      'must render DataDisplayContainer',
    ).to.have.length(1);
    expect(component.find(Settings), 'must render Settings')
      .to.have.length(1);
  });
});
