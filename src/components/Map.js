import React, { Component } from "react";
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
  Markers,
  Marker
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import { withRouter } from 'react-router';

class Map extends Component {

  state = {
    center:[0,20],
    zoom: 1.9,
    focused: ''
  }

  componentDidMount = () => {
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

  handleZoomIn = () => {
    this.setState({
      zoom: this.state.zoom * 1.1,
    })
    if (this.state.zoom > 50) {
      this.setState({
        zoom: 50,
      })
    }
  }

  handleMarkerClick = (marker) => {
    this.setState({
      zoom: 15,
      center: marker.coordinates
    })
    const { history: { push } } = this.props;
    push(`/home/${marker.id}`+this.props.history.location.search);
    this.props.setFocused(marker);
  }

  handleZoomOut = () => {
    this.setState({
      zoom: this.state.zoom / 1.1,
    })
    if (this.state.zoom < 1.5) {
      this.setState({
        zoom: 1.5,
      })
    }
  }

  render() {
    let width = window.innerWidth * .8;
    let height = window.innerHeight * 0.98;
    let focusedMarker = (
      <Markers>
        <Marker key={'focused'} marker={this.props.focused}>
          <circle
            cx={0}
            cy={0}
            r={10}
            fill="#dd3501"
            stroke="#dd3501"
            strokeWidth="2"
          />
        </Marker>
      </Markers>
    )
    return(
      <div className='map' id='map'>
        <button className='in' onClick={ this.handleZoomIn }>{ "+" }</button>
        <button className='out' onClick={ this.handleZoomOut }>{ "-" }</button>
        <ComposableMap width={width} height={height}>
          <ZoomableGroup center={this.state.center} zoom={this.state.zoom}>
          <Geographies geography={ "/world-10m.json" }>
            {(geographies, projection) => geographies.map(geography => (
              <Geography
                style={{default: { fill: "#666" },
                        hover:   { fill: "#666" },
                        pressed: { fill: "#666" },}}
                key={ geography.id }
                geography={ geography }
                projection={ projection }
                />
            ))}
          </Geographies>
          {this.props.focused? focusedMarker : <div></div>}
          <Markers>
            {this.props.markers.map((marker, i) => (
              <Marker
                key={marker.id}
                marker={marker}
                onClick={this.handleMarkerClick}
                style={{
                    default: { fill: "#FF5722" },
                    hover: { fill: "#FFFFFF" },
                    pressed: { fill: "#FF5722" },
                  }}
              >
                <circle
                  className={marker.id}
                  cx={0}
                  cy={0}
                  data-tip={`Magnitude:${marker.magnitude} <br />
                              ${marker.place} <br />
                              ${marker.date}-${marker.month+1}-${marker.year} <br />
                              ${marker.coordinates}`}
                  r={5}
                  style={{
                    stroke: "#FF5722",
                    strokeWidth: 3,
                    opacity: 1,
                  }}
                />
              </Marker>
            ))}
          </Markers>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    )
  }
}

export default withRouter(Map)
