import React, { Component } from 'react'
import './App.css'
import {Container, Button, Modal} from 'semantic-ui-react'
import DropboxController from '../controllers/DropboxController'
import MainUI from './MainUI'
import AppHeader from './AppHeader'
import AppFooter from './AppFooter'
import SampleData from '../../test/SampleMetricsWithoutEntries'
import Actions from '../controllers/actions'

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
            this.setState({'error': 'data file not found'})
        })
    }

    render() {
        let child
        if (DropboxController.isAuthenticated() && this.state.data) {
            child = (
                <MainUI
                    onAction={Actions.receiveAction.bind(this)}
                    metrics={this.state.data}
                    appState={this.state}
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
            <AppFooter onAction={Actions.receiveAction.bind(this)} loggedIn={DropboxController.isAuthenticated()} />
            </div>
        )
    }

    return (
      <div id='app-root'>
        <AppHeader />
        {this.state.modal ? (
            <Modal
                open={true}
                closeOnRootNodeClick={false}>
                <Modal.Header>{this.state.modal.title}</Modal.Header>
                <Modal.Content>{this.state.modal.message}</Modal.Content>
                <Modal.Actions>
                    <Button
                        onClick={Actions.receiveAction.bind(this, 'confirm modal')}>
                        {this.state.modal.buttons.find(b=>b.purpose==='confirm')
                            .label}
                    </Button>
                    <Button
                        onClick={Actions.receiveAction.bind(this, 'cancel modal')}>
                        {this.state.modal.buttons.find(b=>b.purpose==='cancel')
                            .label}
                    </Button>
                </Modal.Actions>
            </Modal>
        ) : (<div />)}
        {child}
        <AppFooter
          onAction={Actions.receiveAction.bind(this)}
          loggedIn={DropboxController.isAuthenticated()} />
      </div>
    )
  }
}

export default App
