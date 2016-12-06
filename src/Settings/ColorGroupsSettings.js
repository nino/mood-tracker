import React from 'react';
import './ColorGroupsSettings.css';
import {Input, Button} from 'semantic-ui-react';

const SingleColorGroupSettings = ({colorGroup, onChange, formId, editing, onDelete}) => {
  if (!colorGroup) {
    return (<div>Error</div>);
  }

  return (
    <div className='single-color-group-settings'>
      From 
      <Input size='mini' type='text' onChange={onChange} name='minValue'
        disabled={!editing}
        value={colorGroup.minValue}
        className='color-group-minValue-field'/> 
      to 
      <Input size='mini' type='text' onChange={onChange} name='maxValue'
        disabled={!editing}
        value={colorGroup.maxValue}
        className='color-group-maxValue-field'/>, 
      use color 
      <Input size='mini' type='text' onChange={onChange} name='color'
        disabled={!editing}
        value={colorGroup.color}
        className='color-group-color-field'/>.
      {editing ? (
        <Button type='button' onClick={onDelete}
          className='delete-color-group-button'
          size='mini'>
          Delete color group
        </Button>
      ) : (<div />)}
    </div>
  );
}

SingleColorGroupSettings.propTypes = {
  colorGroup: React.PropTypes.object.isRequired,
  formId: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired,
  onDelete: React.PropTypes.func.isRequired,
  editing: React.PropTypes.bool,
};

/**
 * Container for the form to edit color groups.
 */
const ColorGroupsSettings = ({colorGroups, onAction, formId, editing}) => {
  /**
   * Since the `ColorGroupsSettings` component gets treated as
   * a single form element, new color groups have to be created here,
   * and handed upstairs to the app-state.
   * This means the entire `colorGroups` array is the "value" 
   * of the "form field".
   */
  const sendUpdate = (updatedColorGroups) => {
    onAction('update form element', {
      name: 'colorGroups',
      formId: formId,
      value: updatedColorGroups,
    });
  };

  const handleClickNewGroup = (event) => {
    if (!colorGroups) {
      colorGroups = [];
    }
    let newColorGroups = colorGroups.concat({
      minValue: 0,
      maxValue: 0,
      color: '',
    });
    sendUpdate(newColorGroups);
  };

  const handleDeleteGroup = (groupIndex) => {
    let newColorGroups = colorGroups.slice(0, groupIndex)
      .concat(colorGroups.slice(groupIndex+1, colorGroups.length));
    sendUpdate(newColorGroups);
  };

  const handleChange = (event, groupIndex) => {
    let updatedField = {};
    updatedField[event.target.name] = event.target.value;
    let updatedGroup = Object.assign(
      {}, colorGroups[groupIndex], updatedField
    );
    let newColorGroups = colorGroups.slice(0, groupIndex).concat(
      updatedGroup,
      colorGroups.slice(groupIndex+1, colorGroups.length),
    );
    sendUpdate(newColorGroups);
  };

  return (
    <div className='color-groups-settings'>
      <div className='color-groups-settings-title'>
        Color groups
      </div>
      {colorGroups && colorGroups.length > 0 ?
          colorGroups.map((colorGroup, index) => (
            <SingleColorGroupSettings
              key={index} colorGroup={colorGroup}
              formId={formId} editing={editing}
              onDelete={() => handleDeleteGroup(index)}
              onChange={(event) => handleChange(event, index)}/>
          )) : (<div className='nocolorgroupsmessage'>(No color groups)</div>)}
          {editing ? (
            <Button type='button' className='add-color-group-button'
              size='mini' onClick={handleClickNewGroup}>
              Add color group
            </Button>
          ) : (<div />)}
        </div>
  );
};

ColorGroupsSettings.propTypes = {
  colorGroups: React.PropTypes.array,
  onAction: React.PropTypes.func.isRequired,
  formId: React.PropTypes.string.isRequired,
  editing: React.PropTypes.bool,
};

export default ColorGroupsSettings;
