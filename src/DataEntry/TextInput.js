import React from 'react';
import Button from '../components/Button';

const TextInput = ({ onSubmit }) => {
  let inputField;

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(inputField.value);
  }

  return (
    <div className="metric-entry-text-input">
      <form onSubmit={handleSubmit}>
        <input className="metric-entry-text-input" ref={(i) => { inputField = i; }} />
        <Button>Submit</Button>
      </form>
    </div>
  );
};

TextInput.propTypes = {
  onSubmit: React.PropTypes.func.isRequired,
};

export default TextInput;
