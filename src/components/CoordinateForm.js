import React, { Component } from 'react';
import { create, all } from 'mathjs'
// create a mathjs instance with configuration
const config = {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'number',
  precision: 64,
  predictable: false,
  randomSeed: null
}
const math = create(all, config)

class CoordinateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {latitude : '', longitude: '', data: null};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getLatLon(alpha, gamma) {
    let theta0 = (Math.PI / 2.) - (this.state.latitude * (Math.PI / 180.));
    let phi0 = this.state.longitude * (Math.PI / 180.);
    let theta = Math.acos((Math.cos(theta0) * Math.cos(gamma)) +
      (Math.cos(alpha) * Math.sin(theta0) * Math.sin(gamma)));
    let phi = math.multiply(math.add(Math.sin(theta0) * Math.cos(gamma), 
      math.multiply(math.i, Math.sin(alpha) * Math.sin(gamma))),
      math.exp(math.multiply(math.i, phi0))).toPolar().phi;
    let latitude = 90. - ((180. / Math.PI) * theta);
    let longitude = (180. / Math.PI) * phi;
    return [latitude, longitude];
  }

  constructAPIRequest() {
    let apiRequestArray = []
    for (let az = 0; az <= 2 * Math.PI; az += 2 * Math.PI / 36.) {
      for (let r = 0.005; r <= 0.05; r += 0.005) {
        let coordinate = this.getLatLon(az, r);
        apiRequestArray.push(coordinate[0].toFixed(2), ",",
          coordinate[1].toFixed(2), "|");
      }
    }
    apiRequestArray.pop();
    let apiRequestString = apiRequestArray.join("");
    return apiRequestString;
  }

  async fetchElevation() {
    this.constructAPIRequest();
    fetch('https://api.open-elevation.com/api/v1/lookup?locations=' +
      this.constructAPIRequest())
      .then((response) => response.json())
      .then((data) => {
        console.log(data.results);
        alert('latitude: ' + data.results[0].latitude + ', longitude: ' +
          data.results[0].longitude + ', elevation: ' +
          data.results[0].elevation)
      })
      .catch((error) =>
        alert('Error fetching elevation data!')
      );
  }

  handleChange(event) {
    this.setState({[event.target.name] : event.target.value});
  }

  handleSubmit(event) {
    this.fetchElevation();
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
      <p>
        <label>
          Latitude:&nbsp;
          <input
            type="text"
            name="latitude"
            value={this.state.latitude}
            onChange={this.handleChange}
          />
        </label>&nbsp;&nbsp;
        <label>
          Longitude:&nbsp;
          <input
            type="text"
            name="longitude"
            value={this.state.longitude}
            onChange={this.handleChange}
          />
        </label>
      </p>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default CoordinateForm;
