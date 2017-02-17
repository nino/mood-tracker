/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import {
  requestZoom,
  beginZoom,
  setZoomFactor,
  finishZoom,
  cycleMode,
  scrollBy,
  createCharts,
} from './actions';
import type { TChartsState, TMetric } from '../types';
import { MoodWithEntries, BurnsWithEntries } from '../../test/SampleMetrics';
import reducer from './reducer';
import { MS_PER_PX, FOUR_WEEKS, LINE_COLORS } from './constants';

describe('Charts reducer', () => {
  describe('charts/REQUEST_ZOOM', () => {
    it('returns the state unchanged', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'on', color: LINE_COLORS[1] }],
        zoomFactor: 1,
        viewCenter: 3,
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
        zoomFactor: 3,
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        zoomFactor: 5,
      }];
      const newState: TChartsState = reducer(state, beginZoom(2, 1000, 3));
      expect(newState).to.have.length(2);
      expect(newState[0]).to.equal(state[0]);
      expect(newState[1]).to.have.property('animation').and.to.deep.eql({
        finishTime: 1000,
        target: { zoomFactor: 3 },
      });
    });
  });

  describe('charts/SET_ZOOM_FACTOR', () => {
    it('sets the zoom factor of the selected chart', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'on', color: LINE_COLORS[1] }, { metricId: 3, mode: 'loess', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        zoomFactor: 3,
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        zoomFactor: 5,
      }];
      const newState: TChartsState = reducer(state, setZoomFactor(2, 6));
      expect(newState).to.have.length(2);
      expect(newState[0]).to.deep.equal(state[0]);
      expect(newState[1]).to.have.property('zoomFactor', 6);
    });
  });

  describe('charts/FINISH_ZOOM', () => {
    it('deletes the animation property on the chosen chart', () => {
      const state: TChartsState = [{
        id: 1,
        lines: [{ metricId: 1, mode: 'loess', color: LINE_COLORS[1] }, { metricId: 3, mode: 'off', color: LINE_COLORS[3 % LINE_COLORS.length] }],
        viewCenter: 5,
        zoomFactor: 3,
        animation: {
          finishTime: 2000,
          target: { zoomFactor: 2 },
        },
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        zoomFactor: 5,
        animation: {
          finishTime: 1000,
          target: { zoomFactor: 5 },
        },
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
        zoomFactor: 3,
        animation: {
          finishTime: 2000,
          target: { zoomFactor: 2 },
        },
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2] }, { metricId: 5, mode: 'loess', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        zoomFactor: 5,
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
        zoomFactor: 3,
        animation: {
          finishTime: 2000,
          target: { zoomFactor: 2 },
        },
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'off', color: LINE_COLORS[2] }, { metricId: 5, mode: 'loess', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        zoomFactor: 5,
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
        zoomFactor: 3,
        animation: {
          finishTime: 2000,
          target: { zoomFactor: 2 },
        },
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'loess', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        zoomFactor: 5,
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
        zoomFactor: 3,
        animation: {
          finishTime: 2000,
          target: { zoomFactor: 2 },
        },
      }, {
        id: 2,
        lines: [{ metricId: 2, mode: 'loess', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
        viewCenter: 2,
        zoomFactor: 5,
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
          zoomFactor: 1,
        }, {
          id: 2,
          lines: [{ metricId: 2, mode: 'on', color: LINE_COLORS[2 % LINE_COLORS.length] }, { metricId: 5, mode: 'loess', color: LINE_COLORS[5 % LINE_COLORS.length] }],
          viewCenter: 2,
          zoomFactor: 1,
        },
      ];
      const action = scrollBy(1, 10);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[1]).to.deep.equal(state[1]);
      expect(newState[0]).to.have.property('viewCenter', 5 + (10 * MS_PER_PX));
    });

    it('decreases the viewCenter property of the selected metric by an amount', () => {
      const state: TChartsState = [
        {
          id: 1,
          lines: [{ metricId: 1, mode: 'off', color: LINE_COLORS[1] }, { metricId: 3, mode: 'on', color: LINE_COLORS[3 % LINE_COLORS.length] }],
          viewCenter: 5,
          zoomFactor: 1,
        }, {
          id: 2,
          lines: [{ metricId: 2, mode: 'off', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
          viewCenter: 2,
          zoomFactor: 1,
        },
      ];
      const action = scrollBy(1, -10);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[1]).to.deep.equal(state[1]);
      expect(newState[0]).to.have.property('viewCenter', 5 - (10 * MS_PER_PX));
    });

    it('increases the viewCenter property by a smaller amount if zoomed in', () => {
      const state: TChartsState = [
        {
          id: 1,
          lines: [{ metricId: 1, mode: 'off', color: LINE_COLORS[1] }, { metricId: 3, mode: 'on', color: LINE_COLORS[3 % LINE_COLORS.length] }],
          viewCenter: 5,
          zoomFactor: 2,
        }, {
          id: 2,
          lines: [{ metricId: 2, mode: 'loess', color: LINE_COLORS[2] }, { metricId: 5, mode: 'off', color: LINE_COLORS[5 % LINE_COLORS.length] }],
          viewCenter: 2,
          zoomFactor: 1,
        },
      ];
      const action = scrollBy(1, 10);
      deepFreeze(state);
      deepFreeze(action);
      const newState: TChartsState = reducer(state, action);
      expect(newState).to.have.length(2);
      expect(newState[1]).to.deep.equal(state[1]);
      expect(newState[0]).to.have.property('viewCenter', 5 + (5 * MS_PER_PX));
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

    it('sets the zoomFactor and viewCenter such that all entries are in view if less than 4 weeks exist', () => {
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
      const dateRange = [(new Date(metrics[0].entries[0].date)).getTime(), (new Date(metrics[1].entries[1].date)).getTime()];
      const expectedViewCenter = (dateRange[0] + dateRange[1]) / 2;
      const newState = reducer(state, action);
      expect(newState).to.have.length(1);
      expect(newState[0].lines).to.eql([{ metricId: 33, mode: 'on', color: LINE_COLORS[33 % LINE_COLORS.length] }, { metricId: 34, mode: 'on', color: LINE_COLORS[34 % LINE_COLORS.length] }]);
      expect(newState[0].zoomFactor, (dateRange[1] - dateRange[0])).to.be.closeTo(MS_PER_PX / (dateRange[1] - dateRange[0]), 0.1);
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
      const dateRange = [(new Date(metrics[0].entries[0].date)).getTime(), (new Date(metrics[1].entries[1].date)).getTime()];
      const expectedViewCenter = dateRange[1] - (FOUR_WEEKS / 2);
      const newState = reducer(state, action);
      expect(newState).to.have.length(1);
      expect(newState[0].zoomFactor).to.equal(1);
      expect(newState[0].viewCenter).to.be.closeTo(expectedViewCenter, 100);
    });
  });
});
