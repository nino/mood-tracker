import React from 'react'
import {shallow, render, mount} from 'enzyme'
import {expect} from 'chai'
import DataEntryForm from './DataEntryForm'
import SampleMetricsWithEntries from '../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../test/SampleMetricsWithEntries'
import SampleMetricsCorruptData from '../test/SampleMetricsCorruptData'

describe('DataEntryForm', () => {
    it('renders 2 MetricEntryComponents', () => {
        const callback = () => null
        const component = shallow(
            <DataEntryForm metrics={SampleMetricsWithEntries} onAction={callback} />
        )
        expect(component.find('MetricEntryComponent')).to.have.length(2)
    })
})
