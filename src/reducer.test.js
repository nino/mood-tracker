import { reducer } from './reducer';
import { expect } from 'chai';
import { INITIAL_STATE, STATE_WITH_SOME_METRICS } from '../test/SampleApplicationStates';
import {
  logMetric,
} from './actions';

describe('reducer', () => {
  it('returns the state when receiving an unknown action', () => {
    expect(reducer(INITIAL_STATE, { type: 'default action' })).to.deep.equal(INITIAL_STATE);
  });

  describe('log metric', () => {
    it('appends an entry to the appropriate metric', () => {
      const dateString = (new Date(12439)).toJSON();
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        logMetric(1, 6, dateString),
      );
      expect(newState).to.have.property('metrics').and.to.have.property('items').and.to.have.length(2);
      expect(newState.metrics.items[0]).to.have.property('props').and.to.have.property('name', 'Mood');
      expect(newState.metrics.items[0]).to.have.property('entries').and.to.have.length(11);
      expect(newState.metrics.items[0].entries[10]).to.have.property('date', dateString);
      expect(newState.metrics.items[0].entries[10]).to.have.property('value', 6);
      expect(newState.metrics.items[1]).to.have.property('entries').and.to.eql([]);
    });

    it('does nothing if no metric with this id is found', () => {
      const dateString = (new Date(12439)).toJSON();
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        logMetric(5, 6, dateString),
      );
      expect(newState).to.eql(STATE_WITH_SOME_METRICS);
    });

    it('does nothing if no valid date is provided', () => {
      const dateString = '03289d';
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        logMetric(5, 6, dateString),
      );
      expect(newState).to.eql(STATE_WITH_SOME_METRICS);
    });
  });
});
