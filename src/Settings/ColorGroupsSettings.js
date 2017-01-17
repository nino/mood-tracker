import React from 'react';
import { Button } from '@blueprintjs/core';
import { nullableColorGroupShape } from '../types';

export const SingleColorGroupSettings = ({ colorGroup, onUpdate, editing, onDelete }) => (
  <div className={`single-color-group-${editing ? 'editing' : 'not-editing'}`}>
    <label className="pt-label pt-inline" htmlFor="minValue">
      From
      <input
        onChange={e => onUpdate({ minValue: e.target.value })}
        name="minValue"
        className="color-group-minValue-field pt-input"
        disabled={!editing}
        value={colorGroup.minValue || ''}
      />
    </label>
    <label className="pt-label pt-inline" htmlFor="maxValue">
      to
      <input
        onChange={e => onUpdate({ maxValue: e.target.value })}
        name="maxValue"
        className="color-group-maxValue-field pt-input"
        disabled={!editing}
        value={colorGroup.maxValue || ''}
      />
    </label>
    <label className="pt-label pt-inline" htmlFor="color">
      use
      <input
        onChange={e => onUpdate({ color: e.target.value })}
        name="color"
        className="color-group-color-field pt-input"
        disabled={!editing}
        value={colorGroup.color || ''}
      />
    </label>
    { editing ? (
      <Button
        onClick={onDelete}
        className="delete-color-group-button pt-icon-delete"
        style={{
          height: '1em',
        }}
      />
    ) : (null)
    }
  </div>
);

SingleColorGroupSettings.propTypes = {
  colorGroup: nullableColorGroupShape.isRequired,
  onUpdate: React.PropTypes.func.isRequired,
  editing: React.PropTypes.bool,
  onDelete: React.PropTypes.func.isRequired,
};

const ColorGroupsSettings = ({ colorGroups, onUpdate, editing }) => {
  function handleChange(index, updatedField) {
    onUpdate({
      colorGroups: colorGroups.slice(0, index).concat(
        { ...colorGroups[index], ...updatedField },
        colorGroups.slice(index + 1, colorGroups.length),
      ),
    });
  }

  function handleAddColorGroup() {
    onUpdate({
      colorGroups: colorGroups.concat({
        minValue: null,
        maxValue: null,
        color: '',
      }),
    });
  }

  function handleDeleteColorGroup(idx) {
    onUpdate({
      colorGroups: colorGroups.slice(0, idx).concat(colorGroups.slice(idx + 1, colorGroups.length)),
    });
  }

  return (
    <div className={`color-groups-settings-${editing ? 'editing' : 'not-editing'} pt-card`}>
      <h5>Color groups</h5>
      {colorGroups.map((colorGroup, idx) => (
        <SingleColorGroupSettings
          colorGroup={colorGroup}
          key={idx}
          onUpdate={updatedField => handleChange(idx, updatedField)}
          onDelete={() => handleDeleteColorGroup(idx)}
          editing={editing}
        />
      ))}
      {editing ? (
        <Button
          className="add-color-group-button pt-icon-add-to-artifact"
          onClick={handleAddColorGroup}
        >
          Add color group
        </Button>
        ) : null}
    </div>
  );
};

ColorGroupsSettings.propTypes = {
  colorGroups: React.PropTypes.arrayOf(nullableColorGroupShape).isRequired,
  onUpdate: React.PropTypes.func.isRequired,
  editing: React.PropTypes.bool,
};

export default ColorGroupsSettings;
