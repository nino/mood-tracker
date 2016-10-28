import React from 'react'
import ReactDOM from 'react-dom'
import DataDisplay from './DataDisplay'
import {expect} from 'chai'
import {shallow} from 'enzyme'
import SampleMetricsEmpty from '../test/SampleMetricsEmpty'
import SampleMetricsWithEntries from '../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../test/SampleMetricsWithoutEntries'
import SampleMetricsCorruptData from '../test/SampleMetricsCorruptData'

describe('DataDisplay', () => {
    it('shows a message if no metrics exist yet', () => {
        const component = shallow(
            <DataDisplay metrics={SampleMetricsEmpty} />
        )
        expect(component.text()).to.equal('No metrics found.')
    })

    it('renders graphs if data is provided', () => {
        const component = shallow(
            <DataDisplay metrics={SampleMetricsWithEntries} />
        )
        expect(component.children().nodes).to.have.length(2)
        expect(component.text()).to.include('Mood').and.to.include('Burns')
    })
})

