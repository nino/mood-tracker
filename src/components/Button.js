/* @flow */
import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 4px 12px;
  text-align: center;
  border: 2px solid grey;
  border-radius: 3;
  background-color: white;
  box-shadow: 0px 3px 7px rgba(0, 0, 0, 0.4);
  outline: none;

  &:hover {
    background-color: #ccc;
  }

  &:active {
    background-color: #aaa;
  }

  &:focus {
    background-color: #bbb;
  }
`;

const Button = (props) => {
  function handleClick(event) {
    event.preventDefault();
    props.onClick(event);
  }

  return (
    <StyledButton {...props} onClick={handleClick}>
      {props.children}
    </StyledButton>
  );
};

Button.propTypes = {
  onClick: React.PropTypes.func,
  children: React.PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

export default Button;
