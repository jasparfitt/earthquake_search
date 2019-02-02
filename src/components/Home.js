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
    searchCount: 'begin',
    focused: '',
    done: false,
    searched: false,
    noResults: false,
    queryString: '',
    center:[0,0],
    zoom: 1.6,
    error: false,
    pageNum: 1,
    last: false,
    lastSearch: {
      minMag: null,
      maxMag:null
    },
    pressedSearch: false
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
    console.log(fullRequest + searchTerms + afterSearch)
      axios.get(fullRequest + searchTerms + afterSearch)
      .then(response => {
        this.setState({
          searchCount: response.data
        })
        console.log(response.data)
      })
      .then(() =>{
        this.setState({
          done: true
        })
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error: true,
          done: true
        })
      })
  }

  // Request JSON data based on current search terms
  getQuakeData = (searchTerms,afterSearch) => {
    let fullRequest = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=100`;
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
          searchCount: 'begin',
          done: false,
          pressedSearch: false
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
          searchCount: 'begin'
        })
      })
  }

  // Create the query string without starttime parameter to send to API
  createSearchString = (maxMag, minMag, after, before, lat, lng, rad, pageNum, sortBy) => {
    let limitSearchTerms = `&offset=${1 + (pageNum - 1) * 100}`;
    if (sortBy === 'time-asc') {
      limitSearchTerms += '&orderby=time-asc'
    } else if (sortBy === 'time-dsc') {
      limitSearchTerms += '&orderby=time'
    } else if (sortBy === 'magnitude-asc') {
      limitSearchTerms += '&orderby=magnitude-asc'
    } else if (sortBy === 'magnitude-dsc') {
      limitSearchTerms += '&orderby=magnitude'
    }
    if (after && sortBy!=='time-dsc') {
      limitSearchTerms += `&starttime=${after}`
    }
    if (maxMag && sortBy!=='magnitude-asc') {
      limitSearchTerms += `&maxmagnitude=${maxMag}`
    }
    if (minMag && sortBy!=='magnitude-dsc') {
      limitSearchTerms += `&minmagnitude=${minMag}`
    }
    if (before && sortBy!=='time-asc') {
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
  search = (maxMag, minMag, after, before, lat, lng, rad, pageNum, sortBy) => {
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
    let searchTerms = this.createSearchString(maxMag, minMag, after, before, lat, lng, rad, pageNum, sortBy);
    let hitLimit = false;
    let start = ''
    let limit = ''
    let increment = ''
    let createLimitTerm = ''
    if (sortBy === 'time-dsc') {
      start = Date.now();
      limit = Date.UTC(1900,0,1);
      if (before) {
        start = Date.UTC(parseInt(before.substr(0,4),10),parseInt(before.substr(5,7),10)-1,parseInt(before.substr(8,10),10));
      }
      if (after) {
        limit = Date.UTC(parseInt(after.substr(0,4),10),parseInt(after.substr(5,7),10)-1,parseInt(after.substr(8,10),10));
      }
      increment = -1000 * 60 * 60 * 24 * 10;
      createLimitTerm = this.createTimeLimit
    } else if (sortBy === 'time-asc') {
      start = Date.UTC(1900,0,1);
      limit = Date.now();
      if (after) {
        start = Date.UTC(parseInt(after.substr(0,4),10),parseInt(after.substr(5,7),10)-1,parseInt(after.substr(8,10),10));
      }
      if (before) {
        limit = Date.UTC(parseInt(before.substr(0,4),10),parseInt(before.substr(5,7),10)-1,parseInt(before.substr(8,10),10));
      }
      increment = 1000 * 60 * 60 * 24 * 10;
      createLimitTerm = this.createTimeLimit
    } else if (sortBy === 'magnitude-dsc') {
      start = Math.pow(10, -10);
      limit = Math.pow(10, 1);
      if (maxMag) {
        start = Math.pow(10, -1 * parseFloat(maxMag, 10));
      }
      if (minMag) {
        limit = Math.pow(10, -1 * parseFloat(minMag, 10));
      }
      increment = 0.0000001;
      createLimitTerm = this.createMagLimit
    } else if (sortBy === 'magnitude-asc') {
      start = Math.pow(10, 1);
      limit = Math.pow(10, -10);
      if (minMag) {
        start = Math.pow(10, -1 * parseFloat(minMag, 10));
      }
      if (maxMag) {
        limit = Math.pow(10, -1 * parseFloat(maxMag, 10));
      }
      increment = -0.0000001;
      createLimitTerm = this.createMagLimit
    }
    let variable = start + increment;
    if (increment > 0) {
      if ((variable) > (limit)) {
        variable = limit;
        hitLimit = true;
      }
    } else if (increment < 0) {
      if ((variable) < (limit)) {
        variable = limit;
        hitLimit = true;
      }
    }
    let limitTerm = createLimitTerm(increment, variable)
    this.getSearchCount(searchTerms, limitTerm);
    this.searchFor100(start, increment, limit, searchTerms, hitLimit, createLimitTerm, variable)
  }

  // creates search term for magnitude limits
  createMagLimit = (increment, variable) => {
    if (increment < 0) {
      return `&maxmagnitude=${(-Math.log10(variable)).toFixed(2)}`
    } else if (increment > 0) {
      return `&minmagnitude=${(-Math.log10(variable)).toFixed(2)}`
    }
  }

  // creates search term for time limits
  createTimeLimit = (increment, variable) => {
    if (increment < 0) {
      return `&starttime=${new Date(variable).toISOString().substr(0,10)}`
    } else if (increment > 0) {
      return `&endtime=${new Date(variable).toISOString().substr(0,10)}`
    }
  }

  //  continually searchs API based on sort by until 100 results are found
  searchFor100 = (start, increment, limit, searchTerms, hitLimit, createLimitTerm, variable) => {
    if (this.state.error) {

    } else if (!this.state.done) {
      setTimeout(() => {this.searchFor100(start, increment, limit, searchTerms, hitLimit, createLimitTerm, variable)}, 100);
    } else {
      if (this.state.searchCount >= this.state.pageNum * 100 || hitLimit) {
        if (this.state.searchCount === 0) {
          this.setState({
            noResults: true,
            searched: false,
            loading: false,
            done: false
          })
        } else {
          if (hitLimit && this.state.searchCount <= this.state.pageNum * 100) {
            this.setState({
              last: true
            })
          } else {
            this.setState({
              last: false
            })
          }
          this.setState({
            noResults: false,
            done:false
          })
          let limitTerm = createLimitTerm(increment, variable)
          this.getQuakeData(searchTerms, limitTerm)
        }
      } else {
        if (this.state.searchCount) {
          increment *= this.state.pageNum * 100 / this.state.searchCount
          variable = start + increment;
        } else {
          increment *= this.state.pageNum * 100
          variable = start + increment;
        }
        if (increment > 0) {
          if ((variable) > (limit)) {
            variable = limit;
            hitLimit = true;
          }
        } else if (increment < 0) {
          if ((variable) < (limit)) {
            variable = limit;
            hitLimit = true;
          }
        }
        let limitTerm = createLimitTerm(increment, variable)
        this.getSearchCount(searchTerms, limitTerm);
        this.searchFor100(start, increment, limit, searchTerms, hitLimit, createLimitTerm, variable);
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

  // extract the search criteria from a given URL
  parseURL = (parsedUrl) => {
    let after = parsedUrl.searchParams.get("after");
    let before = parsedUrl.searchParams.get("before");
    let afterState = '';
    let beforeState = '';
    if (after) {
      let afterDay = after.substring(0, 2);
      let afterMonth = after.substring(3, 5);
      let afterYear = after.substring(6, 10);
      afterState = `${afterYear}-${afterMonth}-${afterDay}`;
    }
    if (before) {
      let beforeDay = before.substring(0, 2);
      let beforeMonth = before.substring(3, 5);
      let beforeYear = before.substring(6, 10);
      beforeState = `${beforeYear}-${beforeMonth}-${beforeDay}`;
    }

    return({
      sortBy: parsedUrl.searchParams.get('sortBy'),
      minMag: parsedUrl.searchParams.get("minMag"),
      maxMag: parsedUrl.searchParams.get("maxMag"),
      after: afterState,
      before: beforeState,
      lat: parsedUrl.searchParams.get("lat"),
      lng: parsedUrl.searchParams.get("lng"),
      rad: parsedUrl.searchParams.get("rad"),
    })
  }

  // move to next page of results
  pageUp = () => {
    if (!this.state.last) {
      this.setState(prevState => {
        const { history: { push } } = this.props;
        push(`/home/${prevState.pageNum + 1}`+this.props.history.location.search);
        let param = this.parseURL(new URL(window.location.href));
        this.search(param.maxMag, param.minMag, param.after, param.before, param.lat, param.lng, param.rad, prevState.pageNum + 1, param.sortBy)
        return({
          pageNum: prevState.pageNum + 1
        })
      })
    }
  }

  // move to previous page of results
  pageDown = () => {
    if (this.state.pageNum > 1) {
      this.setState(prevState => {
        const { history: { push } } = this.props;
        push(`/home/${prevState.pageNum - 1}`+this.props.history.location.search);
        let param = this.parseURL(new URL(window.location.href));
        this.search(param.maxMag, param.minMag, param.after, param.before, param.lat, param.lng, param.rad, prevState.pageNum - 1, param.sortBy)
        return({
          pageNum: prevState.pageNum - 1
        })
      })
    }
  }

  // ------ These functions handle the map functionality zoom, pan, click ----
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
    if (this.state.zoom < 1) {
      this.setState({
        zoom: 1,
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

  // resets the zoom and center states for when going back to search bar and removes focused marker
  resetMap = () => {
    this.setState({
      zoom: 1.6,
      center: [0, 0],
      focused: ''
    })
  }

  // resets page number to 1
  resetPages = () => {
    this.setState({
      pageNum: 1
    })
  }

  // sets the page number if url is provided with one
  savePageNum = pageNum => {
    this.setState({
      pageNum: pageNum
    })
  }

  // sets error state to false for when error window is closed
  handleError = () => {
    this.setState({
      error: false
    })
  }

  didPressSearch = (param) => {
    this.setState({
      lastSearch: this.parseURL(new URL(window.location.href))
    })
  }



  render() {
      let param = this.parseURL(new URL(window.location.href));
      console.log(param);
      console.log(this.state.lastSearch);
      if (param.sortBy && !this.state.loading) {
        if ((this.state.lastSearch.minMag !== param.minMag || this.state.lastSearch.maxMag !== param.maxMag) && !this.state.loading) {
          this.setState({
            loading: true
          })
          setTimeout(()=> {
            let thisParam = this.parseURL(new URL(window.location.href));
            this.didPressSearch(thisParam)
              this.search(thisParam.maxMag, thisParam.minMag, thisParam.after, thisParam.before, thisParam.lat, thisParam.lng, thisParam.rad, this.state.pageNum, thisParam.sortBy)
          }, 100)
        }
      }
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
          path='/home/:pageNum'
          render={routeProps => (
            <MenuBar
              {...routeProps}
              search={this.search}
              searchCount={this.state.searchCount}
              searched={this.state.searched}
              last={this.state.last}
              pageNum={this.state.pageNum}
              pageUp={this.pageUp}
              pageDown={this.pageDown}
              resetMap={this.resetMap}
              savePageNum={this.savePageNum}
              resetPages={this.resetPages}
              loading={this.state.loading}
              parseURL={this.parseURL}
              didPressSearch={this.didPressSearch}
            />
          )}
        />
        <Route exact
          path='/home'
          render={routeProps => {
            if (this.state.quakes.length) {
              this.setState({
                quakes: [],
                searched: false
              })
            }
            return (
            <MenuBar
              {...routeProps}
              search={this.search}
              searchCount={this.state.searchCount}
              searched={false}
              last={this.state.last}
              pageNum={this.state.pageNum}
              pageUp={this.pageUp}
              pageDown={this.pageDown}
              resetMap={this.resetMap}
              savePageNum={this.savePageNum}
              resetPages={this.resetPages}
              loading={this.state.loading}
              parseURL={this.parseURL}
              didPressSearch={this.didPressSearch}
            />
          )}}
        />
        <Route
          path='/home/marker/:id'
          render={routeProps => {
            return (
              <InfoBar
                {...routeProps}
                getOneQuake={this.getOneQuake}
                loading={this.state.loading}
                quakes={this.state.quakes}
                removeFocused={this.removeFocused}
                queryString={this.state.queryString}
                resetMap={this.resetMap}
                pageNum={this.state.pageNum}
                setFocused={this.setFocused}
                markerZoomAndPan={this.markerZoomAndPan}
                quake={this.state.focused}
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
