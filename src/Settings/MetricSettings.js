import React  from 'react'
import {Input, Segment, Dropdown, Button, Form} from 'semantic-ui-react'
import './MetricSettings.css'
import ColorGroupsSettings from './ColorGroupsSettings'

/**
 * Settings panel for a single metric, e.g. "Mood" or "Burns depression score".
 * This component displays form fields for all properties of the given metric.
 * By default, the form fields are disabled.
 * This can be changed by passing the prop editing=true.
 * Clicking the component should activate edit-mode.
 */
const MetricSettings = ({metric, editing, onAction}) => {
  const formId = 'metric-settings-form-' + metric.id

  const handleClickToEdit = (event) => {
    if (!editing) {
      event.preventDefault()
      onAction('start editing', {id: metric.id})
    }
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    onAction('update metric', {
      id: metric.id,
      newProps: metric
    })
  }

  const handleChange = (event) => {
    onAction('update form element', {
      formId: formId,
      name: event.target.name,
      value: event.target.value
    })
  }

  return (
    <Segment className='MetricSettings' onClick={handleClickToEdit}>
      <Form
        action='' onSubmit={handleFormSubmit}
        className='metric-settings-form'
        id={formId}>
        <label htmlFor='name'>Name</label>
        <Input  type='text' disabled={!editing}
          name='name' className='name-field'
          value={metric.name} onChange={handleChange}/>
        <br/>

        <label htmlFor='type'>Type</label>
        <Dropdown selection  name='type'
          className='type-field' placeholder='Choose a type'
          disabled={!editing}
          options={[{text: 'int',  value: 1}]}
          onChange={handleChange}/>
        <br />

        <label htmlFor='minValue'>Range</label>
        <Input  type='text' name='minValue'
          value={metric.minValue} disabled={!editing}
          className='minValue-field'
          onChange={handleChange}/>
        –
        <Input  type='text' name='maxValue'
          value={metric.maxValue} disabled={!editing}
          className='maxValue-field'
          onChange={handleChange}/>
        <br/>

        <ColorGroupsSettings onAction={onAction}
          colorGroups={metric.colorGroups}
          formId={formId}
          editing={editing}/>
        {editing ? (
          <div>
            <Button size='small' type='submit' className='save-button'>
              Save
            </Button>
            <Button size='small' type='button' className='cancel-button'
              onClick={() => onAction('stop editing')}>
              Cancel
            </Button>
            <Button size='small' type='button' className='delete-button'
              onClick={() => onAction('delete metric', {
                id: metric.id
              })}>
              Delete
            </Button>
            <Button size='small' type='button' className='moveUp-button'
              onClick={() => onAction('reorder metrics', {
                id: metric.id,
                direction: 'up'
              })}>
              ▲
            </Button>
            <Button size='small' type='button' className='moveDown-button'
              onClick={() => onAction('reorder metrics', {
                id: metric.id,
                direction: 'down'
              })}>
              ▼
            </Button>
          </div>
        ) : (
          <div>
            <Button size='small' type='button' className='edit-metric-button'
              onClick={() => onAction('start editing', {
                id: metric.id
              })}>
              Edit
            </Button>
          </div>
        )}
      </Form>
    </Segment>
  )
}

MetricSettings.propTypes = {
  /**
   * A tracking metric must be provided.
   */
    metric: React.PropTypes.object.isRequired,

  /**
   * Setting this to true will enable the form fields
   * for manipulation by the user.
   * default value: false.
   */
    editing: React.PropTypes.bool,

  /**
   * Send action to parent.
   */
    onAction: React.PropTypes.func.isRequired
}

  export default MetricSettings

