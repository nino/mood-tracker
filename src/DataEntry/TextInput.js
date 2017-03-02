// @flow
import React from 'react';
import { Button } from '@blueprintjs/core';

type TextInputProps = {
  onSubmit: React.DOM.Event => void,
};

const TextInput = ({ onSubmit }: TextInputProps) => {
  let inputField: React.DOM.HTMLElement;

  function handleSubmit(event: React.DOM.Event): void {
    event.preventDefault();
    onSubmit(inputField.value);
  }

  return (
    <div className="metric-entry-text-input">
      <form onSubmit={handleSubmit}>
        <div className="pt-control-group">
          <input
            className="pt-input metric-entry-text-input pt-fill"
            ref={(i: React.DOM.HTMLElement) => { inputField = i; }}
          />
          <Button className="pt-icon-tick">Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default TextInput;

