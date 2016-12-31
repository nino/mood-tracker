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
  addMetric,
  reorderMetrics,
  deleteMetric,
  updateEditedMetric,
  confirmModal,
} from './actions';
import { DEFAULT_METRIC_PROPS } from './constants';

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
      expect(newState.modals[0]).to.have.property('userResponse', null);
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

  describe('add metric', () => {
    it('creates a new metric with default values', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        addMetric(),
      );
      expect(newState).to.have.property('metrics')
        .and.to.have.property('items').and.to.have.length(3);
      const { items } = newState.metrics;
      expect(items[2]).to.have.property('props').and.to.have.property('name', 'Untitled metric');
      const { props } = items[2];
      expect(props).to.have.property('maxValue', 10);
      expect(props).to.have.property('minValue', 1);
      expect(props).to.have.property('colorGroups').and.to.eql([]);
      expect(props).to.have.property('type', 'int');
      expect(items[2]).to.have.property('entries').and.to.have.length(0);
      expect(items[2]).to.have.property('lastModified', null);
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
      expect(newState).to.have.property('metrics').and.to.have.property('items')
        .and.to.have.length(2);
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
        .to.have.property('action').and.to.eql({ type: 'default action' });
      expect(newState.modals[0]).to.have.property('title').and.to.include('changes');
      expect(newState.modals[0]).to.have.property('message').and.to.include('unsaved');
      expect(newState.modals[0]).to.have.property('userResponse', null);
    });

    it('stops editing the other metric and creates a metric if discard=true', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_MODIFIED,
        addMetric(true),
      );
      expect(newState).to.have.property('metrics').and.to.have.property('items')
        .and.to.have.length(3);
      expect(newState).to.have.property('settings').and.to.have.property('editedMetric')
        .and.to.have.property('props').and.to.have.property('name', 'Untitled metric');
      expect(newState.settings).to.have.property('isModified').and.to.be.ok;
    });
  });

  describe('reorder metrics', () => {
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

      expect(newState.metrics.items.map(m => m.id)).to.eql([1, 2, 3, 4]);
    });

    it('does nothing when moving the bottommost metric down', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(4, 'down'),
      );

      expect(newState.metrics.items.map(m => m.id)).to.eql([1, 2, 3, 4]);
    });

    it('moves the chosen metric up', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(2, 'up'),
      );

      expect(newState.metrics.items.map(m => m.id)).to.eql([2, 1, 3, 4]);
    });

    it('moves the chosen metric down', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(2, 'down'),
      );

      expect(newState.metrics.items.map(m => m.id)).to.eql([1, 3, 2, 4]);
    });

    it('does nothing if the direction is neither up nor down', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(2, 'foo'),
      );

      expect(newState.metrics.items.map(m => m.id)).to.eql([1, 2, 3, 4]);
    });

    it('does nothing if the chosen metric does not exist', () => {
      const newState = reducer(
        givenState,
        reorderMetrics(5, 'up'),
      );

      expect(newState.metrics.items.map(m => m.id)).to.eql([1, 2, 3, 4]);
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

  describe('delete metric', () => {
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
      },
    };

    it('stops editing if confirm=true', () => {
      const newState = reducer(
        stateWithEditing,
        deleteMetric(2, true),
      );

      expect(newState).to.have.property('settings').and.to.have.property('editedMetric', null);
      expect(newState).to.have.property('settings').and.to.have.property('isModified', false);
    });

    it('removes the chosen metric if confirm=true', () => {
      const newState = reducer(
        stateWithEditing,
        deleteMetric(2, true),
      );

      expect(newState).to.have.property('modals').and.to.have.length(0);
      expect(newState).to.have.property('metrics').and.to.have.property('items')
        .and.to.have.length(4);
      expect(newState.metrics.items.map(i => i.id)).to.eql([1, 3, 4, 5]);
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

      expect(newState).to.have.property('metrics').and.to.have.property('items')
        .and.to.have.length(5);
      expect(newState).to.have.property('modals').and.to.have.length(1);
      expect(newState).to.have.property('settings').and.to.have.property('editedMetric')
        .and.to.eql({
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
        .and.to.eql({ type: 'default action' });
      expect(newState.modals[0]).to.have.property('userResponse', null);
    });

    it('does nothing if no metrics exist', () => {
      expect(reducer(INITIAL_STATE, deleteMetric(2, true))).to.eql(INITIAL_STATE);
      expect(reducer(INITIAL_STATE, deleteMetric(2))).to.eql(INITIAL_STATE);
    });
  });

  describe('update edited metric', () => {
    it('updates the name of the currently edited metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ name: 'mood55' }),
      );

      expect(newState).to.have.property('settings').and.to.have.property('editedMetric')
        .and.to.have.property('props')
        .and.to.have.property('name', 'mood55');
      expect(newState.settings.editedMetric.props).to.have.property('minValue', 1);
      expect(newState.settings.editedMetric.props).to.have.property('maxValue', 10);
    });

    it('updates the minValue of the currently edited metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ minValue: '2' }),
      );

      expect(newState).to.have.property('settings').and.to.have.property('editedMetric')
        .and.to.have.property('props').and.to.have.property('name', 'Mood');
      expect(newState.settings.editedMetric.props).to.have.property('minValue', 2);
      expect(newState.settings.editedMetric.props).to.have.property('maxValue', 10);
    });

    it('updates the maxValue of the currently edited metric', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ maxValue: '2' }),
      );

      expect(newState).to.have.property('settings').and.to.have.property('editedMetric')
        .and.to.have.property('props').and.to.have.property('name', 'Mood');
      expect(newState.settings.editedMetric.props).to.have.property('minValue', 1);
      expect(newState.settings.editedMetric.props).to.have.property('maxValue', 2);
    });

    it('only allows numbers or an empty string in min and max fields', () => {
      const newState = reducer(
        STATE_EDITING_METRIC1_NOT_MODIFIED,
        updateEditedMetric({ minValue: '23 hello', maxValue: '2 blah' }),
      );

      expect(newState).to.have.property('settings')
        .and.to.have.property('editedMetric')
        .and.to.have.property('props')
        .and.to.have.property('maxValue', 2);
      expect(newState.settings.editedMetric.props).to.have.property('minValue', 23);
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
        ]}),
      );

      expect(newState).to.have.property('settings').and.to.have.property('editedMetric')
        .and.to.have.property('props').and.to.have.property('name', 'Mood');
      expect(newState.settings.editedMetric.props).to.have.property('minValue', 1);
      expect(newState.settings.editedMetric.props).to.have.property('maxValue', 10);
      expect(newState.settings.editedMetric.props).to.have.property('colorGroups')
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

      expect(newState).to.have.property('settings')
        .and.to.have.property('isModified', true);
    });
  });

  describe('confirm modal', () => {
    it('does nothing if no modal exists', () => {
      const newState = reducer(
        STATE_WITH_SOME_METRICS,
        confirmModal(),
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
                  action: { type: 'something' },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'sthg else' },
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
                  action: { type: 'something' },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'sthg else' },
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
                  action: { type: 'something' },
                },
                cancel: {
                  label: 'no',
                  action: { type: 'sthg else' },
                },
              },
              userResponse: null,
            },
          ],
        },
        confirmModal(),
      );

      expect(newState).to.have.property('modals').and.to.have.length(3);
      expect(newState.modals[0]).to.have.property('userResponse', 'cancel');
      expect(newState.modals[1]).to.have.property('userResponse', 'confirm');
      expect(newState.modals[2]).to.have.property('userResponse', null);
    });
  });
});
