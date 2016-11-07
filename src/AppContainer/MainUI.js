import React, {Component} from 'react'
import {Divider} from 'semantic-ui-react'
import DataDisplayContainer from '../DataDisplay/DataDisplayContainer'
import DataEntryContainer from '../DataEntry/DataEntryContainer'
import Settings from '../Settings/Settings'
import './MainUI.css'

class MainUI extends Component {
    propTypes: {
        metrics: React.PropTypes.array.isRequired,
        onAction: React.PropTypes.func.isRequired
    }

    render() {
        return (
            <div className='ui container'>
                <DataEntryContainer
                    onAction={this.props.onAction}
                    metrics={this.props.metrics}
                />
                <Divider />
                <DataDisplayContainer
                    metrics={this.props.metrics}
                />
                <Divider />
                <Settings
                    onAction={this.props.onAction}
                />
            </div>
        )
    }
}

export default MainUI
