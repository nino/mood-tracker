/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import Line from './Line';
import { type TLinePoint } from '../types';

describe('Line', () => {
  const points: TLinePoint[] = [
    { x: 2, y: 3 },
    { x: 4, y: 8 },
    { x: 7, y: 1 },
    { x: 9, y: 2 },
  ];
  const component = shallow(<Line points={points} color="green" />);

  it('renders a path node with a control point at each point', () => {
    expect(component.find('path')).to.have.length(1);
    expect(component.find('path').get(0)).to.have.deep.property('props.d', 'M2,3L4,8L7,1L9,2');
  });

  it('renders the path using the correct color', () => {
    expect(component.find('path').get(0)).to.have.deep.property('props.stroke', 'green');
  });

  it('gives the path a className if one is provided', () => {
    const component2 = shallow(<Line points={points} color="green" className="hello" />);
    expect(component.find('path').get(0)).not.to.have.deep.property('props.className');
    expect(component2.find('path').get(0)).to.have.deep.property('props.className', 'hello');
  });
});

