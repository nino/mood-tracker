import React, { Component } from 'react'
import './App.css'
import {Container, Button, Loader} from 'semantic-ui-react'
import DropboxController from './DropboxController'
import MainUI from './MainUI'

function receiveAction(sender, action, params) {
    switch(action) {
        case 'logoutClicked':
            DropboxController.logout()
            this.forceUpdate()
            break
        case 'log metric':
            logMetricAction.bind(this)(params.name, params.rating)
            break
        default:
            console.log('Nothing happens')
    }
}

function logMetricAction(name, rating) {
    console.log('logging metric ' + name + ': ' + rating)
    let newEntry = {
        date: (new Date()).toJSON(),
        value: rating
    }
    let metricIndex = this.state.data.findIndex(
        metric => metric.name === name
    )
    let newData = []
    Object.assign(newData, this.state.data)
    newData[metricIndex].entries.push(newEntry)
    this.setState({data: newData})
    DropboxController.writeFile('data.json', JSON.stringify(this.state.data, null, 2), (response) => {
        console.log('data written')
    })
}

function loadData(callback) {
    DropboxController.getFileContents('data.json', (contents) => {
        let data = JSON.parse(contents)
        callback(data)
    })
}

class App extends Component {
    constructor(props) {
        super(props)
        this.state = { }
    }

    componentDidMount() {
        loadData(data => {
            this.setState({data})
        })
    }

    render() {
        if (DropboxController.isAuthenticated() && this.state.data) {
            return (
                <MainUI
                    onAction={receiveAction.bind(this)}
                    data={this.state.data}
                />
            )
        }
        else if (DropboxController.isAuthenticated()) {
            return (
                <Container>
                <h2>Mood tracking app</h2>
                <Loader content='Loading' />
                </Container>
            )
        }
        else {
            return (
                <Container>
                <h2>Mood tracker</h2>
                <Button onClick={DropboxController.loginClicked.bind(this)}>Log into Dropbox</Button>
                </Container>
            )
        }
    }
}

export default App
