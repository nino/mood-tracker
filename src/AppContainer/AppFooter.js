import React, {Component} from 'react'
import {Button} from 'semantic-ui-react'

class Footer extends Component {
  propTypes: {
    onAction: React.PropTypes.func,
    loggedIn: React.PropTypes.bool
  }

  render() {
    let logoutButton
    if (this.props.loggedIn && this.props.onAction) {
      logoutButton = (
        <Button
          basic
          onClick={() => this.props.onAction('logoutClicked')}
          floated='right'>
          Log out
        </Button>
      )
    }

    return (
      <div className='ui container'>
      <small>© 2016, Nino Annighöfer</small>
      {logoutButton}
      </div>
    )
  }
}

export default Footer
