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
    searchCenter: '',
    loading: false,
    searchCount: 0,
    focused: '',
    done: false,
    searched: false,
    noResults: false,
    queryString: '',
    center:[0,0],
    zoom: 1.9,
    error: false,
    pageNum: 1,
    last: false
  }

  // extract data from raw JSON received from API
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

  // Request number of results found with current search terms
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
      .catch((error) => {
        this.setState({
          loading: false,
          error: true
        })
      })
  }

  // Request JSON data based on current search terms
  getQuakeData = (searchTerms,afterSearch) => {
    let fullRequest = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&limit=100`;
    console.log(fullRequest + searchTerms + afterSearch)
      axios.get(fullRequest + searchTerms + afterSearch)
      .then(response => {
        this.setState({
          earth: response.data
        })
      })
      .then(() => {
        this.sortData();
      })
      .then(() =>{
        this.setState({
          loading: false,
          searchCount: 0,
          done: false
        })
        setTimeout(() => {
          ReactTooltip.rebuild()
        }, 1000)
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error: true,
          done: false,
          searchCount: 0
        })
      })
  }

  // Create the query string without starttime parameter to send to API
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

  // Function called when form is submitted, finds 100 datum that match the search criteria then sorts the data for display on the map
  search = (maxMag, minMag, after, before, lat, lng, rad) => {
    this.setState({
      quakes: [],
      loading: true,
      searched: true
    })
    if (rad) {
      this.setState({
        searchCenter: {coordinates: [lng,lat]}
      })
    } else {
      this.setState({
        searchCenter: ''
      })
    }
    let limitSearchTerms = this.createLimitedSearchString(maxMag, minMag, after, before, lat, lng, rad);
    let hitLimit = false;
    let afterNow = Date.now();
    let afterLimit = Date.UTC(1900,0,1)
    let mag = 1;
    if (after) {
      console.log('after'+after)
      afterLimit = Date.UTC(parseInt(after.substr(0,4),10),parseInt(after.substr(5,7),10)-1,parseInt(after.substr(8,10),10));
      console.log('after' +new Date(afterLimit))
    }
    if (before) {
      console.log('before'+before)
      afterNow = Date.UTC(parseInt(before.substr(0,4),10),parseInt(before.substr(5,7),10)-1,parseInt(before.substr(8,10),10));
      console.log('before' +new Date(afterNow))
    }
    afterNow -= 1000 * 60 * 60 * 24 * 30;
    if (afterNow < afterLimit) {
      afterNow = afterLimit;
      hitLimit = true;
    }
    let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
    this.getSearchCount(limitSearchTerms,afterSearch);
    this.searchFor100(afterNow,afterLimit,hitLimit,limitSearchTerms, mag)
  }

  //  continually searchs API furthur back in time until 100 results are found or it hits the 'after' limit
  searchFor100 = (afterNow, afterLimit, hitLimit, limitSearchTerms, mag) => {
  if (!this.state.done) {
      setTimeout(() => {this.searchFor100(afterNow, afterLimit, hitLimit, limitSearchTerms, mag)}, 100);
  } else {
    console.log('length  ' + this.state.searchCount)
    if (this.state.searchCount >= 100 || hitLimit) {
      if (this.state.searchCount === 0) {
        this.setState({
          noResults: true,
          searched: false,
          loading: false,
          done:false
        })
      } else {
        this.setState({
          noResults: false,
          done:false
        })
        console.log('start time '+ new Date(afterNow).toISOString().substr(0,10))
        let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
        this.getQuakeData(limitSearchTerms,afterSearch)
      }
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
      let afterSearch = `&starttime=${new Date(afterNow).toISOString().substr(0,10)}`
      this.getSearchCount(limitSearchTerms,afterSearch);
      this.searchFor100(afterNow, afterLimit, hitLimit, limitSearchTerms, mag);
      }
    }
  }

  // save the queryString for retrieval later
  saveSearch = (queryString) => {
    this.setState({
      queryString: queryString
    })
  }

  // queries the API for one result based on the ID
  getOneQuake = id => {
    this.setState({
      loading: true
    })
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
      this.setState({
        loading: false,
        focused: this.state.quakes[0]
      })
    })
    .catch((error) => {
      this.setState({
        loading: false,
        error: true
      })
      window.alert(error)
    })
  }

  // move to next page of results
  pageUp = () => {

  }

  // move to previous page of results
  pageDown = () => {

  }

  // ------ These functions handle the map functionality zoom, pan, click -----
  // Removes the focused state for when going back to search bar
  removeFocused = () => {
    this.setState({
      focused: ''
    })
  }

  // Sets the focused state for when a marker is clicked
  setFocused = marker => {
    this.setState({
      focused: marker
    })
  }

  // Sets up the map to zoom in and out based on mouse wheel movement
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

  // Zooms the map out up to a limit for when minus button clicked
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

  // Zooms the map in up to a limit for when plus button clicked
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

  // Zooms in to a marker for when clicking on a marker
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

  // resets the zoom and center states for when going back to search bar
  resetMap = () => {
    this.setState({
      zoom: 1.9,
      center: [0, 0]
    })
  }

  // sets error state to false for when error window is closed
  handleError = () => {
    this.setState({
      error: false
    })
  }

  render() {
    let loadWindow = (
      <LoadingWindow>
        <div className='loading'> <i className="fas fa-search-location"></i> Searching Database </div>
      </LoadingWindow>
    )
    let errorPopUp = (
      <LoadingWindow>
        <div className='loading'><div className='error-popup'><div>
          <span>Error</span><br/>
          <i className="fas fa-exclamation-triangle"></i><br/>
          <span>we couldnt complete this request please try again later</span><br/>
          <button onClick={this.handleError}>Back</button>
        </div></div></div>
      </LoadingWindow>
    )
    return(
      <div className='home'>
        {this.state.loading? loadWindow : ''}
        {this.state.error? errorPopUp : ''}
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
          searchCenter={this.state.searchCenter}
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
