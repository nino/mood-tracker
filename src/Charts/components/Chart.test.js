/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import moment from 'moment';
import { shallow, mount } from 'enzyme';
import { MoodWithEntries, BurnsWithEntries } from '../../../test/SampleMetrics';
import { LINE_COLORS, FOUR_WEEKS } from '../constants';

import { ChartMeasured as Chart } from './Chart';
import Line from './Line';
import ChartGrid from './ChartGrid';
import Legend from './Legend';
import ScrollBar from './ScrollBar';

const chart1 = {
  id: 1,
  lines: [{
    metricId: 1,
    mode: 'on',
    color: LINE_COLORS[1],
  }],
  zoomFactor: 1,
  viewCenter: +moment('2016-11-21T23:23'),
};

const dispatch = jest.fn();
const mounted = mount(
  <Chart
    chart={chart1}
    dispatch={dispatch}
    metrics={[MoodWithEntries]}
    dimensions={{
      width: 400,
      height: 200,
    }}
  />);

const chart2 = {
  id: 2,
  lines: [{
    metricId: 2,
    mode: 'on',
    color: LINE_COLORS[2],
  }],
  zoomFactor: 2,
  viewCenter: +moment('2017-01-24T12:45'),
};

const component = shallow(
  <Chart
    chart={chart2}
    dispatch={jest.fn()}
    metrics={[BurnsWithEntries]}
    dimensions={{
      width: 400,
      height: 200,
    }}
  />);

describe('Chart', () => {
  it('renders a div.chart', () => {
    expect(component.find('div.chart')).to.have.length(1);
  });

  it('renders a svg.chart', () => {
    expect(component.find('svg.chart')).to.have.length(1);
  });

  it('renders a ScrollBar', () => {
    const scrollBar = component.find(ScrollBar);
    expect(scrollBar).to.have.length(1);
    const props = scrollBar.get(0).props;
    expect(props).to.have.deep.property('viewRange[0]').and.to.be.closeTo(+moment('2017-01-24T12:45') - (FOUR_WEEKS / 2), 10);
    expect(props).to.have.deep.property('viewRange[1]').and.to.be.closeTo(+moment('2017-01-24T12:45') + (FOUR_WEEKS / 2), 10);
    expect(props).to.have.property('width', 400);
  });

  it('renders a ChartGrid', () => {
    const chartGrid = component.find(ChartGrid);
    expect(chartGrid, 'must render ChartGrid').to.have.length(1);
    expect(chartGrid.get(0)).to.have.deep.property('props.dimensions.width', 400);
    expect(chartGrid.get(0)).to.have.deep.property('props.dimensions.height', 200);
    expect(chartGrid.get(0)).to.have.deep.property('props.padding.bottom', 20);
    expect(chartGrid.get(0)).to.have.deep.property('props.dateRange[0]').and.to.be.closeTo(+moment('2017-01-24T12:45') - (FOUR_WEEKS / 2), 10);
    expect(chartGrid.get(0)).to.have.deep.property('props.dateRange[1]').and.to.be.closeTo(+moment('2017-01-24T12:45') + (FOUR_WEEKS / 2), 10);
    expect(chartGrid.get(0)).to.have.deep.property('props.valueRange[0]', 0);
    expect(chartGrid.get(0)).to.have.deep.property('props.valueRange[1]', 100);
  });

  it('renders a Line for each chart.line', () => {
    const lines = component.find(Line);
    expect(lines).to.have.length(1);
    expect(lines.get(0)).to.have.deep.property('props.points').and.to.have.length(1);
    expect(lines.get(0)).to.have.deep.property('props.color', LINE_COLORS[2]);
  });

  it('only passes those points to the Line components that are in view or have a next neighbor that is in view', () => {
    const component2 = shallow(
      <Chart
        metrics={[{
          ...MoodWithEntries,
          entries: [{
            date: moment('2013-04-14T23:23').toJSON(),
            value: 10,
          }, {
            date: moment('2013-04-15T23:23').toJSON(),
            value: 10,
          }, {
            date: moment('2013-04-16T23:23').toJSON(),
            value: 10,
          }, {
            date: moment('2013-04-17T23:23').toJSON(),
            value: 10,
          }, {
            date: moment('2013-04-18T23:23').toJSON(),
            value: 10,
          }, {
            date: moment('2013-04-19T23:23').toJSON(),
            value: 10,
          }, {
            date: moment('2013-04-20T23:23').toJSON(),
            value: 10,
          }],
        }]}
        chart={{
          id: 2,
          lines: [{
            metricId: MoodWithEntries.id,
            mode: 'on',
            color: LINE_COLORS[MoodWithEntries.id % LINE_COLORS.length],
          }],
          viewCenter: +moment('2013-04-17T23:23'),
          zoomFactor: 2, // see a bit more than 2 days -- TODO check that this is the correct number
        }}
        dispatch={jest.fn()}
        dimensions={{ width: 400, height: 200 }}
      />);
    const line = component2.find(Line).get(0);
    expect(line.props, JSON.stringify(line.props.points)).to.have.property('points').and.to.have.length(5);
  });

  it('renders two zoom buttons', () => {
    const zoomInButton = component.find('Button.chart-zoom-in-button');
    const zoomOutButton = component.find('Button.chart-zoom-out-button');
    expect(zoomInButton).to.have.length(1);
    expect(zoomOutButton).to.have.length(1);
    expect(zoomInButton.get(0)).to.have.deep.property('props.onClick').and.to.be.a('function');
    expect(zoomOutButton.get(0)).to.have.deep.property('props.onClick').and.to.be.a('function');
  });

  it('renders a Legend', () => {
    const legend = component.find(Legend);
    expect(legend).to.have.length(1);
    expect(legend.get(0)).to.have.deep.property('props.lines').and.to.eql(chart2.lines);
    expect(legend.get(0)).to.have.deep.property('props.metrics').and.to.eql([BurnsWithEntries]);
  });

  it('dispatches charts/CYCLE_MODE when called by the Legend', () => {
    const legend = mounted.find(Legend);
    const dispatchCalls = dispatch.mock.calls.length;
    legend.get(0).props.cycleMode(2);
    expect(dispatch.mock.calls).to.have.length(dispatchCalls + 1);
    expect(dispatch.mock.calls).to.have.deep.property(`[${dispatchCalls}][0].type`, 'charts/CYCLE_MODE');
    expect(dispatch.mock.calls).to.have.deep.property(`[${dispatchCalls}][0].metricId`, 2);
  });

  it('dispatches charts/SCROLL_BY when dragged');

  it('dispatches charts/REQUEST_ZOOM when clicking the + and - buttons', () => {
    const zoomInButton = mounted.find('.chart-zoom-in-button');
    const zoomOutButton = mounted.find('.chart-zoom-out-button');
    const dispatchCalls = dispatch.mock.calls.length;
    zoomInButton.props().onClick();
    zoomOutButton.props().onClick();
    expect(dispatch.mock.calls).to.have.length(dispatchCalls + 2);
    expect(dispatch.mock.calls[dispatchCalls]).to.eql([{
      type: 'charts/REQUEST_ZOOM',
      zoomFactor: 1.2,
      chartId: 1,
    }]);
    expect(dispatch.mock.calls[dispatchCalls + 1]).to.eql([{
      type: 'charts/REQUEST_ZOOM',
      zoomFactor: 0.8,
      chartId: 1,
    }]);
  });

  it('dispatches charts/SCROLL_BY when the ScrollBar calls', () => {
    const scrollBar = mounted.find(ScrollBar).get(0);
    const dispatchCalls = dispatch.mock.calls.length;
    scrollBar.props.scrollBy(20);
    expect(dispatch.mock.calls).to.have.length(dispatchCalls + 1);
    expect(dispatch.mock.calls[dispatchCalls][0]).to.eql({
      type: 'charts/SCROLL_BY',
      deltaX: 20,
      chartId: 1,
    });
  });
});

