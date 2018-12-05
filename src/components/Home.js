import React, {Component} from 'react';
import axios from 'axios';
import ReactTooltip from "react-tooltip";
import {
  Route
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
    done: false,
    searched: false,
    noResults: false,
    queryString: '',
    center:[0,0],
    zoom: 1.9
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
      .then(() => {
        if (this.state.searchCount === 0) {
          this.setState({
            noResults: true
          })
        } else {
          this.setState({
            noResults: false
          })
        }
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
      loading: true,
      searched: true
    })
    let limitSearchTerms = this.createLimitedSearchString(maxMag, minMag, after, before, lat, lng, rad);
    let hitLimit = false;
    let afterNow = Date.now();
    let afterLimit = Date.UTC(1900,0,1)
    let mag = 1;
    if (after) {
      afterLimit = Date.UTC(after.substr(6,10),parseInt(after.substr(3,5),10)-1,after.substr(0,2));
    }
    if (before) {
      afterNow = Date.UTC(before.substr(6,10),parseInt(before.substr(3,5),10)-1,before.substr(0,2));
    }
    console.log('rad '+typeof rad)
    console.log('mag '+mag)
    afterNow -= 1000 * 60 * 60 * 24 * 30;
    if (afterNow < afterLimit) {
      afterNow = afterLimit;
      hitLimit = true;
    }
    console.log('search'+afterNow) // --------------------------------------------
    let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
    this.getSearchCount(limitSearchTerms,afterSearch);
    this.continueExec(afterNow,afterLimit,hitLimit,limitSearchTerms, mag)
  }

  continueExec = (afterNow, afterLimit, hitLimit, limitSearchTerms, mag) => {
  if (!this.state.done) {
      setTimeout(() => {this.continueExec(afterNow, afterLimit, hitLimit, limitSearchTerms, mag)}, 100);
  } else {
    console.log('length  ' + this.state.searchCount)
    if (this.state.searchCount >= 100 || hitLimit) {
      console.log(new Date(afterNow).toISOString().substr(0,10))
      let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
      this.getQuakeData(limitSearchTerms,afterSearch)
    } else {
      if (this.state.searchCount) {
        mag *= 100/this.state.searchCount
      } else {
        mag *= 100
      }
      afterNow -= 1000 * 60 * 60 * 24 * 10 * mag;
      if (afterNow < afterLimit) {
        afterNow = afterLimit;
        hitLimit = true;
      }
      console.log('searchafter  '+new Date(afterNow))
      let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
      this.getSearchCount(limitSearchTerms,afterSearch);
      console.log(this.state.done)
      this.continueExec(afterNow, afterLimit, hitLimit, limitSearchTerms, mag);
    }
  }
}

saveSearch = (queryString) => {
  this.setState({
    queryString: queryString
  })
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

  handleMouseWheel = () => {
    let map = document.getElementById('map')
    map.addEventListener('wheel', (e) => {
      e.preventDefault()
      if (e.wheelDelta > 0) {
        this.handleZoomIn()
      } else {
        this.handleZoomOut()
      }
    }, false)
    setTimeout(() => {
      ReactTooltip.rebuild()
    }, 1000)
  }

  handleZoomOut = () => {
    this.setState((prevState) => ({
      zoom: prevState.zoom / 1.1,
    }))
    if (this.state.zoom < 1.5) {
      this.setState({
        zoom: 1.5,
      })
    }
  }

  handleZoomIn = () => {
    this.setState((prevState) => ({
      zoom: prevState.zoom * 1.1,
    }))
    if (this.state.zoom > 50) {
      this.setState({
        zoom: 50,
      })
    }
  }

  markerZoomAndPan = (marker) => {
    if (this.state.zoom < 15) {
      this.setState({
        zoom: 15
      })
    }
    this.setState({
      center: marker.coordinates
    })
  }

  resetMap = () => {
    this.setState({
      zoom: 1.9,
      center: [0, 0]
    })
  }

  render() {
    let loadWindow = (<LoadingWindow>
      <div className='loading'> <i class="fas fa-search-location"></i> Searching Database </div>
    </LoadingWindow>)
    return(
      <div className='home'>
        {this.state.loading? loadWindow : <div></div>}
        <Map
          focused={this.state.focused}
          markers={this.state.quakes}
          searchArea={this.state.searchArea}
          setFocused={this.setFocused}
          noResults={this.state.noResults}
          saveSearch={this.saveSearch}
          center={this.state.center}
          zoom={this.state.zoom}
          handleZoomIn={this.handleZoomIn}
          handleZoomOut={this.handleZoomOut}
          handleMouseWheel={this.handleMouseWheel}
          markerZoomAndPan={this.markerZoomAndPan}
        />
        <Route exact
          path='/home'
          render={routeProps => (
            <MenuBar
              {...routeProps}
              search={this.search}
              searchCount={this.state.searchCount}
              searched={this.state.searched}
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
                queryString={this.state.queryString}
                resetMap={this.resetMap}
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
