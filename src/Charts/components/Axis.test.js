/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { XAxis, YAxis } from './Axis';

describe('XAxis', () => {
  const component = shallow(
    <XAxis
      ticks={[
        { position: 3, label: 'Monday' },
        { position: 6, label: 'Tuesday' },
        { position: 9, label: 'Wednesday' },
      ]}
      dimensions={{ width: 100, height: 80 }}
      padding={{ bottom: 16 }}
    />);

  it('renders a line for each tick', () => {
    const ticks = component.find('Line.axis-tick');
    expect(ticks).to.have.length(3);
    expect(ticks.get(0)).to.have.deep.property('props.points[0].x', 3);
    expect(ticks.get(0)).to.have.deep.property('props.points[1].x', 3);
    expect(ticks.get(1)).to.have.deep.property('props.points[0].x', 6);
    expect(ticks.get(1)).to.have.deep.property('props.points[1].x', 6);
    expect(ticks.get(2)).to.have.deep.property('props.points[0].x', 9);
    expect(ticks.get(2)).to.have.deep.property('props.points[1].x', 9);
    ticks.forEach((tick) => {
      expect(tick.get(0)).to.have.deep.property('props.points[0].y').and.to.be.below(60);
      expect(tick.get(0)).to.have.deep.property('props.points[1].y').and.to.be.above(60);
    });
  });

  it('renders a text for each tick', () => {
    const labels = component.find('text');
    expect(labels).to.have.length(3);
    expect(labels.at(0).text()).to.eql('Monday');
    expect(labels.at(1).text()).to.eql('Tuesday');
    expect(labels.at(2).text()).to.eql('Wednesday');
    expect(labels.get(0)).to.have.deep.property('props.textAnchor', 'middle');
    expect(labels.get(1)).to.have.deep.property('props.textAnchor', 'middle');
    expect(labels.get(2)).to.have.deep.property('props.textAnchor', 'middle');
    expect(labels.get(0)).to.have.deep.property('props.x', 3);
    expect(labels.get(1)).to.have.deep.property('props.x', 6);
    expect(labels.get(2)).to.have.deep.property('props.x', 9);
  });
});

describe('YAxis', () => {
  const component = shallow(
    <YAxis
      ticks={[
        { position: 25, label: '1' },
        { position: 40, label: '4' },
        { position: 50, label: '6' },
      ]}
      dimensions={{ width: 100, height: 80 }}
      padding={{ bottom: 16 }}
    />);

  it('renders a line for each tick', () => {
    /* I mean, "axis tick" is a bit misleading,
     * since I'm actually using these lines
     * as the grid lines in the chart.
     * But it's fine, I guess.
     * I can always rename stuff later,
     * in case I want to make a distinction between
     * "grid lines" and "axis ticks".
     */
    const ticks = component.find('Line.yaxis-tick');
    expect(ticks, 'must render 3 Line.yaxis-tick').to.have.length(3);
    expect(ticks.get(0)).to.have.deep.property('props.points[0].x', 0);
    expect(ticks.get(1)).to.have.deep.property('props.points[0].x', 0);
    expect(ticks.get(2)).to.have.deep.property('props.points[0].x', 0);
    expect(ticks.get(0)).to.have.deep.property('props.points[1].x', 100);
    expect(ticks.get(1)).to.have.deep.property('props.points[1].x', 100);
    expect(ticks.get(2)).to.have.deep.property('props.points[1].x', 100);

    expect(ticks.get(0)).to.have.deep.property('props.points[0].y', 18.75);
    expect(ticks.get(0)).to.have.deep.property('props.points[1].y', 18.75);
    expect(ticks.get(1)).to.have.deep.property('props.points[0].y', 30);
    expect(ticks.get(1)).to.have.deep.property('props.points[1].y', 30);
    expect(ticks.get(2)).to.have.deep.property('props.points[0].y', 37.5);
    expect(ticks.get(2)).to.have.deep.property('props.points[1].y', 37.5);
  });

  it('renders a text for each tick', () => {
    const labels = component.find('text.yaxis-label');
    expect(labels, 'must render 3 text.yaxis-label').to.have.length(3);
    expect(labels.at(0).text()).to.eql('1');
    expect(labels.at(1).text()).to.eql('4');
    expect(labels.at(2).text()).to.eql('6');
    expect(labels.get(0)).to.have.deep.property('props.x');
    expect(labels.get(1)).to.have.deep.property('props.x');
    expect(labels.get(2)).to.have.deep.property('props.x');
    expect(labels.get(0)).to.have.deep.property('props.y', 18.75);
    expect(labels.get(1)).to.have.deep.property('props.y', 30);
    expect(labels.get(2)).to.have.deep.property('props.y', 37.5);
    expect(labels.get(0)).to.have.deep.property('props.textAnchor', 'left');
    expect(labels.get(1)).to.have.deep.property('props.textAnchor', 'left');
    expect(labels.get(2)).to.have.deep.property('props.textAnchor', 'left');
    expect(labels.get(0)).to.have.deep.property('props.alignmentBaseline', 'baseline');
    expect(labels.get(1)).to.have.deep.property('props.alignmentBaseline', 'baseline');
    expect(labels.get(2)).to.have.deep.property('props.alignmentBaseline', 'baseline');
  });
});
