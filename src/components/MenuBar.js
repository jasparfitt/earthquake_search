import React, {Component} from 'react';
import { withRouter } from 'react-router';

class MenuBar extends Component{

  constructor(props) {
    super(props)
    let parsedUrl = new URL(window.location.href);
    let after = parsedUrl.searchParams.get("after");
    let before = parsedUrl.searchParams.get("before");
    let afterState = '';
    let beforeState = '';
    let sortBy = 'time-dsc';
    if (parsedUrl.searchParams.get("sortBy")) {
      sortBy = parsedUrl.searchParams.get("sortBy")
    }
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

    this.state = {
      minMag: parsedUrl.searchParams.get("minMag"),
      maxMag: parsedUrl.searchParams.get("maxMag"),
      after: afterState,
      before: beforeState,
      lat: parsedUrl.searchParams.get("lat"),
      lng: parsedUrl.searchParams.get("lng"),
      rad: parsedUrl.searchParams.get("rad"),
      required: false,
      sortBy: sortBy
    }
  }

  componentDidMount() {
    console.log(this.props.match)
    if (this.props.match.params.pageNum) {
      this.props.savePageNum(parseInt(this.props.match.params.pageNum,10))
    }
    if ((this.state.minMag || this.state.maxMag || this.state.after || this.state.before || this.state.lat || this.state.lng || this.state.rad) && !this.props.searched) {
      this.props.search(this.state.maxMag, this.state.minMag, this.state.after, this.state.before, this.state.lat, this.state.lng, this.state.rad, this.props.match.params.pageNum, this.state.sortBy)
    }
    this.props.resetMap()
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.search(this.state.maxMag,this.state.minMag,this.state.after,this.state.before,this.state.lat,this.state.lng,this.state.rad, 1,this.state.sortBy)
    let path =`/home/1?sortBy=${this.state.sortBy}`
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

  lngChange = (e) => {
    this.setState({lng: e.target.value});
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

  radChange = (e) => {
    this.setState({rad: e.target.value});
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
    let minLim = -1;
    let maxLim = 10;
    if (this.state.minMag) {
      minLim = this.state.minMag
    }
    if (this.state.maxMag) {
      maxLim = this.state.maxMag
    }
    return(
      <div className='sidebar menubar'>
        <div className='sidebar-content'>
          <div className='page-control' style={{opacity: this.props.searched? '1' : '0'}}>
            <button className='back-btn' onClick={this.props.pageDown} style={{opacity: (this.props.pageNum!==1)? '1' : '0'}}><i className="fas fa-caret-left"></i></button>
            <div><span>Page {this.props.pageNum}</span></div>
            <button className='next-btn' onClick={this.props.pageUp} style={{opacity: this.props.last? '0' : '1'}}><i className="fas fa-caret-right"></i></button>
          </div>
          <h2>Search Parameters</h2>
          <form onSubmit={this.handleSubmit}>
            <label>Magnitudes greater than</label> <br/>
            <span className='value'><label>{this.state.minMag}</label></span>
            <input type='range' value={this.state.minMag} min='-1' max= {maxLim} step='0.1' onChange={this.minMagChange} /> <br/>
            <label>Magnitudes less than</label> <br/>
            <span className='value'><label>{this.state.maxMag}</label></span>
            <input type='range' value={this.state.maxMag} min={minLim} max= '10' step='0.1' onChange={this.maxMagChange} /> <br/>
            <label>After</label> <br/>
            <input type='date' value={this.state.after} min='1900-01-01' max={new Date(Date.now()).toISOString().substr(0,10)} onChange={this.afterChange} /> <br/>
            <label>Before</label> <br/>
            <input type='date' value={this.state.before} min='1900-01-01' max={new Date(Date.now()).toISOString().substr(0,10)} onChange={this.beforeChange} /> <br/>
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
            <label for='time-dsc' className='sortName'>Time (newest - oldest)</label><br/>
            <input
              className='sort'
              type='radio'
              name='sortCheck'
              id='time-asc'
              value='time-asc'
              checked={this.state.sortBy==='time-asc'}
              onChange={this.handleRadioChange}
            />
            <label for='time-asc' className='sortName'>Time (oldest - newest)</label><br/>
            <input
              className='sort'
              type='radio'
              name='sortCheck'
              id='mag-dsc'
              value='magnitude-dsc'
              checked={this.state.sortBy==='magnitude-dsc'}
              onChange={this.handleRadioChange}
            />
            <label for='magnitude-dsc' className='sortName'>Magnitude (largest - smallest)</label><br/>
            <input
              className='sort'
              type='radio'
              name='sortCheck'
              id='mag-asc'
              value='magnitude-asc'
              checked={this.state.sortBy==='magnitude-asc'}
              onChange={this.handleRadioChange}
            />
            <label for='magnitude-asc' className='sortName'>Magnitude (largest - smallest)</label><br/>
            <input className='submit' onClick={this.handleCheck} type='submit' value='Search' />
          </form>
        </div>
      </div>
    )
  }
}

export default withRouter(MenuBar)
