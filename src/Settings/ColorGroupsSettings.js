import React from 'react';
import Button from '../components/Button';
import { colorGroupShape } from '../types';

export const SingleColorGroupSettings = ({ colorGroup, onUpdate, editing, onDelete }) => (
  <div className={`single-color-group-${editing ? 'editing' : 'not-editing'}`}>
    From
    <input
      onChange={e => onUpdate({ minValue: e.target.value })}
      name="minValue"
      className="color-group-minValue-field"
      value={colorGroup.minValue}
    />
    to
    <input
      onChange={e => onUpdate({ maxValue: e.target.value })}
      name="maxValue"
      className="color-group-maxValue-field"
      value={colorGroup.maxValue}
    />
    use
    <input
      onChange={e => onUpdate({ color: e.target.value })}
      name="color"
      className="color-group-color-field"
      value={colorGroup.color}
    />
    { editing ? (
      <Button onClick={onDelete} className="delete-color-group-button">X</Button>
      ) : (null)
    }
  </div>
);

SingleColorGroupSettings.propTypes = {
  colorGroup: colorGroupShape.isRequired,
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
    <div className={`color-groups-settings-${editing ? 'editing' : 'not-editing'}`}>
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
        <Button className="add-color-group-button" onClick={handleAddColorGroup}>
          Add color group
        </Button>
        ) : null}
    </div>
  );
};

ColorGroupsSettings.propTypes = {
  colorGroups: React.PropTypes.arrayOf(colorGroupShape).isRequired,
  onUpdate: React.PropTypes.func.isRequired,
  editing: React.PropTypes.bool,
};

export default ColorGroupsSettings;
