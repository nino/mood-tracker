import React, {Component} from 'react';
import './AppHeader.css';
import {Header} from 'semantic-ui-react';

class AppHeader extends Component {
  render() {
    return (
      <div id='app-header'>
        <Header color='pink' inverted as='h3' textAlign='center'>Mood tracking app</Header>
      </div>
    );
  }
}

export default AppHeader;
