import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import MetricEntryContainer from './MetricEntryContainer'
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../../test/SampleMetricsWithoutEntries'
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData'

describe('MetricEntryContainer', () => {
    it('renders a MetricEntryButtonRow', () => {
        const callback = () => null
        const component = shallow(
            <MetricEntryContainer metric={SampleMetricsWithoutEntries[0]} onAction={callback} />
        )

        expect(component.find('MetricEntryButtonRow')).to.have.length(1)
    })

    it('renders a MetricEntryFormField', () => {
        const callback = () => null
        const component = shallow(
            <MetricEntryContainer metric={SampleMetricsWithoutEntries[1]} onAction={callback} />
        )

        expect(component.find('MetricEntryFormField')).to.have.length(1)
    })

    it('shows an error for invalid data', () => {
        const callback = () => null
        const component = shallow(
            <MetricEntryContainer metric={SampleMetricsCorruptData[1]} onAction={callback} />
        )
        expect(component.text()).to.include('Error')
    })
})
