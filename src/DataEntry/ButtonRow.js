import React from 'react';
import Button from '../components/Button';

const ButtonRow = ({ values, onClick }) => (
  <div className="metric-entry-button-row">
    {values.map(value => (
      <Button
        className="button-row-button"
        key={value}
        onClick={() => onClick(value)}
      >
        {value}
      </Button>
    ))}
  </div>
);

ButtonRow.propTypes = {
  values: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  onClick: React.PropTypes.func.isRequired,
};

export default ButtonRow;
