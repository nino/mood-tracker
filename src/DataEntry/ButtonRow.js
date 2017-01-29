/* @flow */
import React from 'react';
import { Button } from '@blueprintjs/core';

type ButtonRowProps = {
  values: number[],
  colors: string[],
  onClick: void => void,
};

const ButtonRow = ({ values, colors, onClick }: ButtonRowProps) => (
  <div className="pt-button-group pt-fill" style={{ position: 'relative', maxWidth: '100%' }}>
    {values.map((value, idx) => (
      <Button
        className="button-row-button"
        key={value}
        style={{
          color: colors[idx] || 'black',
        }}
        onClick={() => onClick(value)}
      >
        {value}
      </Button>
    ))}
  </div>
);

export default ButtonRow;
