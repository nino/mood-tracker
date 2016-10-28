import React from 'react'
import {shallow, render, mount} from 'enzyme'
import {expect} from 'chai'
import DataDisplayGraph from './DataDisplayGraph'
import SampleMetricsWithEntries from '../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../test/SampleMetricsWithEntries'
import SampleMetricsCorruptData from '../test/SampleMetricsCorruptData'

describe('DataDisplayGraph', () => {

    it('renders a canvas', () => {
        const component = shallow(
            <DataDisplayGraph metric={SampleMetricsWithEntries[0]} />
        )
        expect(component.find('canvas')).to.have.length(1)
    })

})
