import React, {Component} from 'react';
import {
  BrowserRouter,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';


import Home from './Home'
import Header from './Header'
import About from './About'
import NotFound from './NotFound'

class App extends Component {

  render () {
    return (
      <BrowserRouter>
        <div id='app-container'>
          <Header/>
          <Switch>
            <Route exact path='/' render={() => <Redirect to='/home' />} />
            <Route path='/home' component={Home} />
            <Route path='/about' component={About} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
