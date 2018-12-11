import React, {Component} from 'react';
import { withRouter } from 'react-router';

class MenuBar extends Component{

  constructor(props) {
    super(props)
    let parsedUrl = new URL(window.location.href);
    let states = this.props.parseURL(parsedUrl)
    let sortBy = 'time-dsc'
    if (states.sortBy) {
      sortBy = states.sortBy
    }
    this.state = {
      minMag: states.minMag,
      maxMag: states.maxMag,
      after: states.after,
      before: states.before,
      lat: states.lat,
      lng: states.lng,
      rad: states.rad,
      required: false,
      sortBy: sortBy
    }
  }

  componentDidMount() {
    if (this.props.match.params.pageNum) {
      this.props.savePageNum(parseInt(this.props.match.params.pageNum,10))
    }
    if ((this.state.minMag || this.state.maxMag || this.state.after || this.state.before || this.state.lat || this.state.lng || this.state.rad) && !this.props.searched && !this.props.loading) {
      this.props.search(this.state.maxMag, this.state.minMag, this.state.after, this.state.before, this.state.lat, this.state.lng, this.state.rad, parseInt(this.props.match.params.pageNum,10), this.state.sortBy)
    }
    this.props.resetMap()
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.resetMap();
    this.props.resetPages();
    this.props.search(this.state.maxMag,this.state.minMag,this.state.after,this.state.before,this.state.lat,this.state.lng,this.state.rad, 1,this.state.sortBy)
    let path =`/home/1?&sortBy=${this.state.sortBy}`
    if (this.state.minMag) {
      path += `&minMag=${this.state.minMag}`
    }
    if (this.state.maxMag) {
      path += `&maxMag=${this.state.maxMag}`
    }
    if (this.state.after) {
      let day = this.state.after.substring(8, 10);
      let month = this.state.after.substring(5, 7);
      let year = this.state.after.substring(0, 4);
      path += `&after=${day}-${month}-${year}`
    }
    if (this.state.before) {
      let day = this.state.before.substring(8, 10);
      let month = this.state.before.substring(5, 7);
      let year = this.state.before.substring(0, 4);
      path += `&before=${day}-${month}-${year}`
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
    this.props.didPressSearch();
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

  handleCheck = () => {
    if (this.state.lng || this.state.lat || this.state.rad) {
      this.setState({
        required: true
      })
    } else if (!this.state.rad && !this.state.lng && !this.state.lat) {
      this.setState({
        required: false
      })
    }
  }

  handleRadioChange = (e) => {
    this.setState({
      sortBy: e.target.value
    })
  }

  render () {

    let minLimMag = -1;
    let maxLimMag = 10;
    let minLimDate = '1900-01-01';
    let maxLimDate = new Date(Date.now()).toISOString().substr(0,10);
    if (this.state.minMag) {
      minLimMag = this.state.minMag
    }
    if (this.state.maxMag) {
      maxLimMag = this.state.maxMag
    }
    if (this.state.after) {
      minLimDate = this.state.after
    }
    if (this.state.before) {
      maxLimDate = this.state.before
    }
    if (parseInt(this.props.match.params.pageNum,10) !== this.props.pageNum && !this.props.loading && this.props.match.params.pageNum) {
      this.props.savePageNum(parseInt(this.props.match.params.pageNum,10))
      this.props.search(this.state.maxMag, this.state.minMag, this.state.after, this.state.before, this.state.lat, this.state.lng, this.state.rad, parseInt(this.props.match.params.pageNum,10), this.state.sortBy)
    }
    return(
      <div className='sidebar menubar'>
        <div className='sidebar-content'>
          <div className={this.props.searched? 'page-control' : 'page-control disabled'} >
            <button className={(this.props.pageNum!==1)? 'back-btn' : 'back-btn disabled'} onClick={this.props.pageDown} ><i className="fas fa-caret-left"></i></button>
            <div><span>Page {this.props.match.params.pageNum? parseInt(this.props.match.params.pageNum,10) : 0}</span></div>
            <button className={this.props.last? 'next-btn disabled': 'next-btn'} onClick={this.props.pageUp} ><i className="fas fa-caret-right"></i></button>
          </div>
          <h2>Search Parameters</h2>
          <form onSubmit={this.handleSubmit}>
            <label>Magnitudes greater than</label> <br/>
            <span className='value'><label>{this.state.minMag}</label></span>
            <input type='range' value={this.state.minMag} min='-1' max= {maxLimMag} step='0.1' onChange={this.minMagChange} /> <br/>
            <label>Magnitudes less than</label> <br/>
            <span className='value'><label>{this.state.maxMag}</label></span>
            <input type='range' value={this.state.maxMag} min={minLimMag} max= '10' step='0.1' onChange={this.maxMagChange} /> <br/>
            <label>After</label> <br/>
            <input type='date' value={this.state.after} min='1900-01-01' max={maxLimDate} onChange={this.afterChange} /> <br/>
            <label>Before</label> <br/>
            <input type='date' value={this.state.before} min={minLimDate} max={new Date(Date.now()).toISOString().substr(0,10)} onChange={this.beforeChange} /> <br/>
            <label><h3>Search Area</h3></label> <br/>
            <label>Latitude Position</label> <br/>
            <input type='number' value={this.state.lat} min='-90' max='90' required={this.state.required} onChange={this.latChange} /> <br/>
            <label>Longitude Position</label> <br/>
            <input type='number' value={this.state.lng} min='-180' max='180' required={this.state.required} onChange={this.lngChange} /> <br/>
            <label>Within (km) </label> <br/>
            <input type='number' value={this.state.rad} min='0' required={this.state.required} onChange={this.radChange} /> <br/>
            <label><h3>Sort by</h3></label> <br/>
            <input
              className='sort'
              type='radio'
              name='sortCheck'
              id='time-dsc'
              value='time-dsc'
              checked={this.state.sortBy==='time-dsc'}
              onChange={this.handleRadioChange}
            />
          <label htmlFor='time-dsc' className='sortName'>Time (newest - oldest)</label><br/>
            <input
              className='sort'
              type='radio'
              name='sortCheck'
              id='time-asc'
              value='time-asc'
              checked={this.state.sortBy==='time-asc'}
              onChange={this.handleRadioChange}
            />
          <label htmlFor='time-asc' className='sortName'>Time (oldest - newest)</label><br/>
            <input
              className='sort'
              type='radio'
              name='sortCheck'
              id='mag-dsc'
              value='magnitude-dsc'
              checked={this.state.sortBy==='magnitude-dsc'}
              onChange={this.handleRadioChange}
            />
          <label htmlFor='magnitude-dsc' className='sortName'>Magnitude (largest - smallest)</label><br/>
            <input
              className='sort'
              type='radio'
              name='sortCheck'
              id='mag-asc'
              value='magnitude-asc'
              checked={this.state.sortBy==='magnitude-asc'}
              onChange={this.handleRadioChange}
            />
          <label htmlFor='magnitude-asc' className='sortName'>Magnitude (smallest - largest)</label><br/>
            <input className='submit' onClick={this.handleCheck} type='submit' value='Search' />
          </form>
        </div>
      </div>
    )
  }
}

export default withRouter(MenuBar)
