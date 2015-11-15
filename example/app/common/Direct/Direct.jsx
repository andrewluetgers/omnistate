

var React =         require('react'),
    component = 	require('../../common/component/component');

module.exports = component('Direct', {
	renderChildren: function() {
		return React.Children.map(this.props.children, child => {
			console.log(child);
			return React.cloneElement(child, this.bindings);
		});
	}

}, function() {
	return <span>{this.renderChildren()}</span>
});



