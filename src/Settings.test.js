import React from 'react'
import ReactDOM from 'react-dom'
import Settings from './Settings'
import {expect} from 'chai'
import {shallow} from 'enzyme'
import SampleMetricsEmpty from '../test/SampleMetricsEmpty'
import SampleMetricsWithEntries from '../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../test/SampleMetricsWithoutEntries'
import SampleMetricsCorruptData from '../test/SampleMetricsCorruptData'

describe('Settings', () => {
    it('has two MetricSettings children and a "Add Metric" button', () => {
        const callback = () => null
        const component = shallow(
            <Settings metrics={SampleMetricsWithoutEntries} onAction={callback} />
        )
        expect(component.find('MetricSettings')).to.have.length(2)
        expect(component.text()).to.inculde('Add metric')
    })

    it('calls the "add metric" action', () => {
        let cbAction
        let cbParams
        const callback = (sender, action, params) => {
            cbAction = action
            cbParams = params
        }
        const component = shallow(
            <Settings metrics={SampleMetricsWithoutEntries} onAction={callback} />
        )
        component.find('Add metric').simulate('click')
        expect(cbAction).to.equal('add metric')
        expect(cbParams).to.be.empty()
    })
})
