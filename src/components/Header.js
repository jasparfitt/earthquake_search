import React from 'react'
import {NavLink} from 'react-router-dom'

const Header = () => {
  return (
  <div className='header'>
    <div className='header-margin margin'>
      <h1> Earthquake Finder </h1>
      <NavLink
        to='/home'
        activeClassName='selected'
      >
        <div>
          Map
        </div>
      </NavLink>
      <NavLink
        to='/about'
        activeClassName='selected'
      >
        <div>
          About
        </div>
      </NavLink>
    </div>
  </div>
)}

export default Header
