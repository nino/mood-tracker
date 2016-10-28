import React, {Component} from 'react'
import AppHeader from './AppHeader'
import Footer from './Footer'
import {Divider} from 'semantic-ui-react'
import DataDisplay from './DataDisplay'
import DataEntryForm from './DataEntryForm'
import Settings from './Settings'
import './MainUI.css'

class MainUI extends Component {
    propTypes: {
        data: React.PropTypes.array.isRequired,
        onAction: React.PropTypes.func.isRequired
    }

    render() {
        return (
            <div id='app-root'>
            <AppHeader />
            <div className='ui container'>
            <DataEntryForm
                onAction={this.props.onAction}
                metrics={this.props.data}
            />
            <Divider />
            <DataDisplay
                metrics={this.props.data}
            />
            <Divider />
            <Settings onAction={this.props.onAction} />
            </div>
            <Footer onAction={this.props.onAction}/>
            </div>
        )
    }
}

export default MainUI
