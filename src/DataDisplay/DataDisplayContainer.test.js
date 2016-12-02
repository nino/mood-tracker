import React from 'react'
import ReactDOM from 'react-dom'
import DataDisplayContainer from './DataDisplayContainer'
import {expect} from 'chai'
import {shallow} from 'enzyme'
import SampleMetricsEmpty from '../../test/SampleMetricsEmpty'
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../../test/SampleMetricsWithoutEntries'
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData'

describe('DataDisplayContainer', () => {
  it('shows a message if no metrics exist yet', () => {
    const component = shallow(
      <DataDisplayContainer metrics={SampleMetricsEmpty} />
    )
    expect(component.text()).to.equal('No metrics found.')
  })

  it('renders graphs if data is provided', () => {
    const component = shallow(
      <DataDisplayContainer metrics={SampleMetricsWithEntries} />
    )
    expect(component.children().nodes).to.have.length(2)
  })
})

