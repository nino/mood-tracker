import React from 'react'
import ReactDOM from 'react-dom'
import {shallow, mount} from 'enzyme'
import {expect} from 'chai'
import MetricSettings from './MetricSettings'
import SampleMetricsWithEntries from '../../test/SampleMetricsWithEntries'
import SampleMetricsCorruptData from '../../test/SampleMetricsCorruptData'
import {cloneDeep} from 'lodash'


describe('MetricSettings', () => {
    it('mounts without crashing', () => {
        expect(mount(
            <MetricSettings metric={SampleMetricsWithEntries[0]}
                onAction={()=>null}/>
        )).to.be.ok
    })

    describe('subcomponents when not editing', () => {
        let component
        beforeAll(() => {
            component = shallow(
                <MetricSettings
                    metric={SampleMetricsWithEntries[0]}
                    editing={false} onAction={()=>null}/>
            )
        })

        it('contains a name field', () => {
            expect(component.find('Input.name-field')).to.have.length(1)
        })
        it('contains a type field', () => {
            expect(component.find('.type-field')).to.have.length(1)
        })
        it('contains a min field', () => {
            expect(component.find('Input.minValue-field')).to.have.length(1)
        })
        it('contains a max field', () => {
            expect(component.find('Input.maxValue-field')).to.have.length(1)
        })
        it('has a ColorGroupsSettings subcomponent', () => {
            expect(component.find('ColorGroupsSettings')).to.have.length(1)
        })
        it('has a html form', () => {
            expect(component.find('Form')).to.have.length(1)
        })
        it("doesn't have save button", () => {
            expect(component.find('Button.save-button')).to.have.length(0)
        })
        it('renders all input fields as disabled if not editing', () => {
            component.find('Input').forEach(inputField => {
                expect(inputField)
                .to.have.property('node')
                .and.to.have.property('props')
                .and.to.have.property('disabled', true)
            })
        })
    })

    describe('subcomponents when editing', () => {
        let component
        let inputFields
        beforeAll(() => {
            component = shallow(
                <MetricSettings
                    metric={SampleMetricsWithEntries[0]}
                    editing={true} onAction={() => null}/>
            )
            inputFields = component.find('Input')
        })

        it('renders all input fields as enabled', () => {
            component.find('Input').forEach(inputField => {
                expect(inputField)
                .to.have.property('node')
                .and.to.have.property('props')
                .and.to.have.property('disabled', false)
            })
        })

        it('renders a Save button', () => {
            expect(component.find('Button.save-button')).to.have.length(1)
        })

        it('renders a Cancel button', () => {
            expect(component.find('Button.cancel-button')).to.have.length(1)
        })

        it('renders a Delete button', () => {
            expect(component.find('Button.delete-button')).to.have.length(1)
        })

        it('renders Move Up and Move Down buttons', () => {
            expect(component.find('Button.moveUp-button')).to.have.length(1)
            expect(component.find('Button.moveDown-button')).to.have.length(1)
        })
    })

    describe('actions', () => {
        let component
        let cbAction
        let cbParams
        let callback = (action, params) => {
            cbAction = action
            cbParams = params
        }

        beforeEach(() => {
            cbAction = null
            cbParams = null
            component = mount(
                <MetricSettings
                metric={SampleMetricsWithEntries[0]}
                editing={true} onAction={callback}
                />
            )
        })

        it('sends an "update metric" action', () => {
            component.find('form').simulate('submit')
            expect(cbAction).to.equal('update metric')
            expect(cbParams).to.have.property('id').and.to.equal(1)
            expect(cbParams.newProps).to.have.property('name', 'Mood')
            // TODO improve this test case
            // to include changing the input fields before submitting
            expect(cbParams.newProps).to.have.property('minValue', 1)
        })

        it('sends an "reorder metrics" action', () => {
            let upButton = component.find('button.moveUp-button')
            upButton.simulate('click')
            expect(cbAction).to.equal('reorder metrics')
            expect(cbParams).to.have.property('id').and.to.equal(1)
            expect(cbParams).to.have.property('direction').and.to.equal('up')
        })

        it('sends a "delete metric" action', () => {
            let deleteButton = component.find('button.delete-button')
            deleteButton.simulate('click')
            expect(cbAction).to.equal('delete metric')
            expect(cbParams).to.have.property('id').and.to.equal(1)
        })

        it('sends a "start editing" action', () => {
            let cbAction, cbParams
            let callback = (action, params) => {
                cbAction = action
                cbParams = params
            }
            const component = mount(
                <MetricSettings
                    metric={SampleMetricsWithEntries[0]}
                    editing={false}
                    onAction={callback}
                />
            )
            component.simulate('click')
            expect(cbAction).to.equal('start editing')
            expect(cbParams).to.have.property('id').and.to.equal(1)
        })

        describe('"update form element" action', () => {
            let component, cbAction, cbParams
            const callback = (action, params) => {
                cbAction = action
                cbParams = params
            }
            beforeEach(() => {
                cbAction = null
                cbParams = null
                component = mount(
                    <MetricSettings metric={SampleMetricsWithEntries[0]}
                    editing={true} onAction={callback} />
                )
            })
            it('updates the name field', () => {
                component.find('.name-field > input').simulate('change')
                expect(cbAction).to.equal('update form element')
                expect(cbParams).to.have.property('formId')
                    .and.to.equal('metric-settings-form-1')
                expect(cbParams).to.have.property('name')
                    .and.to.equal('name')
            })
            it('updates the type field', () => {
                component.find('.type-field > select').simulate('change')
                expect(cbAction).to.equal('update form element')
                expect(cbParams).to.have.property('formId')
                    .and.to.equal('metric-settings-form-1')
                expect(cbParams).to.have.property('name')
                    .and.to.equal('type')
            })
            it('updates the minValue field', () => {
                component.find('.minValue-field > input').simulate('change')
                expect(cbAction).to.equal('update form element')
                expect(cbParams).to.have.property('formId')
                    .and.to.equal('metric-settings-form-1')
                expect(cbParams).to.have.property('name')
                    .and.to.equal('minValue')
            })
            it('updates the maxValue field', () => {
                component.find('.maxValue-field > input').simulate('change')
                expect(cbAction).to.equal('update form element')
                expect(cbParams).to.have.property('formId')
                    .and.to.equal('metric-settings-form-1')
                expect(cbParams).to.have.property('name')
                    .and.to.equal('maxValue')
            })
        })
    })
})

