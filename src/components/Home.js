import React, {Component} from 'react';
import axios from 'axios';
import ReactTooltip from "react-tooltip";

import Map from './Map';
import MenuBar from './MenuBar';
import LoadingWindow from './LoadingWindow'

class Home extends Component {
  state = {
    map: '',
    earth: {},
    quakes: [],
    searchArea: [],
    loading: true
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

  defineSearchArea = (lat, lng, rad) => {
    let circleMarkers = [];
    console.log(rad)
    for (let i=0; i<360; i++) {
      let x = rad * Math.cos(i * Math.PI / 180) + lat;
      let y = rad * Math.sin(i * Math.PI / 180) + lng;
      circleMarkers.push({coordinates: [x, y]})
    }
    this.setState({
      searchArea:  circleMarkers
    })
  }

  getSearchCount = (searchTerms) => {
    let countRequest = `https://earthquake.usgs.gov/fdsnws/event/1/count?`
    axios.get(countRequest + searchTerms)
    .then(response => {
      console.log(response.data)
      return(response.data)
    })
  }

  getQuakeData = (searchTerms) => {
    let fullRequest = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&limit=100`;
    axios.get(fullRequest + searchterms)
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
      setTimeout(() => {
        ReactTooltip.rebuild()
      }, 100)
      this.setState({
        loading: false
      })
      console.log('finished search')
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
      searchTerms += `&starttime=1800-01-01`
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
    this.setState({
      loading: true
    })
    console.log('searching')

    let limitSearchTerms = this.createLimitedSearchString(maxMag, minMag, after, before, lat, lng, rad);
    let searchTerms = this.createSearchString(maxMag, minMag, after, before, lat, lng, rad);
    let quakeCount = this.getSearchCount(searchTerms);
    if (quakeCount > 1000) {
      let prevYear = new Date(Date.now());
    }

    let limtedQuakeCount = this.getSearchCount(limitSearchTerms + `&starttime=${prevYear}-01-01`)
  }

  render() {
    let loadWindow = (<LoadingWindow>
      <div className='loading'> Searching Database </div>
    </LoadingWindow>)
    console.log(this.state.loading)
    return(
      <div className='app-container'>
        {this.state.loading? loadWindow : <div></div>}
        <Map
          markers={this.state.quakes}
          searchArea={this.state.searchArea}
        />
        <MenuBar search={this.search} />
      </div>
    )
  }
}


export default Home
