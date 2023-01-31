import React, { Component } from 'react';
import { RotatingLines } from 'react-loader-spinner';

export const FetchState = {
	hasNotFetched: "",
	isFetching: "Fetching elevation data...",
	hasFetched: "Successfully fetched elevation data!",
	hasFetchedWithError: "Error fetching elevation data."
}

class LoadingWheel extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		switch (this.props.fetchState) {
		case FetchState.hasNotFetched:
			return (<div>{FetchState.hasNotFetched}</div>);
		case FetchState.isFetching:
			return (
				<div>
					<RotatingLines strokeColor="gray" width="25" />
					<br />
					{FetchState.isFetching}
					<br />
					(If this takes longer than a few seconds it likely means that
					the open elevation API is down)
				</div>
			);
		case FetchState.hasFetched:
			return (<div>{FetchState.hasFetched}</div>);
		case FetchState.hasFetchedWithError:
			return (<div>{FetchState.hasFetchedWithError}</div>);
		}
	}
}

export default LoadingWheel;
