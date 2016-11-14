import React from 'react'
import MetricSettings from './MetricSettings'
import {Button} from 'semantic-ui-react'

/**
 * Container for the settings UI elements.
 * The primary purpose of the settings is
 * to add, modify, and delete tracked metrics.
 */
const Settings = ({metrics, editing, onAction}) => {
  return (
    <div className='ui settings'>
      {metrics.map(metric => (editing && editing.id === metric.id ? (
        <MetricSettings
          key={metric.id}
          metric={editing}
          editing={true}
          onAction={onAction}/>
      ) : (
        <MetricSettings
          key={metric.id}
          metric={metric}
          editing={false}
          onAction={onAction}/>
      )))}
      <Button
        onClick={() => onAction('add metric')} 
        id='add-metric-button' disabled={!!editing}>
        Add metric
      </Button>
    </div>
  )
}


Settings.propTypes = {
  metrics: React.PropTypes.array.isRequired,
  editing: React.PropTypes.object,
  onAction: React.PropTypes.func.isRequired
}

export default Settings
