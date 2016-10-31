import React, { Component } from 'react'
import './App.css'
import {Container, Button} from 'semantic-ui-react'
import DropboxController from '../controllers/DropboxController'
import MainUI from './MainUI'
import AppHeader from './AppHeader'
import AppFooter from './AppFooter'
import SampleData from '../../test/SampleMetricsWithoutEntries'

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
    let date = new Date()
    date.setHours(date.getHours() - date.getTimezoneOffset() / 60)
    let newEntry = {
        date: date.toJSON(),
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

function loadData() {
    return (
        DropboxController.getFileContents('data.json').then(JSON.parse)
    )
}

class App extends Component {
    constructor(props) {
        super(props)
        this.state = { }
    }

    componentDidMount() {
        loadData().then((data) => {
            this.setState({data})
        }).catch((error) => {
            console.log('Error loading data')
            this.setState({error: 'data file not found'})
        })
    }

    render() {
        let child
        if (DropboxController.isAuthenticated() && this.state.data) {
            child = (
                <MainUI
                    onAction={receiveAction.bind(this)}
                    data={this.state.data}
                />
            )
        }
        else if (DropboxController.isAuthenticated() && !this.state.error) {
            child = (
                <Container>
                Loading ...
                </Container>
            )
        }
        else if (DropboxController.isAuthenticated() && this.state.error === 'data file not found') {
            child = (
                <Container>
                <p>Couldn't find data file</p>
                <p>
                To set up the app, create the file <code>data.json</code> 
                in <code>Dropbox/Apps/Mood-tracker</code> and paste in the
                following contents:
                </p>
                <code>
                <pre>
                {JSON.stringify(SampleData, null, 2)}
                </pre>
                </code>
                </Container>
            )
        }
        else {
            child = (
                <Container>
                <h2>Mood tracker</h2>
                <Button onClick={DropboxController.loginClicked.bind(this)}>Log into Dropbox</Button>
                </Container>
            )
        }

        return (
            <div id='app-root'>
            <AppHeader />
            {child}
            <AppFooter onAction={receiveAction.bind(this)} loggedIn={DropboxController.isAuthenticated()} />
            </div>
        )
    }
}

export default App
