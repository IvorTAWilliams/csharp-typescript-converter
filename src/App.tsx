import * as React from 'react';
import Home from "./Home";
import './App.css'

export default class App extends React.Component {
	public render() {
		return (
			<div className={'app'}>
				<Home />
			</div>
		)
	}
}