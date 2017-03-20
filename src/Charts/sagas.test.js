/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import moment from 'moment';
import {
  animateZoom,
  updateCharts,
} from './sagas';
import { requestZoom } from './actions';
import { deleteMetric } from '../actions';
import type { TDeleteMetricAction } from '../actionTypes';
import { getChart } from './selectors';
import type { TChartsState } from '../types';
import { LINE_COLORS } from './constants';
import {
  MoodWithEntries,
  BurnsWithEntries,
} from '../../test/SampleMetrics';

describe('Charts sagas', () => {
  describe('animateZoom', () => {
    describe('if no animation is running', () => {
      const requestZoomAction = requestZoom(1, 1.25);
      const chartsState: TChartsState = [
        {
          id: 1,
          lines: [{ metricId: 1, mode: 'on', color: LINE_COLORS[1] }],
          viewCenter: 35,
          msPerPx: 2.5,
          dateRange: [0, 1000],
        }, {
          id: 2,
          lines: [{ metricId: 2, mode: 'off', color: LINE_COLORS[2] }],
          viewCenter: 2,
          msPerPx: 1,
          dateRange: [0, 1000],
        },
      ];
      const targetMsPerPx = 2;
      let generator;
      let next;

      beforeAll(() => {
        generator = animateZoom(requestZoomAction);
        next = generator.next();
      });

      it('gets charts from store', () => {
        expect(next).to.have.deep.property('value.SELECT.selector').and.to.eql(getChart);
        expect(next).to.have.deep.property('value.SELECT.args').and.to.eql([1]);
        next = generator.next(chartsState[0]);
      });

      it('dispatches charts/BEGIN_ZOOM', () => {
        expect(next).to.have.deep.property('value.PUT.action.type', 'charts/BEGIN_ZOOM');
        expect(next).to.have.deep.property('value.PUT.action.targetMsPerPx', targetMsPerPx);
        expect(next).to.have.deep.property('value.PUT.action.finishTime').and.to.be.a('number')
          .that.is.within(+moment(), +moment() + 300);
        next = generator.next();
      });

      it('dispatches a bunch of charts/SET_MS_PER_PX actions, followed by charts/FINISH_ZOOM', () => {
        let currentMsPerPx = chartsState[0].msPerPx;
        let iterations = 0;
        while (targetMsPerPx !== currentMsPerPx && iterations < 10000) {
          if (next.value != null && next.value.PUT != null) {
            currentMsPerPx = next.value.PUT.action.msPerPx;
            expect(next).to.have.deep.property('value.PUT.action.type', 'charts/SET_MS_PER_PX');
            expect(next).to.have.deep.property('value.PUT.action.msPerPx').and.to.not.be.below(2);
            next = generator.next();

            expect(next, JSON.stringify(next)).to.have.deep.property('value').and.to.be.ok;
            next = generator.next();
          } else {
            break;
          }
          iterations += 1;
        }
        expect(iterations).to.be.below(9999);
        expect(currentMsPerPx, 'final currentMsPerPx must be equal to targetMsPerPx').to.equal(targetMsPerPx);

        expect(next).to.have.deep.property('value.PUT.action.type', 'charts/FINISH_ZOOM');
        expect(next).to.have.deep.property('value.PUT.action.chartId', 1);
        next = generator.next();

        expect(next).to.have.property('done', true);
      });
    });

    describe('if an animation is already running', () => {
      const requestZoomAction = requestZoom(1, 2);
      const chartsState: TChartsState = [
        {
          id: 1,
          lines: [{ metricId: 1, mode: 'on', color: 'red' }],
          viewCenter: 35,
          msPerPx: 2,
          animation: {
            finishTime: (new Date()).getTime() + 100,
            target: { msPerPx: 2.5 },
          },
          dateRange: [0, 1000],
        }, {
          id: 2,
          lines: [{ metricId: 2, mode: 'on', color: 'green' }],
          viewCenter: 2,
          msPerPx: 1,
          dateRange: [0, 1000],
        },
      ];
      const targetMsPerPx = 1.25;
      let generator;
      let next;

      beforeAll(() => {
        generator = animateZoom(requestZoomAction);
        next = generator.next();
      });

      it('gets charts from store', () => {
        expect(next).to.have.deep.property('value.SELECT.selector').and.to.eql(getChart);
        expect(next).to.have.deep.property('value.SELECT.args').and.to.eql([1]);
        next = generator.next(chartsState[0]);
      });

      it('dispatches charts/BEGIN_ZOOM with combined targetMsPerPx', () => {
        expect(next).to.have.deep.property('value.PUT.action.type', 'charts/BEGIN_ZOOM');
        expect(next).to.have.deep.property('value.PUT.action.targetMsPerPx', 1.25);
        expect(next).to.have.deep.property('value.PUT.action.finishTime').and.to.be.a('number')
          .that.is.within((new Date()).getTime(), (new Date()).getTime() + 300);
        next = generator.next();
      });

      it('dispatches a bunch of charts/SET_MS_PER_PX actions, followed by charts/FINISH_ZOOM', () => {
        let currentMsPerPx = 2;
        let iterations = 0;
        while (targetMsPerPx !== currentMsPerPx && iterations < 10000) {
          if (next.value != null && next.value.PUT != null) {
            currentMsPerPx = next.value.PUT.action.msPerPx;
            expect(next).to.have.deep.property('value.PUT.action.type', 'charts/SET_MS_PER_PX');
            expect(next).to.have.deep.property('value.PUT.action.msPerPx').and.to.not.be.above(2);
            next = generator.next();

            expect(next).to.have.deep.property('value').and.to.be.ok;
            next = generator.next();
          } else {
            break;
          }
          iterations += 1;
        }
        expect(iterations).to.be.below(9999);
        expect(currentMsPerPx).to.equal(targetMsPerPx);

        expect(next).to.have.deep.property('value.PUT.action.type', 'charts/FINISH_ZOOM');
        expect(next).to.have.deep.property('value.PUT.action.chartId', 1);
        next = generator.next();

        expect(next).to.have.property('done', true);
      });
    });
  });

  describe('updateCharts()', () => {
    describe('triggered by DELETE_METRIC', () => {
      const action: TDeleteMetricAction = deleteMetric(1, true);
      const generator = updateCharts(action);
      let next = generator.next();

      it('SELECTs the metrics from the store', () => {
        expect(next).to.have.deep.property('value.SELECT.selector');
        next = generator.next([MoodWithEntries, BurnsWithEntries]);
      });

      it('PUTs charts/CREATE_CHARTS', () => {
        expect(next).to.have.deep.property('value.PUT.action.type', 'charts/CREATE_CHARTS');
        expect(next).to.have.deep.property('value.PUT.action.metrics').and.to.eql([MoodWithEntries, BurnsWithEntries]);
        next = generator.next();
      });

      it('is done', () => {
        expect(next).to.have.property('done', true);
      });
    });

    it('does nothing if triggered by DELETE_METRIC with confirm=false', () => {
      const action: TDeleteMetricAction = deleteMetric(1);
      const generator = updateCharts(action);
      expect(generator.next()).to.have.property('done', true);
    });
  });
});

