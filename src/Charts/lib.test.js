/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { map } from 'lodash';
import moment from 'moment';
import {
  chartIndexFromMetricId,
  computeDateRange,
  msPerPxLimits,
  setValidViewOptions,
} from './lib';
import type {
  TChart,
  TChartLine,
  TChartsState,
  TMetric,
} from '../types';
import type { TRange } from './types';
import { MoodWithEntries } from '../../test/SampleMetrics';

const RANDOM_CHART_ATTRS: TChart = {
  id: 1,
  msPerPx: 20,
  dateRange: [10, 30],
  lines: [{ metricId: 1, mode: 'on', color: 'green' }],
  viewCenter: 25,
};

describe('chartIndexFromMetricId()', () => {
  const charts: TChartsState = [
    {
      id: 1,
      lines: [
        { metricId: 4, mode: 'on', color: 'green' },
        { metricId: 2, mode: 'loess', color: 'blue' },
      ],
      viewCenter: 1000,
      dateRange: [500, 1500],
      msPerPx: 1,
    }, {
      id: 2,
      lines: [
        { metricId: 5, mode: 'off', color: 'black' },
        { metricId: 9, mode: 'on', color: 'teal' },
      ],
      dateRange: [1000, 2000],
      viewCenter: 1001,
      msPerPx: 1,
    },
  ];

  it('returns null if the metricId is not found', () => {
    expect(chartIndexFromMetricId(charts, 8)).to.be.null;
    expect(chartIndexFromMetricId(charts, 1)).to.be.null;
  });

  it('returns the chart\'s index if the metricId is found', () => {
    expect(chartIndexFromMetricId(charts, 2)).to.equal(0);
    expect(chartIndexFromMetricId(charts, 4)).to.equal(0);
    expect(chartIndexFromMetricId(charts, 5)).to.equal(1);
    expect(chartIndexFromMetricId(charts, 9)).to.equal(1);
  });
});

describe('msPerPxLimits()', () => {
  const chart: TChart = {
    id: 1,
    lines: [{ metricId: 1, mode: 'on', color: 'green' }],
    dateRange: [0, 1e8],
    msPerPx: 34,
    viewCenter: 2e3,
  };

  it('sets the lower limit to 1000', () => {
    expect(msPerPxLimits(chart)[0]).to.equal(1000);
  });

  it('sets the upper limit to one percent of the dateRange', () => {
    expect(msPerPxLimits(chart)[1]).to.equal(1e6);
  });
});

describe('computeDateRange()', () => {
  const chart: TChart = {
    id: 1,
    lines: [
      { metricId: 1, mode: 'on', color: 'meh' },
      { metricId: 2, mode: 'off', color: 'invisible' },
      { metricId: 4, mode: 'loess', color: 'fourty-five' },
    ],
    viewCenter: 3e8,
    msPerPx: 30,
    dateRange: [12, 18],
  };

  const metrics: TMetric[] = [
    {
      ...MoodWithEntries,
      id: 1,
      entries: [
        { date: moment(5e8).toJSON(), value: 8 },
        { date: moment(6e8).toJSON(), value: 8 },
      ],
    }, {
      ...MoodWithEntries,
      id: 2,
      entries: [
        { date: moment(3e8).toJSON(), value: 8 },
        { date: moment(10e8).toJSON(), value: 8 },
      ],
    }, {
      ...MoodWithEntries,
      id: 3,
      entries: [
        { date: moment(2e8).toJSON(), value: 8 },
        { date: moment(10e8).toJSON(), value: 8 },
      ],
    }, {
      ...MoodWithEntries,
      id: 4,
      entries: [
        { date: moment(10e8).toJSON(), value: 8 },
        { date: moment(16e8).toJSON(), value: 8 },
      ],
    },
  ];

  it('returns the correct dateRange', () => {
    const dateRange: TRange = computeDateRange(chart, metrics);
    expect(dateRange).to.eql([3e8, 16e8]);
  });
});

describe('setValidViewOptions()', () => {
  const chart: TChart = {
    id: 1,
    lines: [
      { metricId: 1, color: 'blue', mode: 'on' },
      { metricId: 2, color: 'teal', mode: 'on' },
    ],
    msPerPx: 23,
    dateRange: [10, 20],
    viewCenter: 3,
  };
  const metrics: TMetric[] = [
    {
      ...MoodWithEntries,
      id: 1,
      props: {
        ...MoodWithEntries.props,
        name: 'Mood 1',
      },
      entries: [
        { date: moment(80e4).toJSON(), value: 3 },
        { date: moment(178e4).toJSON(), value: 8 },
      ],
    }, {
      ...MoodWithEntries,
      id: 2,
      props: {
        ...MoodWithEntries.props,
        name: 'Mood 2',
      },
      entries: [
        { date: moment(100e4).toJSON(), value: 10 },
        { date: moment(200e4).toJSON(), value: 4 },
      ],
    },
  ];
  const result: TChart = setValidViewOptions(chart, metrics);

  it('sets the dateRange to the correct value', () => {
    expect(result.dateRange).to.eql([80e4, 200e4]);
  });

  it('constrains the viewCenter to be within the dateRange', () => {
    expect(result.viewCenter).to.be.within(80e4, 200e4);
  });

  it('constrains the msPerPx to valid limits', () => {
    const limits: TRange = msPerPxLimits(result);
    expect(result.msPerPx).to.be.within(limits[0], limits[1]);
  });
});

