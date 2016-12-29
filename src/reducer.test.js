import { reducer } from './reducer';
import { expect } from 'chai';
import {
  INITIAL_STATE,
  STATE_WITH_SOME_METRICS,
  STATE_EDITING_METRIC1_MODIFIED,
  STATE_EDITING_METRIC1_NOT_MODIFIED,
  STATE_WITH_LOTS_OF_METRICS,
} from '../test/SampleApplicationStates';
import {
  MoodWithEntries,
  MoodWithoutEntries,
  BurnsWithEntries,
  BurnsWithoutEntries,
} from '../test/SampleMetrics';
import {
  logMetric,
  startEditingMetric,
  updateMetric,
  stopEditing,
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

  describe('start editing metric', () => {
    it('sets `editedMetric` in state.settings to the correct metric', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        startEditingMetric(1),
      );
      expect(newState).to.have.property('metrics')
      .and.to.eql(STATE_WITH_SOME_METRICS.metrics);
      expect(newState).to.have.property('settings')
      .and.to.have.property('editedMetric').and.to.have.property('id', 1);
      expect(newState.settings.editedMetric)
      .to.eql({
        id: STATE_WITH_SOME_METRICS.metrics.items[0].id,
        props: STATE_WITH_SOME_METRICS.metrics.items[0].props,
      });
      expect(newState.settings).to.have.property('isModified', false);
    });

    it('creates a modal if already modified another metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        startEditingMetric(2),
      );
      expect(newState).to.have.property('settings')
      .and.to.eql(STATE_EDITING_METRIC1_MODIFIED.settings);
      expect(newState).to.have.property('modals').and.to.have.length(1);
      expect(newState.modals[0]).to.have.property('title', 'Discard changes?');
      expect(newState.modals[0]).to.have.property('message')
      .and.to.include('unsaved');
      expect(newState.modals[0]).to.have.property('actions');
      expect(newState.modals[0].actions).to.have.property('confirm');
      expect(newState.modals[0].actions.confirm).to.have.property('action');
      expect(newState.modals[0].actions.confirm.action)
      .to.eql(startEditingMetric(2, true));
      expect(newState.modals[0].actions.confirm).to.have.property('label');
      expect(newState.modals[0].actions).to.have.property('cancel');
      expect(newState.modals[0].actions.cancel).to.have.property('action');
      expect(newState.modals[0].actions.cancel.action)
      .to.eql({type: 'default action'});
      expect(newState.modals[0].actions.cancel).to.have.property('label');
    });

    it('sets editedMetric if editing but not modified another metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        startEditingMetric(2),
      );
      expect(newState).to.have.property('settings').and.to.eql({
        editedMetric: {
          id: 2,
          props: BurnsWithEntries.props,
        },
        isModified: false,
      });
      expect(newState).to.have.property('modals').and.to.have.length(0);
    });

    it('discards changes and starts editing if discard = true', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        startEditingMetric(2, true),
      );
      expect(newState).to.have.property('settings').and.to.eql({
        editedMetric: {
          id: 2,
          props: BurnsWithoutEntries.props,
        },
        isModified: false,
      });
      expect(newState).to.have.property('modals').and.to.have.length(0);
    });

    it('does nothing if no metric with given ID is found', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        startEditingMetric(325),
      );
      expect(newState).to.deep.equal(STATE_WITH_SOME_METRICS);
    });
  });

  describe('update metric', () => {
    let newState;
    beforeAll(() => {
      newState = reducer(
        STATE_WITH_LOTS_OF_METRICS,
        updateMetric(2, {
          ...BurnsWithoutEntries.props,
          name: 'Burns2',
        },
          12957793,
        ),
      );
    });

    it('updates the props of the appropriate metrics item', () => {
      expect(newState).to.have.property('metrics')
        .and.to.have.property('items').and.to.have.length(2);
      expect(newState.metrics.items[1]).to.have.property('props')
        .and.to.eql({
          ...BurnsWithoutEntries.props,
          name: 'Burns2',
        });
      expect(newState.metrics.items[0]).to.have.property('props')
        .and.to.eql(MoodWithEntries.props);
      expect(newState).to.have.property('settings')
        .and.to.have.property('editedMetric').and.to.not.be.ok;
    });

    it('preserves the entries of the metric', () => {
      expect(newState).to.have.property('metrics')
        .and.to.have.property('items').and.to.have.length(2);
      expect(newState.metrics.items[1])
        .to.have.property('entries').and.to.have.length(1);
    });

    it('sets `lastModified` to the provided value', () => {
      expect(newState.metrics.items[1])
        .to.have.property('lastModified', 12957793);
    });
  });

  describe('stop editing', () => {
    it('sets editedMetric to null if isModified is false', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        stopEditing(),
      );
      expect(newState).to.have.property('settings')
        .and.to.have.property('editedMetric').and.to.not.be.ok;
      expect(newState.settings).to.have.property('isModified').and.to.not.be.ok;
    });

    it('creates a modal if isModified is true', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        stopEditing(),
      );
      expect(newState).to.have.property('settings')
        .and.to.eql(STATE_EDITING_METRIC1_MODIFIED.settings);
      expect(newState).to.have.property('modals').and.to.have.length(1);
      expect(newState.modals[0]).to.have.property('title').and.to.be.a('string');
      expect(newState.modals[0]).to.have.property('message').and.to.include('discard');
      expect(newState.modals[0]).to.have.property('actions');
      const { actions } = newState.modals[0];
      expect(actions.confirm).to.have.property('action').and.to.eql(stopEditing(true));
      expect(actions.cancel).to.have.property('action').and.to.eql({ type: 'default action' });
    });

    it('discards changes if discard=true', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        stopEditing(true),
      );
      expect(newState).to.have.property('settings')
        .and.to.eql({
          editedMetric: null,
          isModified: false,
        });
      expect(newState).to.have.property('modals').and.to.have.length(0);
      expect(newState).to.have.property('metrics')
        .and.to.eql(STATE_EDITING_METRIC1_MODIFIED.metrics);
    });
  });
});
