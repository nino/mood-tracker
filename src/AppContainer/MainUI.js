import React from 'react'
import {Divider} from 'semantic-ui-react'
import DataDisplayContainer from '../DataDisplay/DataDisplayContainer'
import DataEntryContainer from '../DataEntry/DataEntryContainer'
import Settings from '../Settings/Settings'
import './MainUI.css'

const MainUI = ({appState, onAction}) => (
  <div className='ui container'>
    <DataEntryContainer
      onAction={onAction}
      metrics={appState.metrics}/>
    <Divider />
    <DataDisplayContainer
      metrics={appState.metrics}/>
    <Divider />
    <Settings
      onAction={onAction}
      metrics={appState.metrics}
      editing={appState.editing}/>
  </div>
)


MainUI.propTypes = {
  appState: React.PropTypes.object.isRequired,
  onAction: React.PropTypes.func.isRequired
}

export default MainUI
