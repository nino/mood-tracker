import Actions from './actions';
import {expect} from 'chai';
import {cloneDeep} from 'lodash';
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries';

describe('Actions', () => {
  let appMock;
  beforeEach(() => {
    appMock = {
      setStateCalled: false,
      state: {},
    };
    appMock.setState = (newState => {
      appMock.setStateCalled = true;
      Object.assign(appMock.state, newState);
    });
  });

  describe('start editing action', () => {
    beforeEach(() => {
      appMock.state.metrics = cloneDeep(SampleMetricsWithEntries);
    });
    it('stores the metric to be edited in state.editing', () => {
      appMock.state.editing = null;
      Actions.receiveAction.bind(appMock)('start editing', {id: 1});
      expect(appMock.state).to.have.property('editing')
        .and.to.have.property('id', 1);
      expect(appMock.state.editing).to.have.property('name', 'Mood');
      expect(appMock.setStateCalled).to.be.ok;
    });

    it('asks the user whether to discard unsaved changes', () => {
      appMock.state.editing = { id: 2, name: 'currently editing metric' };
      Actions.receiveAction.bind(appMock)('start editing', {id: 1});
      expect(appMock.state).to.have.property('modal')
        .and.to.have.property('message').and.to.include('unsaved');
      expect(appMock.state.modal).to.have.property('nextAction');
      expect(appMock.state.modal.nextAction).to.have.property('name')
        .and.to.equal('start editing');
      expect(appMock.state.modal.nextAction).to.have.property('params');
      expect(appMock.state.modal.nextAction.params)
        .to.have.property('discard', true);
      expect(appMock.state.modal.nextAction.params)
        .to.have.property('id', 1);
      expect(appMock.setStateCalled).to.be.ok;
    });

    it('discards unsaved changes starts editing if "discard" is true', () => {
      appMock.state.editing = { id: 2 };
      Actions.receiveAction.bind(appMock)('start editing', {
        id: 1,
        discard: true,
      });
      expect(appMock.state.modal).to.not.be.ok;
      expect(appMock.state).to.have.property('editing')
        .and.to.have.property('id', 1);
      expect(appMock.state.editing).to.have.property('name', 'Mood');
      expect(appMock.setStateCalled).to.be.ok;
    });
  });

  describe('stop editing action', () => {
    beforeEach(() => {
      appMock.state.metrics = cloneDeep(SampleMetricsWithEntries);
      appMock.state.editing = cloneDeep(SampleMetricsWithEntries[0]);
    });
    it('asks the user whether to discard changed information', () => {
      appMock.state.editing.name = 'Different name';
      Actions.receiveAction.bind(appMock)('stop editing');
      expect(appMock.state).to.have.property('modal')
        .and.to.have.property('message').and.to.include('unsaved');
      expect(appMock.state.modal).to.have.property('nextAction');
      expect(appMock.state.modal.nextAction)
        .to.have.property('name', 'stop editing');
      expect(appMock.state.modal.nextAction)
        .to.have.property('params').and.to.have.property('discard', true);
    });

    it('sets editing to false if no changes have been made', () => {
      Actions.receiveAction.bind(appMock)('stop editing');
      expect(appMock.state.editing).to.not.be.ok;
    });

    it('sets editing to false if "discard" is true', () => {
      appMock.state.editing.name = 'Different name';
      Actions.receiveAction.bind(appMock)('stop editing', {discard: true});
      expect(appMock.state.editing).to.not.be.ok;
    });
  });

  describe('update form field action', () => {
    beforeEach(() => {
      appMock.state.editing = Object.assign({}, SampleMetricsWithEntries[0]);
      delete appMock.state.editing.entries;
    });

    it('updates the name field', () => {
      Actions.receiveAction.bind(appMock)('update form element', {
        formId: 'metric-settings-form-1',
        name: 'name',
        value: 'Different name',
      });
      expect(appMock.state.editing.name).to.equal('Different name');
    });

    it('updates the maxValue field with an integer value', () => {
      Actions.receiveAction.bind(appMock)('update form element', {
        formId: 'metric-settings-form-1',
        name: 'maxValue',
        value: '13',
      });
      expect(appMock.state.editing.maxValue).to.equal(13);
    });

    it('updates the minValue field with an integer value', () => {
      Actions.receiveAction.bind(appMock)('update form element', {
        formId: 'metric-settings-form-1',
        name: 'minValue',
        value: '13',
      });
      expect(appMock.state.editing.minValue).to.equal(13);
    });

    it('updates the type field', () => {
      Actions.receiveAction.bind(appMock)('update form element', {
        formId: 'metric-settings-form-1',
        name: 'type',
        value: '1',
      });
      expect(appMock.state.editing.type).to.equal('int');
    });

    it('updates the colorGroups subcomponent', () => {
      Actions.receiveAction.bind(appMock)('update form element', {
        formId: 'metric-settings-form-1',
        name: 'colorGroups',
        value: [
          { minValue: '2', maxValue: '4', color: 'gred' },
          { minValue: '55', maxValue: '4', color: 'blue' },
        ],
      });
      expect(appMock.state.editing.colorGroups).to.be.ok;
      expect(appMock.state.editing.colorGroups[0].minValue).to.equal(2);
      expect(appMock.state.editing.colorGroups[0].maxValue).to.equal(4);
      expect(appMock.state.editing.colorGroups[0].color).to.equal('gred');
      expect(appMock.state.editing.colorGroups[1].minValue).to.equal(55);
      expect(appMock.state.editing.colorGroups[1].maxValue).to.equal(4);
      expect(appMock.state.editing.colorGroups[1].color).to.equal('blue');
    });
  });

  describe('add metric action', () => {
    beforeEach(() => {
      appMock.state.metrics = [];
      Actions.receiveAction.bind(appMock)('add metric');
    });

    it('creates a new empty metric with name "Untitled metric"', () => {
      expect(appMock.state.metrics.length).to.equal(1);
    })

    it('starts editing the new metric', () => {
      expect(appMock.state.editing.name).to.equal('Untitled metric');
    })
  })

  describe('delete metric action', () => {
    beforeEach(() => {
      appMock.state.metrics = [ { id: 1, name: 'Simple test metric' } ];
    });

    it('asks the user for confirmation', () => {
      Actions.receiveAction.bind(appMock)('delete metric', {id: 1});
      expect(appMock.state).to.have.property('modal')
        .and.to.have.property('message').and.to.include('delete');
      expect(appMock.state.modal).to.have.property('nextAction')
        .and.to.have.property('name').and.to.equal('delete metric');
      expect(appMock.state.modal.nextAction).to.have.property('params')
        .and.to.have.property('id', 1);
      expect(appMock.state.modal.nextAction.params)
        .to.have.property('confirmed').and.to.be.ok;
    });

    it('deletes the metric if "confirmed" is ok', () => {
      Actions.receiveAction.bind(appMock)('delete metric', {
        id: 1,
        confirmed: true,
      });
      expect(appMock.state.metrics).to.have.length(0);
    });

    it('stops editing after deletion', () => {
      Actions.receiveAction.bind(appMock)('delete metric', {
        id: 1,
        confirmed: true,
      });
      expect(appMock.state.editing).to.not.be.ok;
    });
  });

  describe('update metric action', () => {
    beforeEach(() => {
      appMock.state.metrics = cloneDeep(SampleMetricsWithEntries);
      appMock.state.editing = Object.assign({}, SampleMetricsWithEntries[0]);
      appMock.state.editing.name = 'Different name';
      appMock.state.editing.maxValue = 33;
      Actions.receiveAction.bind(appMock)('update metric', {
        id: 1,
        newProps: appMock.state.editing,
      });
    });

    it('replaces the metric in state.metrics with state.editing', () => {
      expect(appMock.state.metrics[0].name).to.equal('Different name');
      expect(appMock.state.metrics[0].id).to.equal(1);
      expect(appMock.state.metrics[0].maxValue).to.equal(33);
    });

    it('retains all entries in the metric', () => {
      expect(appMock.state.metrics[0].entries).to.have.length(10);
    });

    it('stops editing', () => {
      expect(appMock.state.editing).to.not.be.ok;
    });
  });

  describe('reorder metrics action', () => {
    beforeEach(() => {
      appMock.state.metrics = cloneDeep(SampleMetricsWithEntries);
    });

    it('moves a metric down', () => {
      Actions.receiveAction.bind(appMock)('reorder metrics', {
        id: 1,
        direction: 'down',
      });
      expect(appMock.state.metrics).to.have.length(2);
      expect(appMock.state.metrics[0]).to.have.property('id', 2);
      expect(appMock.state.metrics[1]).to.have.property('id', 1);
    });

    it('moves a metric up', () => {
      Actions.receiveAction.bind(appMock)('reorder metrics', {
        id: 2,
        direction: 'up',
      });
      expect(appMock.state.metrics).to.have.length(2);
      expect(appMock.state.metrics[0]).to.have.property('id', 2);
      expect(appMock.state.metrics[1]).to.have.property('id', 1);
    });

    it('changes nothing when moving the topmost metric up', () => {
      Actions.receiveAction.bind(appMock)('reorder metrics', {
        id: 1,
        direction: 'up',
      });
      expect(appMock.state.metrics).to.have.length(2);
      expect(appMock.state.metrics[0]).to.have.property('id', 1);
      expect(appMock.state.metrics[1]).to.have.property('id', 2);
    });

    it('changes nothing when moving the bottommost metric down', () => {
      Actions.receiveAction.bind(appMock)('reorder metrics', {
        id: 2,
        direction: 'down',
      });
      expect(appMock.state.metrics).to.have.length(2);
      expect(appMock.state.metrics[0]).to.have.property('id', 1);
      expect(appMock.state.metrics[1]).to.have.property('id', 2);
    });
  });

  describe('modal', () => {
    describe('confirm modal', () => {
      beforeEach(() => {
        appMock.state.modal = {
          title: 'Test modal',
          message: 'Confirm or cancel',
          buttons: [
            {label: 'Confirm', purpose: 'confirm'},
            {label: 'Cancel', purpose: 'cancel'},
          ],
          nextAction: {
            name: 'add metric',
            params: {},
          },
        };
        appMock.state.metrics = [];
        Actions.receiveAction.bind(appMock)('confirm modal');
      });

      it('closes the modal', () => {
        expect(appMock.state.modal).to.not.be.ok;
      });

      it('executes the next action', () => {
        expect(appMock.state.metrics).to.have.length(1);
      });
    });

    describe('cancel modal', () => {
      beforeEach(() => {
        appMock.state.modal = {
          title: 'Test modal',
          message: 'Confirm or cancel',
          buttons: [
            {label: 'Confirm', purpose: 'confirm'},
            {label: 'Cancel', purpose: 'cancel'},
          ],
          nextAction: {
            name: 'add metric',
            params: {},
          },
        };
        appMock.state.metrics = [];
        Actions.receiveAction.bind(appMock)('cancel modal');
      });

      it('closes the modal', () => {
        expect(appMock.state.modal).to.not.be.ok;
      });

      it('does not execute the next action', () => {
        expect(appMock.state.metrics).to.have.length(0);
      });
    });
  });
});
