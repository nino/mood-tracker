import React from 'react'
import ActivityIndicator from './ActivityIndicator'
import {shallow, mount} from 'enzyme'
import {expect} from 'chai'

describe('ActivityIndicator', () => {
	it('mounts without crashing', () => {
		const component1 = mount(<ActivityIndicator activities={null} />)
		const component2 = mount(
			<ActivityIndicator activities={[
				{ name: 'Syncing data', id: 1 },
				{ name: 'Syncing more data', id: 2 }
			]} />
		)

		expect(component1).to.be.ok
		expect(component2).to.be.ok
	})

	it('renders a div with id "no-activities" if no activities are present', () => {
		const component = shallow(<ActivityIndicator />)
		expect(component.find('#no-activities')).to.have.length(1)
	})

	it('renders all activities if activities are present', () => {
		const component = shallow(<ActivityIndicator activities={[
			{name: 'syncing data', id: 1},
			{name: 'another thing', id: 2}
		]} /> )
		expect(component.find('another thing')).to.have.length(1)
	})

})
