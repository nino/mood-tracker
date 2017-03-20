/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { map } from 'lodash';
import moment from 'moment';
import {
  requestZoom,
  beginZoom,
  setMsPerPx,
  finishZoom,
  cycleMode,
  scrollBy,
  createCharts,
  setDateRange,
} from './actions';
import type {
  TSetDateRangeAction,
} from './actionTypes';
import {
  logMetric,
  deleteMetric,
} from '../actions';
import type { TChartsState, TMetric } from '../types';
import type {
  TLogMetricAction,
} from '../actionTypes';
import { MoodWithEntries, BurnsWithEntries } from '../../test/SampleMetrics';
import reducer from './reducer';
import { FOUR_WEEKS, LINE_COLORS } from './constants';
import { msPerPxLimits } from './lib';

describe('Charts reducer', () => {
  describe('charts/REQUEST_ZOOM', () => {
    it('returns the state unchanged', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'on', color: LINE_COLORS[1] }],
        msPerPx: 1,
        viewCenter: 3,
        dateRange: [0, 1000],
      }];
      expect(reducer(state, requestZoom(1, 2))).to.equal(state);
    });
  });

  describe('charts/BEGIN_ZOOM', () => {
    it('sets the animation property of the chosen chart', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'loess', color: LINE_COLORS[1] }, { metricId: 3, mode: 'off', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        msPerPx: 3,
        dateRange: [0, 1000],
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        msPerPx: 5,
        dateRange: [0, 1000],
      }];
      const newState: TChartsState = reducer(state, beginZoom(2, 1000, 3));
      expect(newState).to.have.length(2);
      expect(newState[0]).to.equal(state[0]);
      expect(newState[1]).to.have.property('animation').and.to.deep.eql({
        finishTime: 1000,
        target: { msPerPx: 3 },
      });
    });
  });

  describe('charts/SET_MS_PER_PX', () => {
    it('sets the ms/px of the selected chart', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'on', color: LINE_COLORS[1] }, { metricId: 3, mode: 'loess', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        msPerPx: 3,
        dateRange: [0, 1000],
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        msPerPx: 5,
        dateRange: [0, 1000],
      }];
      const newState: TChartsState = reducer(state, setMsPerPx(2, 6));
      expect(newState).to.have.length(2);
      expect(newState[0]).to.deep.equal(state[0]);
      expect(newState[1]).to.have.property('msPerPx', 6);
    });
  });

  describe('charts/FINISH_ZOOM', () => {
    it('deletes the animation property on the chosen chart', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'loess', color: LINE_COLORS[1] }, { metricId: 3, mode: 'off', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        msPerPx: 3,
        dateRange: [0, 1000],
        animation: {
          finishTime: 2000,
          target: { msPerPx: 2 },
        },
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        msPerPx: 5,
        animation: {
          finishTime: 1000,
          target: { msPerPx: 5 },
        },
        dateRange: [0, 1000],
      }];
      const action = finishZoom(2);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[0]).to.deep.equal(state[0]);
      expect(newState[1]).not.to.have.property('animation');
    });

    it('does nothing if the chosen chart has no animation', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'on', color: LINE_COLORS[1] }, { metricId: 3, mode: 'off', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        msPerPx: 3,
        animation: {
          finishTime: 2000,
          target: { msPerPx: 2 },
        },
        dateRange: [12, 100],
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 5, mode: 'loess', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        msPerPx: 5,
        dateRange: [
          +moment('2012-01-02T04:56'),
          +moment('2012-08-02T04:56'),
        ],
      }];
      const action = finishZoom(2);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.deep.equal(state);
    });
  });

  describe('charts/CYCLE_MODE', () => {
    it('turns a line from off to on', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'on', color: LINE_COLORS[1] }, { metricId: 3, mode: 'off', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        msPerPx: 3,
        animation: {
          finishTime: 2000,
          target: { msPerPx: 2 },
        },
        dateRange: [100, 1000],
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'off', color: LINE_COLORS[2] }, { metricId: 5, mode: 'loess', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        msPerPx: 5,
        dateRange: [2000, 3000],
      }];
      const action = cycleMode(2);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[0]).to.deep.equal(state[0]);
      expect(newState[1]).to.have.deep.property('lines[0].mode', 'on');
    });

    it('turns a line from on to loess', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'off', color: LINE_COLORS[1] }, { metricId: 3, mode: 'on', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        msPerPx: 3,
        animation: {
          finishTime: 2000,
          target: { msPerPx: 2 },
        },
        dateRange: [2000, 3000],
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'loess', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        msPerPx: 5,
        dateRange: [2000, 3000],
      }];
      const action = cycleMode(3);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[0]).to.have.deep.property('lines[1].mode', 'loess');
      expect(newState[1]).to.deep.equal(state[1]);
    });

    it('turns a line from loess to off', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'off', color: LINE_COLORS[1] }, { metricId: 3, mode: 'loess', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        msPerPx: 3,
        animation: {
          finishTime: 2000,
          target: { msPerPx: 2 },
        },
        dateRange: [2000, 3000],
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'loess', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        msPerPx: 5,
        dateRange: [2000, 3000],
      }];
      const action = cycleMode(3);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[0]).to.have.deep.property('lines[1].mode', 'off');
      expect(newState[1]).to.deep.equal(state[1]);
    });
  });

  describe('charts/SCROLL_BY', () => {
    it('increases the viewCenter property of the selected metric by an amount', () => {
      const state: TChartsState = [
        {
          id: 1,
          lines: [{ metricId: 1, mode: 'off', color: LINE_COLORS[1] }, { metricId: 3, mode: 'on', color: LINE_COLORS[3 % LINE_COLORS.length] }],
          viewCenter: 5,
          msPerPx: 42,
          dateRange: [0, 1000],
        }, {
          id: 2,
          lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2 % LINE_COLORS.length] }, { metricId: 5, mode: 'loess', color: LINE_COLORS[5 % LINE_COLORS.length] }],
          viewCenter: 2,
          msPerPx: 1,
          dateRange: [0, 1000],
        },
      ];
      const action = scrollBy(1, 10);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[0]).to.have.property('viewCenter', 425);
      expect(newState[1], 'must scroll by 42 * 10 pixels').to.deep.equal(state[1]);
    });

    it('decreases the viewCenter property of the selected metric by an amount', () => {
      const state: TChartsState = [
        {
          id: 1,
          lines: [{ metricId: 1, mode: 'off', color: LINE_COLORS[1] }, { metricId: 3, mode: 'on', color: LINE_COLORS[3 % LINE_COLORS.length] }],
          viewCenter: 5,
          msPerPx: 13,
          dateRange: [-200, 1000],
        }, {
          id: 2,
          lines: [{ metricId: 2, mode: 'off', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
          viewCenter: 2,
          msPerPx: 1,
          dateRange: [0, 1000],
        },
      ];
      const action = scrollBy(1, -10);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[0], 'must scroll 13 * (-10)').to.have.property('viewCenter', -125);
      expect(newState[1]).to.deep.equal(state[1]);
    });

    it('increases the viewCenter property by a smaller amount if zoomed in', () => {
      const state: TChartsState = [
        {
          id: 1,
          lines: [{ metricId: 1, mode: 'off', color: LINE_COLORS[1] }, { metricId: 3, mode: 'on', color: LINE_COLORS[3 % LINE_COLORS.length] }],
          viewCenter: 5,
          msPerPx: 2,
          dateRange: [0, 100],
        }, {
          id: 2,
          lines: [{ metricId: 2, mode: 'loess', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
          viewCenter: 2,
          msPerPx: 1,
          dateRange: [0, 100],
        },
      ];
      const action = scrollBy(1, 10);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[1]).to.deep.equal(state[1]);
      expect(newState[0]).to.have.property('viewCenter', 25);
    });

    it('constrains viewCenter to lie within the chart\'s date range', () => {
      const state: TChartsState = [
        {
          id: 1,
          lines: [{
            metricId: 1,
            mode: 'on',
            color: 'green',
          }],
          viewCenter: 5,
          msPerPx: 1,
          dateRange: [0, 10],
        },
      ];
      const action = scrollBy(1, 10);
      const newState = reducer(state, action);
      expect(newState).to.have.deep.property('[0].viewCenter', 10);
    });
  });

  describe('charts/CREATE_CHARTS', () => {
    it('creates a chart for all groups of metrics with indentical range and color groups', () => {
      const state: TChartsState = [];
      const metrics: TMetric[] = [
        {
          id: 1,
          props: {
            ...MoodWithEntries.props,
            name: 'Mood1',
          },
          lastModified: 10,
          entries: MoodWithEntries.entries,
        }, {
          id: 2,
          props: { ...BurnsWithEntries.props, name: 'Burns1' },
          lastModified: 20,
          entries: BurnsWithEntries.entries,
        }, {
          id: 3,
          props: { ...MoodWithEntries.props, name: 'Mood2' },
          lastModified: 10,
          entries: MoodWithEntries.entries,
        }, {
          id: 4,
          props: { ...BurnsWithEntries.props, name: 'Burns2 ' },
          lastModified: 20,
          entries: BurnsWithEntries.entries,
        },
      ];
      const action = createCharts(metrics);
      const newState = reducer(state, action);
      deepFreeze(state);
      deepFreeze(metrics);
      deepFreeze(action);
      expect(newState, JSON.stringify(newState)).to.have.length(2);
      expect(newState[0].lines).to.eql([{ metricId: 1, mode: 'on', color: LINE_COLORS[1] }, { metricId: 3, mode: 'on', color: LINE_COLORS[3 % LINE_COLORS.length] }]);
      expect(newState[1].lines).to.eql([{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 4, mode: 'on', color: LINE_COLORS[4 % LINE_COLORS.length] }]);
    });

    it('sets the msPerPx and viewCenter such that all entries are in the 200 pixels left of the viewCenter', () => {
      const state: TChartsState = [];
      const metrics: TMetric[] = [
        {
          id: 33,
          props: { ...MoodWithEntries.props, name: 'Mood1' },
          lastModified: 10,
          entries: [
            { date: '2016-10-22T01:01:01.000Z', value: 2 },
            { date: '2016-10-22T01:04:03.000Z', value: 5 },
          ],
        }, {
          id: 34,
          props: { ...MoodWithEntries.props, name: 'Mood2' },
          lastModified: 12,
          entries: [
            { date: '2016-10-23T01:01:01.000Z', value: 6 },
            { date: '2016-10-24T01:04:03.000Z', value: 8 },
          ],
        },
      ];
      const action = createCharts(metrics);
      const dateRange = [+moment(metrics[0].entries[0].date), +moment(metrics[1].entries[1].date)];
      const expectedViewCenter = dateRange[1];
      const newState = reducer(state, action);
      expect(newState).to.have.length(1);
      expect(newState).to.have.deep.property('[0].dateRange').and.to.eql(dateRange);
      expect(newState[0].lines).to.eql([{ metricId: 33, mode: 'on', color: LINE_COLORS[33 % LINE_COLORS.length] }, { metricId: 34, mode: 'on', color: LINE_COLORS[34 % LINE_COLORS.length] }]);
      expect(newState[0].msPerPx).to.be.closeTo((dateRange[1] - dateRange[0]) / 200, 1);
      expect(newState[0].viewCenter).to.be.closeTo(expectedViewCenter, 100);
    });

    it('sets the zoomFactor and viewCenter such that the last 4 weeks are in view if more than 4 weeks exist', () => {
      const state: TChartsState = [];
      const metrics: TMetric[] = [
        {
          id: 1,
          props: { ...MoodWithEntries.props, name: 'Mood1' },
          lastModified: 10,
          entries: [
            { date: '2016-10-22T01:01:01.000Z', value: 2 },
            { date: '2016-10-22T01:04:03.001Z', value: 5 },
          ],
        }, {
          id: 2,
          props: { ...MoodWithEntries.props, name: 'Mood2' },
          lastModified: 12,
          entries: [
            { date: '2016-10-23T01:01:01.000Z', value: 6 },
            { date: '2016-12-24T01:04:03.001Z', value: 8 },
          ],
        },
      ];
      const action = createCharts(metrics);
      const dateRange = [+moment(metrics[0].entries[0].date), +moment(metrics[1].entries[1].date)];
      const expectedViewCenter = dateRange[1];
      const newState = reducer(state, action);
      expect(newState).to.have.length(1);
      expect(newState[0].msPerPx).to.equal(FOUR_WEEKS / 400);
      expect(newState[0].viewCenter).to.be.closeTo(expectedViewCenter, 100);
    });
  });

  describe('charts/SET_DATE_RANGE', () => {
    const state: TChartsState = [
      {
        id: 1,
        lines: [
          {
            metricId: 1,
            color: 'red',
            mode: 'on',
          },
        ],
        msPerPx: 1,
        dateRange: [1000, 2000],
        viewCenter: 1002,
      },
    ];
    const action: TSetDateRangeAction = setDateRange(1, [1500, 1800]);
    const newState: TChartsState = reducer(state, action);

    it('sets the dateRange of the chosen chart', () => {
      expect(newState).to.have.length(1);
      expect(newState[0].dateRange).to.eql([1500, 1800]);
    });

    it('limits the viewCenter to be within the dateRange', () => {
      expect(newState[0].viewCenter).to.equal(1500);
    });
  });

  describe('LOG_METRIC', () => {
    it('extends the metric\'s chart\'s dateRange if necessary', () => {
      const state: TChartsState = [
        {
          id: 1,
          lines: [
            {
              metricId: 1,
              color: 'green',
              mode: 'on',
            }, {
              metricId: 2,
              color: 'blue',
              mode: 'loess',
            },
          ],
          msPerPx: 1,
          dateRange: [
            +moment('2012-02-12T01:22'),
            +moment('2012-02-14T01:22'),
          ],
          viewCenter: 1500,
        },
      ];
      const newDate = moment('2012-02-15T01:24');
      const action: TLogMetricAction = logMetric(2, newDate.toJSON(), 2);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(1);
      expect(newState[0].dateRange[0]).to.eql(state[0].dateRange[0]);
      expect(newState[0].dateRange[1]).to.eql(+newDate);
    });

    it('leaves the metric\'s chart\'s dateRange unchanged otherwise', () => {
      const state: TChartsState = [
        {
          id: 1,
          lines: [
            {
              metricId: 1,
              color: 'green',
              mode: 'on',
            }, {
              metricId: 2,
              color: 'blue',
              mode: 'loess',
            },
          ],
          msPerPx: 1,
          dateRange: [
            +moment('2012-02-12T01:22'),
            +moment('2012-02-14T01:22'),
          ],
          viewCenter: 1500,
        },
      ];
      const newDate = moment('2012-02-13T01:24');
      const action: TLogMetricAction = logMetric(2, newDate.toJSON(), 2);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(1);
      expect(newState[0].dateRange).to.eql(state[0].dateRange);
    });
  });

  describe('DELETE_METRIC', () => {
    const state: TChartsState = [
      {
        id: 1,
        lines: [
          { metricId: 1, mode: 'on', color: 'red' },
          { metricId: 4, mode: 'off', color: 'green' },
        ],
        viewCenter: 1000,
        msPerPx: 1,
        dateRange: [1000, 2000],
      }, {
        id: 2,
        lines: [
          { metricId: 2, mode: 'loess', color: 'blue' },
        ],
        viewCenter: 1000,
        msPerPx: 2,
        dateRange: [1000, 2000],
      },
    ];

    it('deletes the line from the metric\'s chart', () => {
      const action = deleteMetric(4, true);
      const newState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[0].lines).to.have.length(1);
      expect(newState[0].lines[0]).to.eql(state[0].lines[0]);
      expect(newState[1]).to.deep.eql(state[1]);
    });

    it('deletes the metric\'s chart if it was the last metric', () => {
      const action = deleteMetric(2, true);
      const newState = reducer(state, action);
      expect(newState).to.have.length(1);
      expect(newState[0]).to.deep.eql(state[0]);
    });

    it('leaves the state unchanged if confirm=false', () => {
      const action = deleteMetric(4);
      expect(reducer(state, action)).to.deep.eql(state);
    });
  });
});

