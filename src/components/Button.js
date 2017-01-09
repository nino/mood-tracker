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

export default class Button extends React.Component {
  handleClick(event) {
    event.preventDefault();
    this.props.onClick(event);
  }

  render() {
    return (
      <StyledButton {...this.props} onClick={this.handleClick.bind(this)}>
        {this.props.children}
      </StyledButton>
    );
  }
}
