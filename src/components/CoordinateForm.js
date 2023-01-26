import React, { Component } from 'react';

class CoordinateForm extends Component {
  constructor(props) {
    super(props);
    this.handleLatitudeChange = this.handleLatitudeChange.bind(this);
    this.handleLongitudeChange = this.handleLongitudeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleLatitudeChange(event) {
    this.props.onLatitudeChange(event.target.value);
  }

  handleLongitudeChange(event) {
    this.props.onLongitudeChange(event.target.value);
  }

  handleSubmit(event) {
    this.props.onSubmit(event);
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
            value={this.props.latitude}
            onChange={this.handleLatitudeChange}
          />
        </label>&nbsp;&nbsp;
        <label>
          Longitude:&nbsp;
          <input
            type="text"
            name="longitude"
            value={this.props.longitude}
            onChange={this.handleLongitudeChange}
          />
        </label>
      </p>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default CoordinateForm;
