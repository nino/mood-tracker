import React from 'react';
import './ActivityIndicator.css';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6

const ActivityIndicator = ({activities}) => {
  const activitiesArray = activities || [];
  const items = Object.assign([], activitiesArray).reverse().map(activity => (
    <div className='activity' key={activity.id}>
      {activity.name}
    </div>
  ));

  return (
    <div id='activities'>
      <ReactCSSTransitionGroup
        transitionName='displayActivities'
        transitionEnterTimeout={200}
        transitionLeaveTimeout={200}>
        {items}
      </ReactCSSTransitionGroup>
    </div>
  );
}

export default ActivityIndicator;
