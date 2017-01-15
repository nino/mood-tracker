/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import ButtonRow from './ButtonRow';

describe('Metric-entry button-row', () => {
  it('renders one button per passed value', () => {
    const component = shallow(<ButtonRow values={[1, 2, 3]} onClick={jest.fn()} colors={[]} />);
    expect(component.find('Button')).to.have.length(3);
  });

  it('calls onClick with the value of the clicked button', () => {
    const onClick = jest.fn();
    const component = mount(<ButtonRow values={[1, 2, 3]} onClick={onClick} colors={[]} />);
    component.find('button').first().simulate('click');
    expect(onClick.mock.calls).to.have.length(1);
    expect(onClick.mock.calls[0][0]).to.equal(1);
  });
});
