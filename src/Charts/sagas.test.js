/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { animateZoom } from './sagas';
import { requestZoom } from './actions';
import { getChart } from './selectors';
import type { TChartsState } from '../types';

describe('Charts sagas', () => {
  describe('animateZoom', () => {
    describe('if no animation is running', () => {
      const requestZoomAction = requestZoom(1, 1.25);
      const chartsState: TChartsState = [
        {
          id: 1,
          metrics: [{ id: 1, visible: true }],
          viewCenter: 35,
          zoomFactor: 2,
        }, {
          id: 2,
          metrics: [{ id: 2, visible: true }],
          viewCenter: 2,
          zoomFactor: 1,
        },
      ];
      const targetZoomFactor = 2.5;
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
        expect(next).to.have.deep.property('value.PUT.action.targetZoomFactor', 2.5);
        expect(next).to.have.deep.property('value.PUT.action.finishTime').and.to.be.a('number')
          .that.is.within((new Date()).getTime(), (new Date()).getTime() + 300);
        next = generator.next();
      });

      it('dispatches a bunch of charts/SET_ZOOM_FACTOR actions, followed by charts/FINISH_ZOOM', () => {
        let currentZoomLevel = 2;
        let iterations = 0;
        while (targetZoomFactor !== currentZoomLevel && iterations < 10000) {
          if (next.value != null && next.value.PUT != null) {
            currentZoomLevel = next.value.PUT.action.zoomFactor;
            expect(next).to.have.deep.property('value.PUT.action.type', 'charts/SET_ZOOM_FACTOR');
            expect(next).to.have.deep.property('value.PUT.action.zoomFactor').and.to.be.above(2);
            next = generator.next();

            expect(next, JSON.stringify(next)).to.have.deep.property('value').and.to.be.ok;
            next = generator.next();
          } else {
            break;
          }
          iterations += 1;
        }
        expect(iterations).to.be.below(9999);
        expect(currentZoomLevel).to.equal(targetZoomFactor);

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
          metrics: [{ id: 1, visible: true }],
          viewCenter: 35,
          zoomFactor: 2,
          animation: {
            finishTime: (new Date()).getTime() + 100,
            target: { zoomFactor: 2.5 },
          },
        }, {
          id: 2,
          metrics: [{ id: 2, visible: true }],
          viewCenter: 2,
          zoomFactor: 1,
        },
      ];
      const targetZoomFactor = 5;
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

      it('dispatches charts/BEGIN_ZOOM with combined targetZoomFactor', () => {
        expect(next).to.have.deep.property('value.PUT.action.type', 'charts/BEGIN_ZOOM');
        expect(next).to.have.deep.property('value.PUT.action.targetZoomFactor', 5);
        expect(next).to.have.deep.property('value.PUT.action.finishTime').and.to.be.a('number')
          .that.is.within((new Date()).getTime(), (new Date()).getTime() + 300);
        next = generator.next();
      });

      it('dispatches a bunch of charts/SET_ZOOM_FACTOR actions, followed by charts/FINISH_ZOOM', () => {
        let currentZoomLevel = 2;
        let iterations = 0;
        while (targetZoomFactor !== currentZoomLevel && iterations < 10000) {
          if (next.value != null && next.value.PUT != null) {
            currentZoomLevel = next.value.PUT.action.zoomFactor;
            expect(next).to.have.deep.property('value.PUT.action.type', 'charts/SET_ZOOM_FACTOR');
            expect(next).to.have.deep.property('value.PUT.action.zoomFactor').and.to.be.above(2);
            next = generator.next();

            expect(next).to.have.deep.property('value').and.to.be.ok;
            next = generator.next();
          } else {
            break;
          }
          iterations += 1;
        }
        expect(iterations).to.be.below(9999);
        expect(currentZoomLevel).to.equal(targetZoomFactor);

        expect(next).to.have.deep.property('value.PUT.action.type', 'charts/FINISH_ZOOM');
        expect(next).to.have.deep.property('value.PUT.action.chartId', 1);
        next = generator.next();

        expect(next).to.have.property('done', true);
      });
    });
  });
});
