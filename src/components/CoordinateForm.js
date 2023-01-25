import React, { Component } from 'react';

class CoordinateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {latitude : '', longitude: '', data: null};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async fetchElevation() {
    fetch('https://api.open-elevation.com/api/v1/lookup?locations=' +
      this.state.latitude + ',' + this.state.longitude)
      .then((response) => response.json())
      .then((data) => {
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
