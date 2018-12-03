import React, {Component} from 'react';
import { withRouter } from 'react-router';

import LoadingWindow from './LoadingWindow'

class MenuBar extends Component{

  constructor(props) {
    super(props)
    let parsedUrl = new URL(window.location.href);
    let after = parsedUrl.searchParams.get("after");
    let before = parsedUrl.searchParams.get("before");
    let afterState = '';
    let beforeState = '';
    if (after) {
      let afterDay = after.substring(8, 10);
      let afterMonth = after.substring(5, 7);
      let afterYear = after.substring(0, 4);
      afterState = `${afterDay}-${afterMonth}-${afterYear}`;
    }
    if (before) {
      let beforeDay = before.substring(8, 10);
      let beforeMonth = before.substring(5, 7);
      let beforeYear = before.substring(0, 4);
      beforeState = `${beforeDay}-${beforeMonth}-${beforeYear}`;
    }

    this.state = {
      minMag: parsedUrl.searchParams.get("minMag"),
      maxMag: parsedUrl.searchParams.get("maxMag"),
      after: afterState,
      before: beforeState,
      lat: parsedUrl.searchParams.get("lat"),
      lng: parsedUrl.searchParams.get("lng"),
      rad: parsedUrl.searchParams.get("rad")
    }
  }

  componentDidMount() {
    if (this.state.minMag || this.state.maxMag || this.state.after || this.state.before || this.state.lat || this.state.lng || this.state.rad) {
      this.props.search(this.state.maxMag, this.state.minMag, this.state.after, this.state.before, this.state.lat, this.state.lng, this.state.rad)
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.search(this.state.maxMag,this.state.minMag,this.state.after,this.state.before,this.state.lat,this.state.lng,this.state.rad)
    let path =`/home?`
    if (this.state.minMag) {
      path += `&minMag=${this.state.minMag}`
    }
    if (this.state.maxMag) {
      path += `&maxMag=${this.state.maxMag}`
    }
    if (this.state.after) {
      let day = this.state.after.substring(0, 2);
      let month = this.state.after.substring(3, 5);
      let year = this.state.after.substring(6, 10);
      path += `&after=${year}-${month}-${day}`
    }
    if (this.state.before) {
      let day = this.state.before.substring(0, 2);
      let month = this.state.before.substring(3, 5);
      let year = this.state.before.substring(6, 10);
      path += `&before=${year}-${month}-${day}`
    }
    if (this.state.lat) {
      path += `&lat=${this.state.lat}`
    }
    if (this.state.lng) {
      path += `&lng=${this.state.lng}`
    }
    if (this.state.rad) {
      path += `&rad=${this.state.rad}`
    }
    const { history: { push } } = this.props;
    push(path);
  }

  minMagChange = (e) => {
    this.setState({minMag: e.target.value});
  }

  maxMagChange = (e) => {
    this.setState({maxMag: e.target.value});
  }

  afterChange = (e) => {
    this.setState({after: e.target.value});
  }

  beforeChange = (e) => {
    this.setState({before: e.target.value});
  }

  latChange = (e) => {
    this.setState({lat: e.target.value});
  }

  lngChange = (e) => {
    this.setState({lng: e.target.value});
  }

  radChange = (e) => {
    this.setState({rad: e.target.value});
  }

  render () {
    return(
      <div className='menubar'>
        <h2>Search Parameters</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Magnitudes greater than</label> <br/>
          <input type='text' value={this.state.minMag} onChange={this.minMagChange} /> <br/>
          <label>Magnitudes less than</label> <br/>
          <input type='text' value={this.state.maxMag} onChange={this.maxMagChange} /> <br/>
          <label>After</label> <br/>
          <input type='text' value={this.state.after} placeholder='DD-MM-YYYY' onChange={this.afterChange} /> <br/>
          <label>Before</label> <br/>
          <input type='text' value={this.state.before} placeholder='DD-MM-YYYY' onChange={this.beforeChange} /> <br/>
          <label>Latitude Position</label> <br/>
          <input type='text' value={this.state.lat} onChange={this.latChange} /> <br/>
          <label>Longitude Position</label> <br/>
          <input type='text' value={this.state.lng} onChange={this.lngChange} /> <br/>
          <label>Within (km) </label> <br/>
          <input type='text' value={this.state.rad} onChange={this.radChange} /> <br/>
          <input type='submit' value='Search' />
        </form>
      </div>
    )
  }
}

export default withRouter(MenuBar)
