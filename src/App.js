import React, { Component } from 'react'
import './App.css'
import {Container, Button} from 'semantic-ui-react'
import DropboxController from './DropboxController'
import MainUI from './MainUI'
import AppHeader from './AppHeader'
import Footer from './Footer'

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
            if (data) {
                this.setState({data})
            }
            else {
                this.setState({error: 'data not present'})
            }
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
        else if (DropboxController.isAuthenticated() && !this.state.error) {
            return (
                <Container>
                <AppHeader />
                Loading ...
                <Footer onAction={receiveAction.bind(this)} />
                </Container>
            )
        }
        else if (DropboxController.isAuthenticated() && this.state.error === 'data not present') {
            let exampleData = [
                        {
                            "name": "Mood",
                            "type": "int",
                            "minValue": 1,
                            "maxValue": 10,
                            "colorGroups": [
                                {
                                    "minValue": 1,
                                    "maxValue": 3,
                                    "color": "red"
                                },
                                {
                                    "minValue": 4,
                                    "maxValue": 6,
                                    "color": "yellow"
                                },
                                {
                                    "minValue": 7,
                                    "maxValue": 9,
                                    "color": "green"
                                },
                                {
                                    "minValue": 10,
                                    "maxValue": 10,
                                    "color": "blue"
                                }
                            ],
                            "entries": []
                        },
                        {
                            "name": "Burns depression score",
                            "type": "int",
                            "minValue": 0,
                            "maxValue": 100,
                            "entries": []
                        }
                    ]

            return (
                <Container>
                    <p>Couldn't find data file</p>
                    <p>
                        To set up the app, create the file <code>data.json</code>
                        in <code>Dropbox/Apps/Mood-tracker</code> and paste in the
                        following contents:
                    </p>
                    <p>
                    <code>
                    {JSON.stringify(exampleData, null, 2)}
                    </code>
                    </p>
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
