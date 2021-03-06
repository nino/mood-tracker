/* @flow */
/* eslint-env jest */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import AppHeader from './AppHeader';

describe('AppHeader', () => {
  it('renders a div#app-header', () => {
    expect(shallow(<AppHeader />).find('#app-header')).to.have.length(1);
  });
});
