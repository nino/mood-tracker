import React from 'react';
import {expect} from 'chai';
import {shallow, mount} from 'enzyme';
import ColorGroupsSettings from './ColorGroupsSettings';
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries';

let componentMountedEditing, componentEditing, componentNotEditing;
let cbAction, cbParams;
const callback = (action, params) => {
  cbAction = action;
  cbParams = params;
};

describe('ColorGroupsSettings', () => {
  beforeAll(() => {
    componentMountedEditing = mount(
      <ColorGroupsSettings
        colorGroups={SampleMetricsWithEntries[0].colorGroups}
        onAction={callback}
        editing={true}
        formId='metric-settings-form-1'/>
    );
    componentEditing = shallow(
      <ColorGroupsSettings
        colorGroups={SampleMetricsWithEntries[0].colorGroups}
        onAction={callback}
        editing={true}
        formId='metric-settings-form-1'/>
    );
    componentNotEditing = shallow(
      <ColorGroupsSettings
        colorGroups={SampleMetricsWithEntries[0].colorGroups}
        onAction={callback}
        editing={false}
        formId='metric-settings-form-1'/>
    );
  });

  it('mounts without crashing', () => {
    expect(componentMountedEditing).to.be.ok;
  });

  it('contains 4 SingleColorGroupSettings children', () => {
    expect(componentNotEditing.find('SingleColorGroupSettings'))
      .to.have.length(4);
    expect(componentEditing.find('SingleColorGroupSettings'))
      .to.have.length(4);
  });

  it('contains an "Add color group" button when editing', () => {
    expect(componentEditing.find('Button.add-color-group-button'))
      .to.have.length(1);
  });

  it('doesn\'t contain an "Add color group" button when not editing', () => {
    expect(componentNotEditing.find('Button.add-color-group-button'))
      .to.have.length(0);
  });

  describe('SingleColorGroupSettings subcomponents', () => {
    let singleColorGroupEditing, singleColorGroupNotEditing;
    beforeAll(() => {
      singleColorGroupEditing = (
        componentEditing.find('SingleColorGroupSettings').first().shallow()
      );
      singleColorGroupNotEditing = (
        componentNotEditing.find('SingleColorGroupSettings').first().shallow()
      );
    });

    it('contains a maxValue field', () => {
      expect(singleColorGroupEditing.find('Input.color-group-maxValue-field'))
        .to.have.length(1);
    });

    it('contains a minValue field', () => {
      expect(singleColorGroupEditing.find('Input.color-group-minValue-field'))
        .to.have.length(1);
    });

    it('contains a color field', () => {
      expect(singleColorGroupEditing.find('Input.color-group-color-field'))
        .to.have.length(1);
    });

    it('contains a "Delete color group" button if editing', () => {
      expect(singleColorGroupEditing.find('Button.delete-color-group-button'))
        .to.have.length(1);
    });

    it('does not contain a "Delete color group" button if not editing', () => {
      expect(
        singleColorGroupNotEditing.find('Button.delete-color-group-button'))
        .to.have.length(0);
    });

    it('renders all fields as disabled if not editing', () => {
      ['minValue', 'maxValue', 'color'].forEach(fieldName => {
        let element = singleColorGroupNotEditing.find(
          'Input.color-group-' + fieldName + '-field'
        );
        expect(element).to.have.property('node').and.to.have.property('props');
        expect(element.node.props.disabled).to.be.ok;
      });
    });

    it('renders all fields as not disabled if editing', () => {
      ['minValue', 'maxValue', 'color'].forEach(fieldName => {
        let element = singleColorGroupEditing.find(
          'Input.color-group-' + fieldName + '-field'
        );
        expect(element).to.have.property('node').and.to.have.property('props');
        expect(element.node.props.disabled).to.not.be.ok;
      });
    });
  });

  describe('actions', () => {
    beforeEach(() => {
      cbAction = null;
      cbParams = null;
    });

    it('sends an "update form element" action when changing maxValue', () => {
      let field = componentMountedEditing
        .find('.color-group-maxValue-field > input').at(0);
      field.node.value = '13';
      field.simulate('change', field);
      expect(cbAction).to.equal('update form element');
      expect(cbParams).to.have.property('formId', 'metric-settings-form-1');
      expect(cbParams).to.have.property('name', 'colorGroups');
      expect(cbParams).to.have.property('value');
      expect(cbParams.value).to.be.a('array').and.to.have.length(4);
      expect(cbParams.value[0]).to.have.property('maxValue', '13');
    });

    it('sends an "update form element" action when changing minValue', () => {
      let field = componentMountedEditing
        .find('.color-group-minValue-field > input').at(0);
      field.node.value = '13';
      field.simulate('change', field);
      expect(cbAction).to.equal('update form element');
      expect(cbParams).to.have.property('formId', 'metric-settings-form-1');
      expect(cbParams).to.have.property('name', 'colorGroups');
      expect(cbParams).to.have.property('value');
      expect(cbParams.value).to.be.a('array').and.to.have.length(4);
      expect(cbParams.value[0]).to.have.property('minValue', '13');
    });

    it('sends an "update form element" action when changing color', () => {
      let field = componentMountedEditing
        .find('.color-group-color-field > input').at(0);
      field.node.value = 'teal';
      field.simulate('change', field);
      expect(cbAction).to.equal('update form element');
      expect(cbParams).to.have.property('formId', 'metric-settings-form-1');
      expect(cbParams).to.have.property('name', 'colorGroups');
      expect(cbParams).to.have.property('value');
      expect(cbParams.value).to.be.a('array').and.to.have.length(4);
      expect(cbParams.value[0]).to.have.property('color', 'teal');
    });

    it('sends "update form element" action when adding color group', () => {
      componentMountedEditing.find('.add-color-group-button').first()
        .simulate('click');
      expect(cbAction).to.equal('update form element');
      expect(cbParams).to.have.property('name', 'colorGroups');
      expect(cbParams).to.have.property('value')
        .and.to.have.length(5);
    });

    it('sends "update form element" action when deleting color group', () => {
      componentMountedEditing.find('.delete-color-group-button').first()
        .simulate('click');
      expect(cbAction).to.equal('update form element');
      expect(cbParams).to.have.property('name', 'colorGroups');
      expect(cbParams).to.have.property('value')
        .and.to.have.length(3);
    });
  });
});
