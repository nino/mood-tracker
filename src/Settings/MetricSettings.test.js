/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import { MoodWithEntries } from '../../test/SampleMetrics';

import { MetricSettings } from './MetricSettings';
import ColorGroupsSettings from './ColorGroupsSettings';

describe('MetricSettings', () => {
  describe('sub-components', () => {
    it('renders sub-components if editing', () => {
      const component = shallow(
        <MetricSettings metric={MoodWithEntries} dispatch={() => null} editing />);

      const nameField = component.find('.name-field');
      expect(nameField, 'must render name field').to.have.length(1);
      expect(nameField.first().props().disabled).to.not.be.ok;

      const minValueField = component.find('.minValue-field');
      expect(minValueField, 'must render minValue field').to.have.length(1);
      expect(minValueField.first().props().disabled).to.not.be.ok;

      const maxValueField = component.find('.maxValue-field');
      expect(maxValueField, 'must render maxValue field').to.have.length(1);
      expect(maxValueField.first().props().disabled).to.not.be.ok;

      const colorGroupsComponent = component.find(ColorGroupsSettings);
      expect(colorGroupsComponent, 'must render ColorGroupsSettings').to.have.length(1);
      expect(colorGroupsComponent.first().props().editing).to.be.ok;

      expect(component.find('.move-metric-up-button'), 'must render move up button')
        .to.have.length(1);
      expect(component.find('.move-metric-down-button'), 'must render move down button')
        .to.have.length(1);
      expect(component.find('.update-metric-button'), 'must render save button')
        .to.have.length(1);
      expect(component.find('.stop-editing-button'), 'must render cancel button')
        .to.have.length(1);
      expect(component.find('.delete-metric-button'), 'must render delete metric button')
        .to.have.length(1);
      expect(component.find('.start-editing-button'), 'must not render edit metric button')
        .to.have.length(0);
    });

    it('renders subcomponents if not editing', () => {
      const component = shallow(
        <MetricSettings metric={MoodWithEntries} dispatch={() => null} />);

      const nameField = component.find('.name-field');
      expect(nameField, 'must render name field').to.have.length(1);
      expect(nameField.first().props().disabled).to.be.ok;

      const minValueField = component.find('.minValue-field');
      expect(minValueField, 'must render minValue field').to.have.length(1);
      expect(minValueField.first().props().disabled).to.be.ok;

      const maxValueField = component.find('.maxValue-field');
      expect(maxValueField, 'must render maxValue field').to.have.length(1);
      expect(maxValueField.first().props().disabled).to.be.ok;

      const colorGroupsComponent = component.find(ColorGroupsSettings);
      expect(colorGroupsComponent, 'must render ColorGroupsSettings').to.have.length(1);
      expect(colorGroupsComponent.first().props().editing).to.not.be.ok;

      expect(component.find('.move-metric-up-button'), 'must not render move up button')
        .to.have.length(0);
      expect(component.find('.move-metric-down-button'), 'must not render move down button')
        .to.have.length(0);
      expect(component.find('.update-metric-button'), 'must not render save button')
        .to.have.length(0);
      expect(component.find('.stop-editing-button'), 'must not render cancel button')
        .to.have.length(0);
      expect(component.find('.delete-metric-button'), 'must not render delete metric button')
        .to.have.length(0);
      expect(component.find('.start-editing-button'), 'must render edit metric button')
        .to.have.length(1);
    });
  });

  describe('actions', () => {
    const dispatch = jest.fn();
    const component = mount(
      <MetricSettings metric={MoodWithEntries} editing dispatch={dispatch} />);

    it('dispatches "update edited metric" action on form field change', () => {
      const inputs = component.find('input');
      inputs.forEach((input) => {
        const callsSoFar = dispatch.mock.calls.length;
        input.simulate('change');
        expect(dispatch.mock.calls.length).to.equal(callsSoFar + 1);
        expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
          .to.have.property('type', 'update edited metric');
      });
    });

    it('dispatches "update edited metric" with colorGroups when updating color groups', () => {
      const callsSoFar = dispatch.mock.calls.length;
      component.find('.color-group-minValue-field').first().simulate('change');
      expect(dispatch.mock.calls.length).to.equal(callsSoFar + 1);
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('type', 'update edited metric');
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('updatedProps')
        .and.to.have.property('colorGroups').and.to.have.length(4);
    });

    it('dispatches "reorder metrics" on click on up and down buttons', () => {
      const moveUpButton = component.find('.move-metric-up-button').first();
      const moveDownButton = component.find('.move-metric-down-button').first();
      const callsSoFar = dispatch.mock.calls.length;
      moveUpButton.simulate('click');
      expect(dispatch.mock.calls.length).to.equal(callsSoFar + 1);
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('type', 'reorder metrics');
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('direction', 'up');
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('metricId', 1);
      moveDownButton.simulate('click');
      expect(dispatch.mock.calls.length).to.equal(callsSoFar + 2);
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('type', 'reorder metrics');
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('direction', 'down');
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('metricId', 1);
    });

    it('dispatches "delete metric" on click on delete button', () => {
      const deleteButton = component.find('.delete-metric-button').first();
      const callsSoFar = dispatch.mock.calls.length;
      deleteButton.simulate('click');
      expect(dispatch.mock.calls.length).to.equal(callsSoFar + 1);
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('type', 'delete metric');
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('metricId', 1);
    });

    it('dispatches "stop editing" on click cancel', () => {
      const cancelButton = component.find('.stop-editing-button').first();
      const callsSoFar = dispatch.mock.calls.length;
      cancelButton.simulate('click');
      expect(dispatch.mock.calls.length).to.equal(callsSoFar + 1);
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('type', 'stop editing');
    });

    it('dispatches "update metric" on click save', () => {
      const saveButton = component.find('.update-metric-button').first();
      const callsSoFar = dispatch.mock.calls.length;
      saveButton.simulate('click');
      expect(dispatch.mock.calls.length).to.equal(callsSoFar + 1);
      expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0])
        .to.have.property('type', 'update metric');
    });
  });
});
