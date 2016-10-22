import React, {Component} from 'react'
import {Container, Button} from 'semantic-ui-react'
import DropboxController from './DropboxController'

function logFileContents() {
    DropboxController.getFileContents('mood.csv', logContent)
}

function writeFile() {
    DropboxController.writeFile('test.txt', 'Hello, this is a test!', (response) => {
        console.log(response)
    })
}

function logContent(arg) {
    console.log(arg)
}

class TestUI extends Component {
    render() {
        return (
            <Container>
            <strong>This is a test UI</strong><br />
            <Button onClick={logFileContents.bind(this)}>Click this button</Button><br />
            <Button onClick={writeFile.bind(this)}>Click here to write</Button>
            </Container>
        )
    }
}

export default TestUI
