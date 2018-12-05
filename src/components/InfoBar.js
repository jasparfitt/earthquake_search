import React, {Component} from 'react';

class InfoBar extends Component {

  handleBack = () => {
    const { history: { push } } = this.props;
    push(`/home`+this.props.history.location.search);
    this.props.removeFocused()
  }

  render() {
    let quake = this.props.quakes.find(element => {
      return element.id === this.props.match.params.id
    })
    console.log(quake)
    if (quake) {
      let feltText = (<div>and was felt by {quake.felt} people*.</div>);
      let feltAnnotation = (<div className='annotation'><span>* Based on data collected from <a href='https://earthquake.usgs.gov/data/dyfi/'>Did You Feel It?</a></span></div>)
      return(
        <div className='sidebar infobar'>
          <div className='sidebar-content'>
            <div>
              <h2>Earthquake Information</h2>
              <div>
                location: {quake.place} <br/>
                coordinates: {`${(quake.coordinates[0]).toFixed(2)}long ${(quake.coordinates[1]).toFixed(2)}lat`} <br/>
                depth: {quake.depth+'m'} <br/>
                magnitude: {quake.magnitude} <br/>
                date: {`${quake.date}-${quake.month}-${quake.year}`} <br/>
                time: {`${quake.hour}:${quake.minute} GMT`} <br/>
              {quake.felt? feltText:''}
              </div>
              <button onClick={this.handleBack}> Back to Search </button>
            </div>
            {quake.felt? feltAnnotation:''}
          </div>
        </div>
      )
    }
    return(<div></div>)
  }
}

export default InfoBar
