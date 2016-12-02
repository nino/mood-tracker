import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import MainUI from './MainUI'
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../../test/SampleMetricsWithoutEntries'
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData'

let callbackCounter = 0
const callback = () => {
  callbackCounter += 1
}

describe('MainUI', () => {
  it('renders all subcomponents without crashing', () => {
    const component = shallow(
      <MainUI appState={{metrics: SampleMetricsWithEntries}}
        onAction={callback}/>
    )
    expect(component.find('DataEntryContainer')).to.have.length(1)
    expect(component.find('DataDisplayContainer')).to.have.length(1)
    expect(component.find('Settings')).to.have.length(1)
  })
})
