
var React =         require('react'),
	Link = 			require('react-router').Link,
	If =			require('../../common/If/If.jsx'),
	component = 	require('../../common/component/component');


module.exports = component('Toolbar', {
	cursors: {
		action: 'route.action'
	}

}, function() {
	return (
		<div id="toolbar" className="layout">
			toolbar
		</div>
	);
});
