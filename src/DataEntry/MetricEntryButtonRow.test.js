import React from 'react'
import ReactDOM from 'react-dom'
import {shallow, mount} from 'enzyme'
import {expect} from 'chai'
import {Button} from 'semantic-ui-react'
import MetricEntryButtonRow from './MetricEntryButtonRow'
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries'
import SampleMetricsWithoutEntries from '../../test/SampleMetricsWithoutEntries'
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData'



describe('MetricEntryButtonRow', () => {
    it('renders 10 buttons', () => {
        let callback = () => null
        const component = shallow(
            <MetricEntryButtonRow onAction={callback} metric={SampleMetricsWithoutEntries[0]} />
        )
        expect(component.children().nodes).to.have.length(10)
        expect(component.children().nodes[0].props).to.have.property('color', 'red')
        expect(component.children().nodes[1].props).to.have.property('color', 'red')
        expect(component.children().nodes[2].props).to.have.property('color', 'red')
        expect(component.children().nodes[3].props).to.have.property('color', 'yellow')
        expect(component.children().nodes[4].props).to.have.property('color', 'yellow')
        expect(component.children().nodes[5].props).to.have.property('color', 'yellow')
        expect(component.children().nodes[6].props).to.have.property('color', 'green')
        expect(component.children().nodes[7].props).to.have.property('color', 'green')
        expect(component.children().nodes[8].props).to.have.property('color', 'green')
        expect(component.children().nodes[9].props).to.have.property('color', 'blue')
    })

    it('sends the correct callback', () => {
        let callbackAction
        let callbackParams
        let callback = (action, params) => {
            callbackAction = action
            callbackParams = params
        }
        const component = mount(
            <MetricEntryButtonRow onAction={callback} metric={SampleMetricsWithoutEntries[0]} />
        )

        component.find('button').at(0).simulate('click')
        expect(callbackAction).to.equal('log metric')
        expect(callbackParams).to.have.property('rating', 1)
        expect(callbackParams).to.have.property('id', 1)


        component.find('button').at(2).simulate('click')
        expect(callbackAction).to.equal('log metric')
        expect(callbackParams).to.have.property('rating', 3)
        expect(callbackParams).to.have.property('id', 1)


        component.find('button').at(9).simulate('click')
        expect(callbackAction).to.equal('log metric')
        expect(callbackParams).to.have.property('rating', 10)
        expect(callbackParams).to.have.property('id', 1)
    })
})
