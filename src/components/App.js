import React, {Component} from 'react';
import {
  BrowserRouter,
  Route,
  Redirect
} from 'react-router-dom';
import ReactTooltip from "react-tooltip";

import Home from './Home'

class App extends Component {

  render () {
    return (
      <BrowserRouter>
        <div id='outside'>
          <Route exact path='/' render={() => <Redirect to='/home' />} />
          <Route path='/home' component={Home} />
          <ReactTooltip multiline={true}/>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
