import React from 'react'

const About = () => (
  <div className='about' >
    <div className='margin'>
      <p>
        All data shown in this app is provided by the <a href='https://earthquake.usgs.gov/'>USGS</a>
        and is formed of a combination of databases that have earthquake records from 1900 up to current day.
        The number of people that felt a particular earthquake is taken from
        <a href='https://earthquake.usgs.gov/data/dyfi/'>Did You Feel It?</a> which
        mainly keeps data for recent earthquakes and so not all earthquakes have
        DYFI data particulary older earthquakes.
      </p>
      <h3> How To Use This App</h3>
      <p>
        Simply enter the pararmeters of the earthquakes that you want to search for
        then select how you want to sort your earthqaukes and then press search.
        Please note that to define a search area you must supply longitude and latitude
        coordinates showing the center of your search area along with a radius for your search area.
        If you supplya search area the center of your search area is shown on the
        map as a blue marker on the map. Earthquakes show up on the map as orange
        markers, a maximum of 100 earthquakes are shown at any one time.The page
        change buttons above the search bar allow you to move to the next or previous
        set of earthquakes. Hovering over an earthquake shows the basic data about it,
        the date it occured on, its magnitude, and its position. For more information
        click on the marker and the side panel will show additional data.
      </p>
    </div>
  </div>
)

export default About
