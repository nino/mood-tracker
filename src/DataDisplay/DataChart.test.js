/* eslint-env jest */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { VictoryChart } from 'victory';
import { MoodWithEntries } from '../../test/SampleMetrics';

import DataChart from './DataChart';

describe('DataChart', () => {
  it('renders a VictoryChart', () => {
    const component = shallow(<DataChart metric={MoodWithEntries} />);
    expect(component.find(VictoryChart)).to.have.length(1);
  });
});
