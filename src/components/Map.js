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

class Map extends Component {

  state = {
    zoom: 1.9
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
    return(
      <div className='map' id='map'>
        <button className='in' onClick={ this.handleZoomIn }>{ "+" }</button>
        <button className='out' onClick={ this.handleZoomOut }>{ "-" }</button>
        <ComposableMap width={width} height={height}>
          <ZoomableGroup zoom={this.state.zoom}>
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
          <Markers>
            {this.props.searchArea.map((searchArea, i) => (
              <Marker key={i} marker={searchArea}>
                <circle
                  cx={0}
                  cy={0}
                  r={1}
                  fill="#607D8B"
                  stroke="#607D8B"
                  strokeWidth="2"
                />
              </Marker>
            ))}
          </Markers>
          <Markers>
            {this.props.markers.map((marker, i) => (
              <Marker
                key={marker.id}
                marker={marker}
                style={{
                    default: { fill: "#FF5722" },
                    hover: { fill: "#FFFFFF" },
                    pressed: { fill: "#FF5722" },
                  }}
              >
                <circle
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
                    opacity: 0.9,
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

export default Map
