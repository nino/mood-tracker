import React, {Component} from 'react'
import {Button} from 'semantic-ui-react'

class Footer extends Component {
    render() {
        return (
            <div>
            <small>© 2016, Nino Annighöfer</small>
            <Button basic compact onClick={() => this.props.onAction(this, 'logoutClicked')}>Log out</Button>
            </div>
        )
    }
}

export default Footer
