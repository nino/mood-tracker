/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { ScrollBarItem } from './ScrollBar';

describe('ScrollBarItem', () => {
  it('renders a .chart-scrollbar-container', () => {
    const component = shallow(<ScrollBarItem width={400} dateRange={[0, 1000]} viewRange={[200, 300]} scrollBy={jest.fn()} />);
    expect(component.find('.chart-scrollbar-container')).to.have.length(1);
  });

  it('renders a .chart-scrollbar', () => {
    const component = shallow(<ScrollBarItem width={400} dateRange={[0, 1000]} viewRange={[200, 300]} scrollBy={jest.fn()} />);
    expect(component.find('.chart-scrollbar')).to.have.length(1);
  });

  it('sets the position and width of the scrollbar correctly', () => {
    const component = shallow(<ScrollBarItem width={400} dateRange={[0, 1000]} viewRange={[200, 300]} scrollBy={jest.fn()} />);
    const scrollBar = component.find('.chart-scrollbar').get(0);
    expect(scrollBar.props).to.have.deep.property('style.position', 'relative');
    expect(component.find('Draggable')).to.have.length(1);
    expect(component.find('Draggable').get(0)).to.have.deep.property('props.position.x', 80);
    expect(component.find('Draggable').get(0)).to.have.deep.property('props.position.y', 0);
    expect(scrollBar.props).to.have.deep.property('style.width', '40px');
  });
});
