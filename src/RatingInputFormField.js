import React, {Component} from 'react'
import {Form, Input, Button} from 'semantic-ui-react'

class RatingInputFormField extends Component {
    handleSubmit(e, formData) {
        e.preventDefault()
        this.props.onAction(this, 'log metric', {
            name: this.props.metric.name,
            rating: formData.rating
        })
    }

    render() {
        return (
            <Form size='mini' onSubmit={this.handleSubmit.bind(this)}>
                <Input size='mini' name='rating' />
                <Button basic compact size='mini' type='submit'>Submit</Button>
            </Form>
        )
    }
}

RatingInputFormField.propTypes = {
    metric: React.PropTypes.object.isRequired,
    onAction: React.PropTypes.func.isRequired
}

export default RatingInputFormField
