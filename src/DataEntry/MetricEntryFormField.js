import React, {Component} from 'react';
import {Form, Input, Button} from 'semantic-ui-react';

class MetricEntryFormField extends Component {
  handleSubmit(e, formData) {
    e.preventDefault();
    this.props.onAction('log metric', {
      id: this.props.metric.id,
      rating: formData.rating,
    });
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit.bind(this)}
        className='metric-entry-text-form' >
        <Input name='rating' />
        <Button type='submit'>Submit</Button>
      </Form>
    );
  }
}

MetricEntryFormField.propTypes = {
  metric: React.PropTypes.object.isRequired,
  onAction: React.PropTypes.func.isRequired,
};

export default MetricEntryFormField;
