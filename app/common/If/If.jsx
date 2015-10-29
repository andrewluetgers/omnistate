var React = require('react');

module.exports = React.createClass({
	render: function() {
		return (this.props.is) ? this.props.children : false;
	}
});

