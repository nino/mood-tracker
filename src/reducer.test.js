/* @flow */
/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { reducer } from './reducer';
import {
  INITIAL_STATE,
  STATE_WITH_SOME_METRICS,
  STATE_EDITING_METRIC1_MODIFIED,
  STATE_EDITING_METRIC1_NOT_MODIFIED,
  STATE_WITH_LOTS_OF_METRICS,
} from '../test/SampleApplicationStates';
import {
  MoodWithEntries,
  BurnsWithEntries,
  BurnsWithoutEntries,
} from '../test/SampleMetrics';
import {
  logMetric,
  startEditingMetric,
  successUpdateMetric,
  stopEditing,
  addMetric,
  reorderMetrics,
  deleteMetric,
  updateEditedMetric,
  requestConfirmModal,
  requestCancelModal,
  successConfirmModal,
  successCancelModal,
  beginSyncData,
  successSyncData,
  errorSyncData,
  beginCheckLogin,
  successCheckLogin,
  errorCheckLogin,
} from './actions';
import { DEFAULT_METRIC_PROPS } from './constants';
import type { TApplicationState, TMetric } from './types';

describe('reducer', () => {
  it('returns the state when receiving an unknown action', () => {
    expect(reducer(INITIAL_STATE, { type: 'DEFAULT_ACTION' })).to.deep.equal(INITIAL_STATE);
  });

  describe('LOG_METRIC', () => {
    it('appends an entry to the appropriate metric', () => {
      const dateString = (new Date(12439)).toJSON();
      const newState: TApplicationState = reducer(STATE_WITH_SOME_METRICS, logMetric(1, dateString, 6));
      expect(newState).to.have.property('metrics');
      expect(newState.metrics).to.have.property('items');
      expect(newState.metrics.items).to.be.a('array');
      expect(newState.metrics.items).to.have.length(2);

      if (newState.metrics.items == null) { expect(false).to.be.ok; return; }
      expect(newState.metrics.items[0]).to.have.property('props').and.to.have.property('name', 'Mood');
      if (newState.metrics.items == null) { expect(false).to.be.ok; return; }
      expect(newState.metrics.items[0]).to.have.property('entries').and.to.have.length(11);
      if (newState.metrics.items == null) { expect(false).to.be.ok; return; }
      expect(newState.metrics.items[0].entries[10]).to.have.property('date', dateString);
      if (newState.metrics.items == null) { expect(false).to.be.ok; return; }
      expect(newState.metrics.items[0].entries[10]).to.have.property('value', 6);
      if (newState.metrics.items == null) { expect(false).to.be.ok; return; }
      expect(newState.metrics.items[1]).to.have.property('entries').and.to.eql([]);
    });

    it('does nothing if no metric with this id is found', () => {
      const dateString = (new Date(12439)).toJSON();
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        logMetric(5, dateString, 6),
      );
      expect(newState).to.eql(STATE_WITH_SOME_METRICS);
    });

    it('does nothing if no valid date is provided', () => {
      const dateString = '03289d';
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        logMetric(5, dateString, 6),
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
      expect(newState).to.have.property('metrics').and.to.eql(STATE_WITH_SOME_METRICS.metrics);
      expect(newState).to.have.property('settings');
      expect(newState.settings).to.have.property('editedMetric');
      expect(newState.settings.editedMetric).to.have.property('id', 1);
      expect(newState.settings.editedMetric).to.have.property('props');
      if (newState.settings.editedMetric == null) { expect(false).to.be.ok; return; }
      const items: ?TMetric[] = STATE_WITH_SOME_METRICS.metrics.items;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(newState.settings.editedMetric.props).to.eql(items[0].props);
      expect(newState.settings).to.have.property('isModified', false);
    });

    it('creates a modal if already modified another metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        startEditingMetric(2),
      );
      expect(newState).to.have.property('settings').and.to.eql(STATE_EDITING_METRIC1_MODIFIED.settings);
      expect(newState).to.have.property('modals').and.to.have.length(1);
      expect(newState.modals[0]).to.have.property('title', 'Discard changes?');
      expect(newState.modals[0]).to.have.property('message').and.to.include('unsaved');
      expect(newState.modals[0]).to.have.property('actions');
      expect(newState.modals[0].actions).to.have.property('confirm');
      expect(newState.modals[0].actions.confirm).to.have.property('action');
      expect(newState.modals[0].actions.confirm.action).to.eql(startEditingMetric(2, true));
      expect(newState.modals[0].actions.confirm).to.have.property('label');
      expect(newState.modals[0].actions).to.have.property('cancel');
      expect(newState.modals[0].actions.cancel).to.have.property('action');
      expect(newState.modals[0].actions.cancel.action).to.eql({ type: 'DEFAULT_ACTION' });
      expect(newState.modals[0].actions.cancel).to.have.property('label');
      expect(newState.modals[0]).to.have.property('userResponse', null);
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

  describe('SUCCESS_UPDATE_METRIC', () => {
    let newState: TApplicationState;
    beforeAll(() => {
      newState = reducer(
        STATE_WITH_LOTS_OF_METRICS,
        successUpdateMetric(2, {
          ...BurnsWithoutEntries.props,
          name: 'Burns2',
        },
        12957793,
        ),
      );
    });

    it('updates the props of the appropriate metrics item', () => {
      expect(newState).to.have.property('metrics');
      expect(newState.metrics).to.have.property('items');
      expect(newState.metrics.items).to.have.length(2);
      const items: ?TMetric[] = newState.metrics.items;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(items[1]).to.have.property('props').and.to.eql({
        ...BurnsWithoutEntries.props,
        name: 'Burns2',
      });
      expect(items[0]).to.have.property('props').and.to.eql(MoodWithEntries.props);
      expect(newState).to.have.property('settings').and.not.to.have.property('editedMetric');
    });

    it('preserves the entries of the metric', () => {
      expect(newState).to.have.property('metrics');
      expect(newState.metrics).to.have.property('items');
      expect(newState.metrics.items).to.have.length(2);
      if (newState.metrics.items == null) { expect(false).to.be.ok; return; }
      expect(newState.metrics.items[1]).to.have.property('entries').and.to.have.length(1);
    });

    it('sets `lastModified` to the provided value', () => {
      if (newState.metrics.items == null) { expect(false).to.be.ok; return; }
      expect(newState.metrics.items[1]).to.have.property('lastModified', 12957793);
    });
  });

  describe('STOP_EDITING', () => {
    it('sets editedMetric to null if isModified is false', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        stopEditing(),
      );
      expect(newState).to.have.property('settings');
      expect(newState.settings).not.to.have.property('editedMetric');
      expect(newState.settings).to.have.property('isModified').and.to.not.be.ok;
    });

    it('creates a modal if isModified is true', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        stopEditing(),
      );
      expect(newState).to.have.property('settings');
      expect(newState.settings).to.eql(STATE_EDITING_METRIC1_MODIFIED.settings);
      expect(newState).to.have.property('modals').and.to.have.length(1);
      expect(newState.modals[0]).to.have.property('title').and.to.be.a('string');
      expect(newState.modals[0]).to.have.property('message').and.to.include('discard');
      expect(newState.modals[0]).to.have.property('actions');
      const { actions } = newState.modals[0];
      expect(actions.confirm).to.have.property('action').and.to.eql(stopEditing(true));
      expect(actions.cancel).to.have.property('action').and.to.eql({ type: 'DEFAULT_ACTION' });
      expect(newState.modals[0]).to.have.property('userResponse', null);
    });

    it('discards changes if discard=true', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        stopEditing(true),
      );
      expect(newState).to.have.property('settings')
        .and.to.eql({
          isModified: false,
        });
      expect(newState).to.have.property('modals').and.to.have.length(0);
      expect(newState).to.have.property('metrics')
        .and.to.eql(STATE_EDITING_METRIC1_MODIFIED.metrics);
    });
  });

  describe('ADD_METRIC', () => {
    it('creates a new metric with default values', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        addMetric(),
      );
      expect(newState).to.have.property('metrics');
      expect(newState.metrics).to.have.property('items');
      expect(newState.metrics.items).to.have.length(3);
      const { items } = newState.metrics;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(items[2]).to.have.property('props').and.to.have.property('name', 'Untitled metric');
      const { props } = items[2];
      expect(props).to.have.property('maxValue', 10);
      expect(props).to.have.property('minValue', 1);
      expect(props).to.have.property('colorGroups').and.to.eql([]);
      expect(props).to.have.property('type', 'int');
      expect(items[2]).to.have.property('entries').and.to.have.length(0);
      expect(items[2]).to.not.have.property('lastModified');
    });

    it('starts editing the new metric', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        addMetric(),
      );
      expect(newState).to.have.property('settings')
        .and.to.have.property('editedMetric');
      expect(newState.settings).to.have.property('isModified', true);
    });

    it('creates a modal if already editing another metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        addMetric(),
      );
      expect(newState).to.have.property('metrics');
      expect(newState.metrics).to.have.property('items');
      expect(newState.metrics.items).to.have.length(2);
      expect(newState).to.have.property('modals').and.to.have.length(1);
      expect(newState.modals[0]).to.have.property('actions').and.to.have.property('confirm');
      expect(newState.modals[0].actions.confirm)
        .to.have.property('label').and.to.include('Discard');
      expect(newState.modals[0].actions.confirm)
        .to.have.property('action').and.to.eql(addMetric(true));
      expect(newState.modals[0].actions).to.have.property('cancel');
      expect(newState.modals[0].actions.cancel)
        .to.have.property('label').and.to.include('Continue');
      expect(newState.modals[0].actions.cancel)
        .to.have.property('action').and.to.eql({ type: 'DEFAULT_ACTION' });
      expect(newState.modals[0]).to.have.property('title').and.to.include('changes');
      expect(newState.modals[0]).to.have.property('message').and.to.include('unsaved');
      expect(newState.modals[0]).to.have.property('userResponse', null);
    });

    it('stops editing the other metric and creates a metric if discard=true', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        addMetric(true),
      );
      expect(newState).to.have.property('metrics');
      expect(newState.metrics).to.have.property('items');
      expect(newState.metrics.items).to.have.length(3);
      expect(newState).to.have.property('settings');
      expect(newState.settings).to.have.property('editedMetric');
      expect(newState.settings.editedMetric).to.have.property('props');
      if (newState.settings.editedMetric == null) { expect(false).to.be.ok; return; }
      expect(newState.settings.editedMetric.props).to.have.property('name', 'Untitled metric');
      expect(newState.settings).to.have.property('isModified').and.to.be.ok;
    });
  });

  describe('REORDER_METRICS', () => {
    const givenMetrics = [
      {
        id: 1,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric1',
        },
        lastModified: 798,
        entries: [],
      }, {
        id: 2,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric2',
        },
        lastModified: 234,
        entries: [],
      }, {
        id: 3,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric3',
        },
        lastModified: 9487,
        entries: [],
      }, {
        id: 4,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric4',
        },
        lastModified: 947,
        entries: [],
      },
    ];
    const givenState = {
      ...STATE_WITH_SOME_METRICS,
      metrics: {
        ...STATE_WITH_SOME_METRICS.metrics,
        items: givenMetrics,
      },
    };

    it('does nothing when moving the topmost metric up', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(1, 'up'),
      );
      const { items } = newState.metrics;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(items.map(m => m.id)).to.eql([1, 2, 3, 4]);
    });

    it('does nothing when moving the bottommost metric down', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(4, 'down'),
      );
      const { items } = newState.metrics;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(items.map(m => m.id)).to.eql([1, 2, 3, 4]);
    });

    it('moves the chosen metric up', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(2, 'up'),
      );
      const { items } = newState.metrics;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(items.map(m => m.id)).to.eql([2, 1, 3, 4]);
    });

    it('moves the chosen metric down', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(2, 'down'),
      );
      const { items } = newState.metrics;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(items.map(m => m.id)).to.eql([1, 3, 2, 4]);
    });

    it('does nothing if the chosen metric does not exist', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(5, 'up'),
      );
      const { items } = newState.metrics;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(items.map(m => m.id)).to.eql([1, 2, 3, 4]);
    });

    it('does nothing if no metrics exist at all', () => {
      const newState = reducer(
        {
          ...givenState,
          metrics: {
            ...givenState.metrics,
            items: [],
          },
        },
        reorderMetrics(5, 'up'),
      );

      expect(newState.metrics.items).to.eql([]);
    });
  });

  describe('DELETE_METRIC', () => {
    const givenMetrics = [
      {
        id: 1,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric1',
        },
        entries: [],
        lastModified: 398,
      },
      {
        id: 2,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric2',
        },
        entries: [],
        lastModified: 398,
      },
      {
        id: 3,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric3',
        },
        entries: [],
        lastModified: 398,
      },
      {
        id: 4,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric4',
        },
        entries: [],
        lastModified: 398,
      },
      {
        id: 5,
        props: {
          ...DEFAULT_METRIC_PROPS,
          name: 'metric5',
        },
        entries: [],
        lastModified: 398,
      },
    ];
    const stateWithEditing = {
      ...STATE_WITH_SOME_METRICS,
      metrics: {
        ...STATE_WITH_SOME_METRICS.metrics,
        items: givenMetrics,
      },
      settings: {
        editedMetric: {
          id: 2,
          props: givenMetrics[1].props,
        },
        isModified: false,
      },
    };

    it('stops editing if confirm=true', () => {
      const newState = reducer(
        stateWithEditing,
        deleteMetric(2, true),
      );

      expect(newState).to.have.property('settings').and.not.to.have.property('editedMetric');
      expect(newState).to.have.property('settings').and.to.have.property('isModified', false);
    });

    it('removes the chosen metric if confirm=true', () => {
      const newState = reducer(
        stateWithEditing,
        deleteMetric(2, true),
      );

      expect(newState).to.have.property('modals').and.to.have.length(0);
      expect(newState).to.have.property('metrics');
      expect(newState.metrics).to.have.property('items');
      expect(newState.metrics.items).to.have.length(4);
      const { items } = newState.metrics;
      if (items == null) { expect(false).to.be.ok; return; }
      expect(items.map(i => i.id)).to.eql([1, 3, 4, 5]);
    });

    it('does nothing if metric not found', () => {
      const newState1 = reducer(
        stateWithEditing,
        deleteMetric(23, true),
      );
      const newState2 = reducer(
        stateWithEditing,
        deleteMetric(23),
      );

      expect(newState1, 'should do nothing with confirm=true').to.eql(stateWithEditing);
      expect(newState2, 'should do nothing with confirm=false').to.eql(stateWithEditing);
    });

    it('creates modal if confirm=false', () => {
      const newState = reducer(
        stateWithEditing,
        deleteMetric(2),
      );

      expect(newState).to.have.property('metrics');
      expect(newState.metrics).to.have.property('items');
      expect(newState.metrics.items).to.have.length(5);
      expect(newState).to.have.property('modals').and.to.have.length(1);
      expect(newState).to.have.property('settings');
      expect(newState.settings).to.have.property('editedMetric');
      expect(newState.settings.editedMetric).to.eql({
        id: 2,
        props: givenMetrics[1].props,
      });
      expect(newState.modals[0]).to.have.property('title').and.to.include('Delete');
      expect(newState.modals[0]).to.have.property('message').and.to.include('delete');
      expect(newState.modals[0]).to.have.property('actions');
      const { actions } = newState.modals[0];
      expect(actions).to.have.property('confirm');
      expect(actions.confirm).to.have.property('label').and.to.include('Delete');
      expect(actions.confirm).to.have.property('action')
        .and.to.eql(deleteMetric(2, true));
      expect(actions).to.have.property('cancel');
      expect(actions.cancel).to.have.property('label').and.to.include('not');
      expect(actions.cancel).to.have.property('action')
        .and.to.eql({ type: 'DEFAULT_ACTION' });
      expect(newState.modals[0]).to.have.property('userResponse', null);
    });

    it('does nothing if no metrics exist', () => {
      expect(reducer(INITIAL_STATE, deleteMetric(2, true))).to.eql(INITIAL_STATE);
      expect(reducer(INITIAL_STATE, deleteMetric(2))).to.eql(INITIAL_STATE);
    });
  });

  describe('UPDATE_EDITED_METRIC', () => {
    it('updates the name of the currently edited metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ name: 'mood55' }),
      );

      expect(newState).to.have.property('settings');
      expect(newState.settings).to.have.property('editedMetric');
      expect(newState.settings.editedMetric).to.have.deep.property('props.name', 'mood55');
      expect(newState.settings).to.have.property('isModified', true);
    });

    it('updates the minValue of the currently edited metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ minValue: '2' }),
      );

      expect(newState).to.have.property('settings');
      expect(newState.settings.editedMetric).to.have.deep.property('props.minValue', 2);
    });

    it('updates the maxValue of the currently edited metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ maxValue: 2 }),
      );

      expect(newState).to.have.deep.property('settings.editedMetric.props.name', 'Mood');
      expect(newState).to.have.deep.property('settings.editedMetric.props.minValue', 1);
      expect(newState).to.have.deep.property('settings.editedMetric.props.maxValue', 2);
    });

    it('updates the colorGroups of the currently edited metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ colorGroups: [
          {
            minValue: 1,
            maxValue: 2,
            color: 'green',
          },
          {
            minValue: 3,
            maxValue: 4,
            color: 'red',
          },
        ] }),
      );

      expect(newState).to.have.deep.property('settings.editedMetric.props.name', 'Mood');
      expect(newState).to.have.deep.property('settings.editedMetric.props.minValue', 1);
      expect(newState).to.have.deep.property('settings.editedMetric.props.maxValue', 10);
      expect(newState).to.have.deep.property('settings.editedMetric.props.colorGroups')
        .and.to.eql([
          {
            minValue: 1,
            maxValue: 2,
            color: 'green',
          },
          {
            minValue: 3,
            maxValue: 4,
            color: 'red',
          },
        ]);
    });

    it('does nothing if no metric is being edited', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        updateEditedMetric({ name: 'foobar' }),
      );

      expect(newState).to.eql(STATE_WITH_SOME_METRICS);
    });

    it('sets isModified=true', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ name: 'new mood' }),
      );

      expect(newState).to.have.property('settings').and.to.have.property('isModified', true);
    });
  });

  describe('REQUEST_CONFIRM_MODAL', () => {
    it('does nothing if no modal exists', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        requestConfirmModal(),
      );

      expect(newState).to.eql(STATE_WITH_SOME_METRICS);
    });

    it('sets userResponse in the first unanswered modal', () => {
      const newState = reducer(
        {
          ...STATE_WITH_SOME_METRICS,
          modals: [
            {
              title: 'first modal',
              message: 'foo',
              actions: {
                confirm: {
                  label: 'yes',
                  action: { type: 'DELETE_METRIC', metricId: 5 },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'DEFAULT_ACTION' },
                },
              },
              userResponse: 'cancel',
            },
            {
              title: 'second modal',
              message: 'bar',
              actions: {
                confirm: {
                  label: 'yes',
                  action: { type: 'DELETE_METRIC', metricId: 5 },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'DEFAULT_ACTION' },
                },
              },
              userResponse: null,
            },
            {
              title: 'third modal',
              message: 'foof',
              actions: {
                confirm: {
                  label: 'yes',
                  action: { type: 'DELETE_METRIC', metricId: 5 },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'DEFAULT_ACTION' },
                },
              },
              userResponse: null,
            },
          ],
        },
        requestConfirmModal(),
      );

      expect(newState).to.have.property('modals').and.to.have.length(3);
      expect(newState.modals[0]).to.have.property('userResponse', 'cancel');
      expect(newState.modals[1]).to.have.property('userResponse', 'confirm');
      expect(newState.modals[2]).to.have.property('userResponse', null);
    });
  });

  describe('REQUEST_CANCEL_MODAL', () => {
    it('does nothing if no modal exists', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        requestCancelModal(),
      );

      expect(newState).to.eql(STATE_WITH_SOME_METRICS);
    });

    it('sets userResponse in the first unanswered modal', () => {
      const newState = reducer(
        {
          ...STATE_WITH_SOME_METRICS,
          modals: [
            {
              title: 'first modal',
              message: 'foo',
              actions: {
                confirm: {
                  label: 'yes',
                  action: { type: 'DELETE_METRIC', metricId: 3 },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'DEFAULT_ACTION' },
                },
              },
              userResponse: 'confirm',
            },
            {
              title: 'second modal',
              message: 'bar',
              actions: {
                confirm: {
                  label: 'yes',
                  action: { type: 'DELETE_METRIC', metricId: 3 },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'DEFAULT_ACTION' },
                },
              },
              userResponse: null,
            },
            {
              title: 'third modal',
              message: 'foof',
              actions: {
                confirm: {
                  label: 'yes',
                  action: { type: 'DELETE_METRIC', metricId: 3 },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'DEFAULT_ACTION' },
                },
              },
              userResponse: null,
            },
          ],
        },
        requestCancelModal(),
      );

      expect(newState).to.have.property('modals').and.to.have.length(3);
      expect(newState.modals[0]).to.have.property('userResponse', 'confirm');
      expect(newState.modals[1]).to.have.property('userResponse', 'cancel');
      expect(newState.modals[2]).to.have.property('userResponse', null);
    });
  });

  describe('SUCCESS_CONFIRM_MODAL', () => {
    const givenState = {
      ...INITIAL_STATE,
      modals: [{
        title: 'Test modal',
        message: 'Test message',
        userResponse: 'confirm',
        actions: {
          confirm: {
            label: 'Yes',
            action: { type: 'DELETE_METRIC', metricId: 1 },
          },
          cancel: {
            label: 'No',
            action: { type: 'DEFAULT_ACTION' },
          },
        },
      }],
    };

    it('deletes the first answered modal', () => {
      expect(reducer(givenState, successConfirmModal())).to.have.property('modals').and.to.eql([]);
    });

    it('does nothing if no modals exist', () => {
      const emptyState = { ...INITIAL_STATE, modals: [] };
      expect(reducer(emptyState, successConfirmModal())).to.eql(emptyState);
    });
  });

  describe('SUCCESS_CANCEL_MODAL', () => {
    const givenState = {
      ...INITIAL_STATE,
      modals: [{
        title: 'Test modal',
        message: 'Test message',
        userResponse: 'cancel',
        actions: {
          confirm: {
            label: 'Yes',
            action: { type: 'DELETE_METRIC', metricId: 1 },
          },
          cancel: {
            label: 'No',
            action: { type: 'DEFAULT_ACTION' },
          },
        },
      }],
    };

    it('deletes the first answered modal', () => {
      expect(reducer(givenState, successCancelModal())).to.have.property('modals').and.to.eql([]);
    });

    it('does nothing if no modals exist', () => {
      const emptyState = { ...INITIAL_STATE, modals: [] };
      expect(reducer(emptyState, successCancelModal())).to.eql(emptyState);
    });
  });

  describe('BEGIN_SYNC_DATA', () => {
    it('sets state.metrics.isSyncing to true', () => {
      expect(reducer(STATE_WITH_SOME_METRICS, beginSyncData()))
        .to.have.property('metrics').and.to.have.property('isSyncing', true);
    });
  });

  describe('SUCCESS_SYNC_DATA', () => {
    const data = [
      { id: 1, props: DEFAULT_METRIC_PROPS, lastModified: 12, entries: [] },
      { id: 2, props: DEFAULT_METRIC_PROPS, lastModified: 132, entries: [] },
      { id: 3, props: DEFAULT_METRIC_PROPS, lastModified: 102, entries: [] },
    ];
    let newState: TApplicationState;
    beforeAll(() => {
      newState = reducer(
        STATE_WITH_SOME_METRICS,
        successSyncData(data, 1000),
      );
    });

    it('sets metrics.items to data', () => {
      expect(newState).to.have.deep.property('metrics.items').and.to.eql(data);
    });

    it('sets metrics.lastSynced to lastSynced', () => {
      expect(newState.metrics).to.have.property('lastSynced', 1000);
    });

    it('sets metrics.isSyncing to false', () => {
      expect(newState.metrics).to.have.property('isSyncing', false);
    });

    it('sets metrics.isSynced to true', () => {
      expect(newState.metrics).to.have.property('isSynced', true);
    });

    it('does not set metrics.error', () => {
      expect(newState.metrics).to.not.have.property('error');
    });
  });

  describe('ERROR_SYNC_DATA', () => {
    let newState;
    beforeAll(() => {
      newState = reducer(
        STATE_WITH_SOME_METRICS,
        errorSyncData('File not found'),
      );
    });

    it('sets isSyncing to false', () => {
      expect(newState).to.have.property('metrics')
        .and.to.have.property('isSyncing', false);
    });

    it('leaves isSynced as it is', () => {
      expect(newState).to.have.property('metrics')
        .and.to.have.property('isSynced', true);
    });

    it('sets error to the error', () => {
      expect(newState).to.have.deep.property('metrics.error').and.to.eql('File not found');
    });

    it('leaves lastSynced as it is', () => {
      expect(newState).to.not.have.deep.property('metrics.lastSynced');
    });
  });

  describe('BEGIN_CHECK_LOGIN', () => {
    it('sets isAuthenticating to true', () => {
      const newState = reducer(INITIAL_STATE, beginCheckLogin());
      expect(newState).to.have.property('authentication');
      expect(newState.authentication.isAuthenticating).to.be.ok;
    });
  });

  describe('SUCCESS_CHECK_LOGIN', () => {
    let newState;
    beforeEach(() => {
      newState = reducer(
        INITIAL_STATE,
        successCheckLogin('abcdefg', 12345678900),
      );
    });

    it('sets isAuthenticating to false', () => {
      expect(newState).to.have.property('authentication');
      expect(newState.authentication.isAuthenticating).to.not.be.ok;
    });

    it('sets isAuthenticated to true', () => {
      expect(newState.authentication.isAuthenticated).to.be.ok;
    });

    it('sets the accessToken', () => {
      expect(newState.authentication).to.have.property('accessToken')
        .and.to.equal('abcdefg');
    });

    it('sets lastAuthenticated', () => {
      expect(newState.authentication)
        .to.have.property('lastAuthenticated', 12345678900);
    });
  });

  describe('ERROR_CHECK_LOGIN', () => {
    let newState;
    beforeAll(() => {
      newState = reducer(
        STATE_WITH_SOME_METRICS,
        errorCheckLogin('No network connection'),
      );
    });

    it('sets authentication.isAuthenticated to false', () => {
      expect(newState).to.have.property('authentication')
        .and.to.have.property('isAuthenticated', false);
    });

    it('sets authentication.isAuthenticating to false', () => {
      expect(newState).to.have.property('authentication')
        .and.to.have.property('isAuthenticating', false);
    });

    it('sets authentication.error to the error', () => {
      expect(newState).to.have.deep.property('authentication.error', 'No network connection');
    });
  });
});
