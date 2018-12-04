import React, {Component} from 'react';

const InfoBar = ({match}) => {
  return(
  <div className='sidebar'>
    <h2>Earthquake Information</h2>
    <span>{match.params.id}</span>
  </div>
)
}

export default InfoBar
