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
    focused: ''
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
          year: fullDate.getFullYear()
        })
      })
    })
  }

  getSearchCount = (searchTerms, startYear, endYear) => {
    let countRequest = `https://earthquake.usgs.gov/fdsnws/event/1/count?`
    let count = 0;
    for (let i=startYear; i<endYear; i+=10) {
      axios.get(countRequest + searchTerms + `&starttime${i}-01-01&endtime${i+10}-01-01`)
      .then(response => {
        console.log(i)
        count += response.data
        this.setState({
          searchCount: count
        })
        console.log(this.state.searchCount)
      })
    }
  }

  getQuakeData = (searchTerms,afterSearch) => {
    let fullRequest = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&limit=100`;
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
          loading: false
        })
        console.log('search complete')
      })
  }

  createSearchString = (maxMag, minMag, after, before, lat, lng, rad) => {
    let searchTerms = ``;
    if (maxMag) {
      searchTerms += `&maxmagnitude=${maxMag}`
    }
    if (minMag) {
      searchTerms += `&minmagnitude=${minMag}`
    }
    if (before) {
      searchTerms += `&endtime=${before}`
    }
    if (lat) {
      searchTerms += `&latitude=${lat}`
    }
    if (lng) {
      searchTerms += `&longitude=${lng}`
    }
    if (rad) {
      searchTerms += `&maxradius=${rad}`
    }
    if (after) {
      searchTerms += `&starttime=${after}`
    } else {
      searchTerms += `&starttime=1900-01-01`
    }
    return(searchTerms)
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
      limitSearchTerms += `&maxradius=${rad}`
    }
    return(limitSearchTerms)
  }

  search = (maxMag, minMag, after, before, lat, lng, rad) => {
    console.log('start search')
    this.setState({
      loading: true
    })
    let limitSearchTerms = this.createLimitedSearchString(maxMag, minMag, after, before, lat, lng, rad);
    let searchTerms = this.createSearchString(maxMag, minMag, after, before, lat, lng, rad);
    let hitLimit = false;
    let afterNow = Date.now();
    if (before) {
      afterNow = Date.UTC(before.substr(0,4),before.substr(5,7),before.substr(8,10));
    }
      afterNow -= 1000 * 60 * 60 * 24;
      console.log(afterNow)

      if (afterNow < Date.UTC(after.substr(0,4),after.substr(5,7),after.substr(8,10))) {
        afterNow = new Date(after);
        hitLimit = true;
      } else {
        afterNow = new Date(afterNow)
      }
      console.log(afterNow)
      let afterSearch = `&starttime=${afterNow.toISOString().substr(0,10)}`

      this.getQuakeData(limitSearchTerms,afterSearch);
      console.log('done')
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
        focused: this.state.quakes
      })
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
          focused={this.state.focused[0]}
          markers={this.state.quakes}
          searchArea={this.state.searchArea}
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
              />
            )
          }}
        />
      </div>
    )
  }
}


export default Home
