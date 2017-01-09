/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';

import TextInput from './TextInput';

describe('Metric-entry text-input', () => {
  describe('sub-components', () => {
    const component = shallow(<TextInput onSubmit={jest.fn()} />);

    it('renders a html form', () => {
      expect(component.find('form')).to.have.length(1);
    });

    it('renders an input field', () => {
      expect(component.find('input')).to.have.length(1);
    });

    it('renders a submit button', () => {
      expect(component.find('Button')).to.have.length(1);
    });
  });

  it('calls onSubmit with the entered number when submitting', () => {
    const onSubmit = jest.fn();
    const component = mount(<TextInput onSubmit={onSubmit} />);
    component.find('input').get(0).value = '12';
    component.find('input').first().simulate('change');
    component.find('form').first().simulate('submit');
    expect(onSubmit.mock.calls).to.have.length(1);
    expect(onSubmit.mock.calls[0][0]).to.eql('12');
  });
});
