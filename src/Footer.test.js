import React from 'react'
import ReactDOM from 'react-dom'
import Footer from './Footer'
import {expect} from 'chai'
import {shallow,mount} from 'enzyme'

describe('Footer', () => {
    it('renders logout button if logged in', () => {
        let callback = () => null
        const component = mount(
            <Footer loggedIn={true} onAction={callback} />
        )
        expect(component.text()).to.include('Log out')
    })

    it('doesn\'t render a logout button if not logged in', () => {
        const component = mount(
            <Footer />
        )
        expect(component.text()).to.not.include('Log out')
    })

    it('calls the onAction function when logoutButton is clicked', () => {
        let callbackCalled = false
        let callback = (sender, action) => {
            callbackCalled = true
            expect(action).to.equal('logoutClicked')
        }
        const component = mount(
            <Footer loggedIn={true} onAction={callback} />
        )
        component.find('button').simulate('click')
        expect(callbackCalled).to.be.ok
    })
})

