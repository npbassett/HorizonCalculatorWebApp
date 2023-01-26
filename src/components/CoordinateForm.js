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

  getLatLon(alphaRad, gammaRad) {
    let theta0 = (Math.PI / 2.) - (this.state.latitude * (Math.PI / 180.));
    let phi0 = this.state.longitude * (Math.PI / 180.);
    let theta = Math.acos((Math.cos(theta0) * Math.cos(gammaRad)) +
      (Math.cos(alphaRad) * Math.sin(theta0) * Math.sin(gammaRad)));
    let phi = math.multiply(math.add(Math.sin(theta0) * Math.cos(gammaRad), 
      math.multiply(math.i, Math.sin(alphaRad) * Math.sin(gammaRad))),
      math.exp(math.multiply(math.i, phi0))).toPolar().phi;
    let latitude = 90. - ((180. / Math.PI) * theta);
    let longitude = (180. / Math.PI) * phi;
    return [latitude, longitude];
  }

  getHorizonAngle(elevation, alphaRad, gammaRad) {
    let observerHeight = this.state.elevationData[0].elevation + 2.;
    return Math.atan((1. / Math.tan(gammaRad)) -
      (((EARTH_RADIUS + observerHeight) / (EARTH_RADIUS + elevation)) / Math.sin(gammaRad))) *
      (180. / Math.PI);
  }

  async calculateHorizonProfile() {
    let idx = 1; /*idx 0 refers to the location of the observer*/
    let horizonProfileArr = [];
    for (let alphaDeg = 0; alphaDeg <= 360.; alphaDeg += 360. / 9.) {
      let maxHorizonAngle = Number.NEGATIVE_INFINITY;
      for (let gammaDeg = 0.005; gammaDeg < 0.05; gammaDeg += 0.005) {
        let elevationPoint = this.state.elevationData[idx];
        let alphaRad = alphaDeg * (Math.PI / 180.);        
        let gammaRad = gammaDeg * (Math.PI / 180.);
        let horizonAngle = this.getHorizonAngle(
          elevationPoint.elevation,
          alphaRad,
          gammaRad
        );
        if (horizonAngle > maxHorizonAngle) {
          maxHorizonAngle = horizonAngle;
        }
        idx++;
      }
      horizonProfileArr.push({
        azimuth : alphaDeg,
        angle : maxHorizonAngle
      });
    }
    this.setState({horizonProfile : horizonProfileArr}, () => {
      console.log('Calculated horizon profile:')
      console.log(this.state.horizonProfile)
    });
  }

  constructAPIRequest() {
    let apiRequestArray = [this.state.latitude, ",", this.state.longitude, "|"]
    for (let alphaDeg = 0; alphaDeg <= 360.; alphaDeg += 360. / 9.) {
      for (let gammaDeg = 0.005; gammaDeg < 0.05; gammaDeg += 0.005) {
        let alphaRad = alphaDeg * (Math.PI / 180.);
        let gammaRad = gammaDeg * (Math.PI / 180.);
        let coordinate = this.getLatLon(alphaRad, gammaRad);
        apiRequestArray.push(coordinate[0].toFixed(2), ",",
          coordinate[1].toFixed(2), "|");
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
