import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import MetricEntryComponent from './MetricEntryComponent'
import SampleMetricsWithEntries from '../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../test/SampleMetricsWithoutEntries'
import SampleMetricsCorruptData from '../test/SampleMetricsCorruptData'

describe('MetricEntryComponent', () => {
    it('renders a RatingInputButtonRow', () => {
        const callback = () => null
        const component = shallow(
            <MetricEntryComponent metric={SampleMetricsWithoutEntries[0]} onAction={callback} />
        )

        expect(component.find('RatingInputButtonRow')).to.have.length(1)
    })

    it('renders a RatingInputFormField', () => {
        const callback = () => null
        const component = shallow(
            <MetricEntryComponent metric={SampleMetricsWithoutEntries[1]} onAction={callback} />
        )

        expect(component.find('RatingInputFormField')).to.have.length(1)
    })

    it('shows an error for invalid data', () => {
        const callback = () => null
        const component = shallow(
            <MetricEntryComponent metric={SampleMetricsCorruptData[1]} onAction={callback} />
        )
        expect(component.text()).to.include('Error')
    })
})
