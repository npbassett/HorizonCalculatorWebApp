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

const EARTH_RADIUS = 6371000

class CoordinateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude : '',
      longitude: '',
      elevationData: [],
      horizonProfile: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.calculateHorizonProfile = this.calculateHorizonProfile.bind(this);
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

  getHorizonAngle(elevation, alpha, gamma) {
    return Math.atan((1. / Math.tan(gamma)) -
      (((EARTH_RADIUS + 2.) / (EARTH_RADIUS + elevation)) / Math.sin(gamma))) *
      (180. / Math.PI);
  }

  async calculateHorizonProfile() {
    let idx = 0;
    let horizonProfileArr = [];
    for (let az = 0; az <= 2 * Math.PI; az += 2 * Math.PI / 9.) {
      let maxHorizonAngle = Number.NEGATIVE_INFINITY;
      for (let r = 0.005; r < 0.05; r += 0.005) {
        let elevationPoint = this.state.elevationData[idx];
        let horizonAngle = this.getHorizonAngle(elevationPoint.elevation, az, r);
        if (horizonAngle > maxHorizonAngle) {
          maxHorizonAngle = horizonAngle;
        }
        idx++;
      }
      horizonProfileArr.push({
        azimuth : az * (180. / Math.PI),
        angle : maxHorizonAngle
      });
    }
    this.setState({horizonProfile : horizonProfileArr}, () => {
      console.log(this.state.horizonProfile)
    });
  }

  constructAPIRequest() {
    let apiRequestArray = []
    for (let az = 0; az <= 2 * Math.PI; az += 2 * Math.PI / 9.) {
      for (let r = 0.005; r <= 0.05; r += 0.005) {
        let coordinate = this.getLatLon(az, r);
        apiRequestArray.push(coordinate[0].toFixed(1), ",",
          coordinate[1].toFixed(1), "|");
      }
    }
    apiRequestArray.pop();
    let apiRequestString = apiRequestArray.join("");
    return apiRequestString;
  }

  async fetchElevation() {
    await fetch('https://api.open-elevation.com/api/v1/lookup?locations=' +
      this.constructAPIRequest())
      .then((response) => response.json())
      .then((data) => {
        this.setState({elevationData : data.results});
        alert('Successfully retrieved elevation data.');
      })
      .catch((error) => {
        console.log(error);
        alert('Error fetching elevation data!');
      })
  }

  handleChange(event) {
    this.setState({[event.target.name] : event.target.value});
  }

  async handleSubmit(event) {
    event.preventDefault();
    await this.fetchElevation();
    await this.calculateHorizonProfile();
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
