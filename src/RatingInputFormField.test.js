import React from 'react'
import {shallow, mount} from 'enzyme'
import {expect} from 'chai'
import RatingInputFormField from './RatingInputFormField'
import SampleMetricsWithEntries from '../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../test/SampleMetricsWithoutEntries'
import SampleMetricsCorruptData from '../test/SampleMetricsCorruptData'

describe('RatingInputFormField', () => {
    it('renders an input field and a button', () => {
        const callback = () => null
        const component = shallow(
            <RatingInputFormField metric={SampleMetricsWithEntries[1]} onAction={callback} />
        )
        expect(component.find('Input')).to.have.length(1)
        expect(component.find('Button')).to.have.length(1)
    })

    it('calls the correct callback', () => {
        let cbSender
        let cbAction
        let cbParams
        const callback = (sender, action, params) => {
            cbSender = sender
            cbAction = action
            cbParams = params
        }
        const component = mount(
            <RatingInputFormField metric={SampleMetricsWithEntries[1]} onAction={callback} />
        )

        const inputField = component.find('input')
        inputField.node.value = '32'
        component.find('input').simulate('change', inputField)
        component.find('form').simulate('submit')
        expect(component.find('button')).to.have.length(1)
        expect(cbAction).to.equal('log metric')
        expect(cbParams).to.have.property('name').and.to.include('Burns')
        expect(cbParams).to.have.property('rating', '32')
    })
})
