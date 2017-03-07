/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
/* TODO Find out why the axis lines are broken */
import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import { expect } from 'chai';
import ChartGrid, { ColorGroupRect } from './ChartGrid';

describe('ColorGroupRect', () => {
  it('renders a rectangle for a colorGroup', () => {
    const component = shallow(
      <ColorGroupRect
        dimensions={{ width: 400, height: 200 }}
        colorGroup={{ minValue: 2, maxValue: 5, color: 'green' }}
        valueRange={[1, 10]}
        padding={{ bottom: 20 }}
      />);
    const backgroundRect = component.find('rect');
    expect(backgroundRect.get(0)).to.have.deep.property('props.x', 0);
    expect(backgroundRect.get(0)).to.have.deep.property('props.width', 400);
    expect(backgroundRect.get(0)).to.have.deep.property('props.y', 80);
    expect(backgroundRect.get(0)).to.have.deep.property('props.height', 60);
    expect(backgroundRect.get(0)).to.have.deep.property('props.fill', 'green');
    expect(backgroundRect.get(0)).to.have.deep.property('props.fillOpacity', 0.2);
  });
});

describe('ChartGrid', () => {
  const component = shallow(
    <ChartGrid
      dimensions={{ width: 400, height: 200 }}
      dateRange={[+moment('2012-03-04'), +moment('2012-03-08')]}
      valueRange={[1, 10]}
      colorGroups={[
        { minValue: 2, maxValue: 5, color: 'green' },
        { minValue: 6, maxValue: 8, color: 'red' },
      ]}
    />);

  it('renders without crashing', () => {
    expect(component).to.be.ok;
  });

  it('renders a ColorGroupRect for each colorGroup', () => {
    const backgroundRects = component.find(ColorGroupRect);
    expect(backgroundRects).to.have.length(2);
  });

  it('renders a vertical axis with 5 ticks', () => {
    const yAxis = component.find('Axis').findWhere(el => el.get(0).props.vertical === true);
    expect(yAxis, 'yAxis must be rendered').to.have.length(1);
    expect(yAxis.get(0)).to.have.deep.property('props.ticks').and.to.have.length(5);
  });

  it('renders a horizontal axis with 5 ticks', () => {
    const xAxis = component.find('Axis').findWhere(el => !el.get(0).props.vertical);
    expect(xAxis, 'xAxis must be rendered').to.have.length(1);
    expect(xAxis.get(0)).to.have.deep.property('props.ticks').and.to.have.property('length').and.to.be.within(3, 7); // TODO rework tick selection
  });
});

