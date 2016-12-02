import React from 'react'
import {shallow, render, mount} from 'enzyme'
import {expect} from 'chai'
import DataChart from './DataChart'
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../../test/SampleMetricsWithEntries'
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData'

describe('DataChart', () => {

  it('renders a canvas', () => {
    const component = shallow(
      <DataChart metric={SampleMetricsWithEntries[0]} />
    )
    expect(component.find('canvas')).to.have.length(1)
  })

})
