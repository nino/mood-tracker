/* eslint-env jest */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import ColorGroupsSettings, { SingleColorGroupSettings } from './ColorGroupsSettings';
import { MoodWithEntries } from '../../test/SampleMetrics';

describe('SingleColorGroupSettings', () => {
  it('renders all text fields', () => {
    const component = shallow(
      <SingleColorGroupSettings colorGroup={MoodWithEntries.props.colorGroups} editing />);
    expect(component.find('.color-group-maxValue-field'), 'must render maxValue field')
      .to.have.length(1);
    expect(component.find('.color-group-minValue-field'), 'must render minValue field')
      .to.have.length(1);
    expect(component.find('.color-group-color-field'), 'must render color field')
      .to.have.length(1);
  });

  it('renders a "delete color group" button if editing', () => {
    const component = shallow(
      <SingleColorGroupSettings
        colorGroup={MoodWithEntries.props.colorGroups[0]}
        onUpdate={() => null}
        onDelete={() => null}
        editing
      />);
    expect(component.find('.delete-color-group-button')).to.have.length(1);
  });

  it('does not render a "delete color group" button if not editing', () => {
    const component = shallow(
      <SingleColorGroupSettings
        colorGroup={MoodWithEntries.props.colorGroups[0]}
        onUpdate={() => null}
        onDelete={() => null}
      />);
    expect(component.find('.delete-color-group-button')).to.have.length(0);
  });

  describe('callbacks', () => {
    const onUpdate = jest.fn();
    const onDelete = jest.fn();
    const component = mount(
      <SingleColorGroupSettings
        colorGroup={MoodWithEntries.props.colorGroups[0]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        editing
      />);

    it('calls onUpdate when changing text field values', () => {
      const minValueField = component.find('.color-group-minValue-field').first();
      const maxValueField = component.find('.color-group-maxValue-field').first();
      const colorField = component.find('.color-group-color-field').first();
      minValueField.simulate('change');
      maxValueField.simulate('change');
      colorField.simulate('change');
      expect(onUpdate.mock.calls).to.have.length(3);
      expect(onUpdate.mock.calls[0][0], 'must call onUpdate from minValue-field')
        .to.have.property('minValue').and.to.be.a('string');
      expect(onUpdate.mock.calls[1][0], 'must call onUpdate from maxValue-field')
        .to.have.property('maxValue').and.to.be.a('string');
      expect(onUpdate.mock.calls[2][0], 'must call onUpdate from color-field')
        .to.have.property('color').and.to.be.a('string');
    });

    it('calls onDelete when clicking delete button', () => {
      const deleteButton = component.find('.delete-color-group-button').first();
      deleteButton.simulate('click');
      expect(onDelete.mock.calls).to.have.length(1);
    });
  });
});

describe('ColorGroupsSettings', () => {
  it('renders 4 SingleColorGroupSettings', () => {
    const component = shallow(
      <ColorGroupsSettings colorGroups={MoodWithEntries.props.colorGroups} editing />);
    expect(component.find('SingleColorGroupSettings')).to.have.length(4);
  });

  it('renders a "new color group" button if editing', () => {
    const component = shallow(
      <ColorGroupsSettings
        colorGroups={MoodWithEntries.props.colorGroups} onUpdate={() => null} editing
      />);
    expect(component.find('.add-color-group-button')).to.have.length(1);
  });

  it('does not render a "new color group" button if not editing', () => {
    const component = shallow(
      <ColorGroupsSettings
        colorGroups={MoodWithEntries.props.colorGroups} onUpdate={() => null}
      />);
    expect(component.find('.add-color-group-button')).to.have.length(0);
  });

  it('calls onChange with {colorGroups: ...} as argument when changing a value', () => {
    const onUpdate = jest.fn();
    const component = mount(<ColorGroupsSettings
      colorGroups={MoodWithEntries.props.colorGroups}
      onUpdate={onUpdate}
      editing
    />);
    component.find('.color-group-minValue-field').first().simulate('change');
    expect(onUpdate.mock.calls).to.have.length(1);
    expect(onUpdate.mock.calls[0][0]).to.have.property('colorGroups').and.to.have.length(4);
  });

  it('calls onChange with {colorGroups: ...} as argument when deleting a colorGroup', () => {
    const onUpdate = jest.fn();
    const component = mount(<ColorGroupsSettings
      colorGroups={MoodWithEntries.props.colorGroups}
      onUpdate={onUpdate}
      editing
    />);
    component.find('.delete-color-group-button').first().simulate('click');
    expect(onUpdate.mock.calls).to.have.length(1);
    expect(onUpdate.mock.calls[0][0]).to.have.property('colorGroups').and.to.have.length(3);
  });

  it('calls onChange with {colorGroups: ...} as argument when adding a colorGroup', () => {
    const onUpdate = jest.fn();
    const component = mount(<ColorGroupsSettings
      colorGroups={MoodWithEntries.props.colorGroups}
      onUpdate={onUpdate}
      editing
    />);
    component.find('.add-color-group-button').first().simulate('click');
    expect(onUpdate.mock.calls).to.have.length(1);
    expect(onUpdate.mock.calls[0][0]).to.have.property('colorGroups').and.to.have.length(5);
  });
});
