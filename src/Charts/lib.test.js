/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import {
  chartIndexFromMetricId,
} from './lib';
import type {
  TChartsState,
} from '../types';

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

