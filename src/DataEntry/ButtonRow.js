import React from 'react';
import { Button } from '@blueprintjs/core';

const ButtonRow = ({ values, colors, onClick }) => (
  <div className="pt-button-group pt-fill" style={{ position: 'relative', maxWidth: '100%' }}>
    {values.map((value, idx) => (
      <Button
        className="button-row-button"
        key={idx}
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

ButtonRow.propTypes = {
  values: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  colors: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  onClick: React.PropTypes.func.isRequired,
};

export default ButtonRow;
