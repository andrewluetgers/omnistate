/* @flow weak */

var React = require('react'),
	Title = require('react-document-title'),
	Link = require('react-router').Link;

module.exports = React.createClass({
	render: function() {
		return (
			<Title title='Not Found'>
				<div>
					<h1>404 Not Found</h1>
					<Link to='Home'>Home</Link>
				</div>
			</Title>
		);
	}
});
