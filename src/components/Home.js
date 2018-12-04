import React, {Component} from 'react';
import axios from 'axios';
import ReactTooltip from "react-tooltip";
import {
  BrowserRouter,
  Route,
  Redirect
} from 'react-router-dom';

import Map from './Map';
import MenuBar from './MenuBar';
import LoadingWindow from './LoadingWindow';
import InfoBar from './InfoBar';

class Home extends Component {
  state = {
    map: '',
    earth: {},
    quakes: [],
    searchArea: [],
    loading: false,
    searchCount: 0,
    focused: '',
    done: false
  }

  componentDidMount () {

  }

  sortData = () => {
    this.setState({
      quakes: this.state.earth.features.map(quake => {
        let fullDate = new Date(quake.properties.time)
        return({
          id: quake.id,
          coordinates: [quake.geometry.coordinates[0], quake.geometry.coordinates[1]],
          magnitude: quake.properties.mag,
          place: quake.properties.place,
          date: fullDate.getDate(),
          month: fullDate.getMonth(),
          year: fullDate.getFullYear(),
          depth: quake.geometry.coordinates[2],
          hour: fullDate.getHours(),
          minute: fullDate.getMinutes(),
          felt: quake.properties.felt
        })
      })
    })
  }

  getSearchCount = (searchTerms, afterSearch) => {
    this.setState({
      done: false
    })
    let fullRequest = `https://earthquake.usgs.gov/fdsnws/event/1/count?`;
      axios.get(fullRequest + searchTerms + afterSearch)
      .then(response => {
        this.setState({
          searchCount: response.data
        })
      })
      .then(() =>{
        this.setState({
          done: true
        })
      })
  }

  getQuakeData = (searchTerms,afterSearch) => {
    let fullRequest = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&limit=100`;
    console.log(fullRequest + searchTerms + afterSearch)
      axios.get(fullRequest + searchTerms + afterSearch)
      .then(response => {
        console.log(response.data)
        this.setState({
          earth: response.data
        })
      })
      .then(() => {
        this.sortData()
      })
      .then(() =>{
        this.setState({
          loading: false,
          searchCount: 0,
          done: false
        })
        console.log('search complete')
        setTimeout(() => {
          ReactTooltip.rebuild()
        }, 1000)
      })
  }

  createLimitedSearchString = (maxMag, minMag, after, before, lat, lng, rad) => {
    let limitSearchTerms = ``;
    if (maxMag) {
      limitSearchTerms += `&maxmagnitude=${maxMag}`
    }
    if (minMag) {
      limitSearchTerms += `&minmagnitude=${minMag}`
    }
    if (before) {
      limitSearchTerms += `&endtime=${before}`
    }
    if (lat) {
      limitSearchTerms += `&latitude=${lat}`
    }
    if (lng) {
      limitSearchTerms += `&longitude=${lng}`
    }
    if (rad) {
      limitSearchTerms += `&maxradiuskm=${rad}`
    }
    return(limitSearchTerms)
  }

  search = (maxMag, minMag, after, before, lat, lng, rad) => {
    console.log('start search')
    this.setState({
      loading: true
    })
    let limitSearchTerms = this.createLimitedSearchString(maxMag, minMag, after, before, lat, lng, rad);
    let hitLimit = false;
    let afterNow = Date.now();
    let afterLimit = Date.UTC(1900,0,1)
    if (after) {
      afterLimit = Date.UTC(after.substr(0,4),before.substr(5,7)-1,before.substr(8,10))
    }
    if (before) {
      afterNow = Date.UTC(before.substr(0,4),before.substr(5,7)-1,before.substr(8,10));
    }
    afterNow -= 1000 * 60 * 60 * 24 * 30;
    if (afterNow < afterLimit) {
      afterNow = afterLimit;
      hitLimit = true;
    }
    console.log('searchafter'+new Date(afterNow))
    let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
    this.getSearchCount(limitSearchTerms,afterSearch);
    this.continueExec(afterNow,afterLimit,hitLimit,limitSearchTerms)
  }

  continueExec = (afterNow, afterLimit, hitLimit, limitSearchTerms) => {
  if (!this.state.done) {
      setTimeout(() => {this.continueExec(afterNow, afterLimit, hitLimit, limitSearchTerms)}, 100);
  } else {
    console.log('length  ' + this.state.searchCount)
    if (this.state.searchCount >= 100 || hitLimit) {
      let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
      this.getQuakeData(limitSearchTerms,afterSearch)
    } else {
      afterNow -= 1000 * 60 * 60 * 24 * 30;
      if (afterNow < afterLimit) {
        afterNow = afterLimit;
        hitLimit = true;
      }
      console.log('searchafter  '+new Date(afterNow))
      let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
      this.getSearchCount(limitSearchTerms,afterSearch);
      console.log(this.state.done)
      this.continueExec(afterNow, afterLimit, hitLimit, limitSearchTerms);
    }
  }
}

  getOneQuake = id => {
    this.setState({
      loading: true
    })
    console.log('finding one quake')
    axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventid=${id}`)
    .then(response => {
      this.setState({
        earth: {features: [response.data]}
      })
    })
    .then(() => {
      this.sortData()
    })
    .then(() => {
      console.log(this.state.quakes)
      this.setState({
        loading: false,
        focused: this.state.quakes[0]
      })
    })
  }

  removeFocused = () => {
    this.setState({
      focused: ''
    })
  }

  setFocused = marker => {
    this.setState({
      focused: marker
    })
  }

  render() {
    let loadWindow = (<LoadingWindow>
      <div className='loading'> Searching Database </div>
    </LoadingWindow>)
    return(
      <div className='app-container'>
        {this.state.loading? loadWindow : <div></div>}
        <Map
          focused={this.state.focused}
          markers={this.state.quakes}
          searchArea={this.state.searchArea}
          setFocused={this.setFocused}
        />
        <Route exact
          path='/home'
          render={routeProps => (
            <MenuBar
              {...routeProps}
              search={this.search}
              searchCount={this.state.searchCount}
            />
          )}
        />
        <Route
          path='/home/:id'
          render={routeProps => {
            console.log(routeProps)
            if (!this.state.quakes.length && !this.state.loading) {
              this.getOneQuake(routeProps.match.params.id)
            }
            return (
              <InfoBar
                {...routeProps}
                quakes={this.state.quakes}
                removeFocused={this.removeFocused}
              />
            )
          }}
        />
        <ReactTooltip multiline={true}/>
      </div>
    )
  }
}


export default Home
