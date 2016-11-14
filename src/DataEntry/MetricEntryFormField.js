import React, {Component} from 'react'
import {Form, Input, Button} from 'semantic-ui-react'

class MetricEntryFormField extends Component {
    propTypes: {
        metric: React.PropTypes.object.isRequired,
        onAction: React.PropTypes.func.isRequired
    }

    handleSubmit(e, formData) {
        e.preventDefault()
        this.props.onAction('log metric', {
            id: this.props.metric.id,
            rating: formData.rating
        })
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit.bind(this)}
                className='metric-entry-text-form'>
                <Input name='rating' />
                <Button type='submit'>Submit</Button>
            </Form>
        )
    }
}

export default MetricEntryFormField
