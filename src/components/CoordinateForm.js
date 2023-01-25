import React, { Component } from 'react';

class CoordinateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {latitude : '', longitude: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name] : event.target.value});
  }

  handleSubmit(event) {
    alert('A coordinate was submitted: (' + this.state.latitude +
      ', ' + this.state.longitude + ')');
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
