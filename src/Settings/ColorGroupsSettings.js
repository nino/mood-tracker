/* @flow */
/* global SyntheticInputEvent */
import React from 'react';
import Radium from 'radium';
import { Button } from '@blueprintjs/core';
import type { TNullableMetricProps, TEditedColorGroup, TNullableColorGroup } from '../types';

type TSingleColorGroupSettingsProps = {
  colorGroup: TEditedColorGroup,
  onUpdate: (TNullableColorGroup) => void,
  editing?: boolean,
  onDelete: (void) => void,
};

export const SingleColorGroupSettings = ({ colorGroup, onUpdate, editing, onDelete }: TSingleColorGroupSettingsProps) => (
  <div
    className={`single-color-group-${editing ? 'editing' : 'not-editing'}`}
    style={{
      display: 'flex',
      flexWrap: 'wrap',
    }}
  >
    <label
      className="pt-label pt-inline"
      htmlFor="minValue"
      style={{ marginRight: '1ex' }}
    >
      From
      <input
        onChange={(e: SyntheticInputEvent) => onUpdate({ minValue: e.target.value })}
        name="minValue"
        className="color-group-minValue-field pt-input"
        disabled={!editing}
        value={colorGroup.minValue || ''}
        style={{ width: '8ex' }}
      />
    </label>
    <label
      className="pt-label pt-inline"
      htmlFor="maxValue"
      style={{ marginRight: '1ex' }}
    >
      to
      <input
        onChange={(e: SyntheticInputEvent) => onUpdate({ maxValue: e.target.value })}
        name="maxValue"
        className="color-group-maxValue-field pt-input"
        disabled={!editing}
        value={colorGroup.maxValue || ''}
        style={{ width: '8ex' }}
      />
    </label>
    <label className="pt-label pt-inline" htmlFor="color">
      use
      <input
        onChange={(e: SyntheticInputEvent) => onUpdate({ color: e.target.value })}
        name="color"
        className="color-group-color-field pt-input"
        disabled={!editing}
        value={colorGroup.color || ''}
        style={{ width: '16ex' }}
      />
    </label>
    { editing ? (
      <Button
        onClick={onDelete}
        className="delete-color-group-button pt-icon-delete"
        style={{ height: '1em' }}
      />
    ) : (<div />)
    }
  </div>
);

SingleColorGroupSettings.defaultProps = { editing: false };

type TColorGroupsSettingsProps = {
  colorGroups: Array<TEditedColorGroup>,
  onUpdate: (TNullableMetricProps) => void,
  editing: boolean,
};

const ColorGroupsSettings = ({ colorGroups, onUpdate, editing }: TColorGroupsSettingsProps) => {
  function handleChange(index: number, updatedField: TNullableColorGroup): void {
    const selectedColorGroup: TEditedColorGroup = colorGroups[index];
    if (selectedColorGroup == null) { return; }
    const updatedColorGroup: TNullableColorGroup = { ...selectedColorGroup, ...updatedField };
    onUpdate({
      colorGroups: [
        ...colorGroups.slice(0, index),
        updatedColorGroup,
        ...colorGroups.slice(index + 1, colorGroups.length),
      ],
    });
  }

  function handleAddColorGroup() {
    onUpdate({ colorGroups: [...colorGroups, { color: '', minValue: null, maxValue: null }] });
  }

  function handleDeleteColorGroup(idx: number): void {
    const before = colorGroups.slice(0, idx);
    const after = colorGroups.slice(idx + 1, colorGroups.length);
    onUpdate({ colorGroups: [...before, ...after] });
  }

  // TODO give eveyrthing an ID
  /* eslint-disable react/no-array-index-key */
  return (
    <div
      className={`color-groups-settings-${editing ? 'editing' : 'not-editing'} pt-card`}
    >
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

export default Radium(ColorGroupsSettings);

