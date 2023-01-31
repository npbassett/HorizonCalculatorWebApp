import React, { Component } from 'react';
import CoordinateForm from './CoordinateForm.js';
import LoadingWheel, { FetchState } from './LoadingWheel.js';
import { LineChart, Line, CartesianGrid, XAxis,
  YAxis, ResponsiveContainer } from 'recharts';
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

const EARTH_RADIUS = 6371000;
const ALPHA_RESOLUTION = 360. / 18.;
const GAMMA_MIN = 0.005;
const GAMMA_MAX = 0.05;
const GAMMA_RESOLUTION = 0.0025;

class HorizonCalculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: '',
      longitude: '',
      fetchState: FetchState.hasNotFetched,
      elevationData: [],
      horizonProfile: [{azimuth : 0, horizon : 0}, {azimuth : 360, horizon : 0}]
    };
  }

  handleLatitudeChange = (latitude) => {
    this.setState({latitude : latitude});
  }

  handleLongitudeChange = (longitude) => {
    this.setState({longitude : longitude});
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    await this.fetchElevation();
  }

  render() {
    return (
      <div>
        <CoordinateForm 
          onLatitudeChange={this.handleLatitudeChange}
          onLongitudeChange={this.handleLongitudeChange}
          onSubmit={this.handleSubmit}
        />
        <p>
          <LoadingWheel fetchState={this.state.fetchState}/>
        </p>
        <ResponsiveContainer width='100%' height={500}>
          <LineChart
            width={600}
            height={300}
            data={this.state.horizonProfile}
            margin={{top: 25, right: 70, left: 30, bottom: 25}}
          >
            <Line type="monotone" dataKey="horizon" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis
              dataKey="azimuth"
              label={{ value: 'Azimuthal Angle (deg)', dy: 25}}
            />
            <YAxis
              label={{ value: 'Horizon Angle (deg)', angle: -90, dx: -25}}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  async fetchElevation() {
    this.setState({fetchState : FetchState.isFetching});
    await fetch('https://api.open-elevation.com/api/v1/lookup', {
      method : 'POST',
      headers : {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
      },
      body : this.constructAPIRequest()
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Elevation Data:');
        console.log(data.results);
        this.setState({
          elevationData : data.results,
          fetchState : FetchState.hasFetched}, () => {
            this.calculateHorizonProfile();
        });
      })
      .catch((error) => {
        this.setState({fetchState : FetchState.hasFetchedWithError});
        console.log(error);
        // alert('Error fetching elevation data!');
      })
  }

  constructAPIRequest() {
    let apiRequest = {"locations" : [{
      "latitude" : Number(this.state.latitude),
      "longitude" : Number(this.state.longitude)
    }]};
    for (let alphaDeg = 0; alphaDeg <= 360.; alphaDeg += ALPHA_RESOLUTION) {
      for (let gammaDeg = GAMMA_MIN; gammaDeg < GAMMA_MAX; gammaDeg += GAMMA_RESOLUTION) {
        let alphaRad = alphaDeg * (Math.PI / 180.);
        let gammaRad = gammaDeg * (Math.PI / 180.);
        let coordinate = this.getLatLon(alphaRad, gammaRad);
        apiRequest.locations.push({
          "latitude" : coordinate[0],
          "longitude" : coordinate[1]
        })
      }
    }
    return JSON.stringify(apiRequest);
  }

  async calculateHorizonProfile() {
    let idx = 1; /*idx 0 refers to the location of the observer*/
    let horizonProfileArr = [];
    for (let alphaDeg = 0; alphaDeg <= 360.; alphaDeg += ALPHA_RESOLUTION) {
      let maxHorizonAngle = Number.NEGATIVE_INFINITY;
      for (let gammaDeg = GAMMA_MIN; gammaDeg < GAMMA_MAX; gammaDeg += GAMMA_RESOLUTION) {
        let elevationPoint = this.state.elevationData[idx];
        console.log(idx, elevationPoint);
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
        horizon : maxHorizonAngle
      });
    }
    this.setState({horizonProfile : horizonProfileArr}, () => {
      console.log('Calculated horizon profile:')
      console.log(this.state.horizonProfile)
    });
  }

  getHorizonAngle(elevation, alphaRad, gammaRad) {
    let observerHeight = this.state.elevationData[0].elevation + 2.;
    return Math.atan((1. / Math.tan(gammaRad)) -
      (((EARTH_RADIUS + observerHeight) / (EARTH_RADIUS + elevation)) / Math.sin(gammaRad))) *
      (180. / Math.PI);
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
}

export default HorizonCalculator;
