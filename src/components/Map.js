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

  componentDidMount = () => {
    this.props.handleMouseWheel();
  }

  handleMarkerClick = (marker) => {
    this.props.markerZoomAndPan(marker)
    const { history: { push } } = this.props;
    this.props.saveSearch(this.props.history.location.search)
    push(`/home/${marker.id}`);
    this.props.setFocused(marker);
  }

  render() {
    let width = window.innerWidth * .8;
    let height = window.innerHeight * 1;
    let focusedMarker = (
      <Markers>
        <Marker key={'focused'} marker={this.props.focused}>
          <circle
            className='focused'
            cx={0}
            cy={0}
          />
        </Marker>
      </Markers>
    )
    let noResultsPop = (<div className='no-results'><div className='no-results-text'><i class="fas fa-exclamation-triangle"></i><br/>Sorry, no earthquakes were found matching these parameters</div></div>)
    return(
      <div className='map' id='map'>
        {this.props.noResults? noResultsPop: ''}
        <button className='in' onClick={ this.handleZoomIn }>{ "+" }</button>
        <button className='out' onClick={ this.handleZoomOut }>{ "-" }</button>
        <ComposableMap width={width} height={height}>
          <ZoomableGroup center={this.props.center} zoom={this.props.zoom}>
          <Geographies geography={ "/world-10m.json" }>
            {(geographies, projection) => geographies.map(geography => (
              <Geography
                key={ geography.id }
                geography={ geography }
                projection={ projection }
                />
            ))}
          </Geographies>
          <Markers>
            {this.props.markers.map((marker, i) => (
              <Marker
                key={marker.id}
                marker={marker}
                onClick={this.handleMarkerClick}
              >
                <circle
                  className={marker.id}
                  cx={0}
                  cy={0}
                  data-tip={`Magnitude:${marker.magnitude} <br />
                              ${marker.place} <br />
                              ${marker.date}-${marker.month+1}-${marker.year} <br />
                              click for more info`}
                />
              </Marker>
            ))}
          </Markers>
            {this.props.focused? focusedMarker : ''}
          </ZoomableGroup>
        </ComposableMap>
        <ReactTooltip multiline={true}/>
      </div>
    )
  }
}

export default withRouter(Map)
