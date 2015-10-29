
var React = 			require('react'),
	Route = 			require('react-router').Route,
	RouteHandler = 		require('react-router').RouteHandler,
	NotFoundRoute =		require('react-router').NotFoundRoute,
	DefaultRoute = 		require('react-router').DefaultRoute,
    Redirect = 		    require('react-router').Redirect,
	Title = 			require('react-document-title'),
	component = 		require('../../common/component/component'),
	Toolbar = 			require('../Toolbar/Toolbar.jsx'),
	routes = 			require('../../../routes').byAction,

Main = component('Main', function(props) {
	return (
		<Title title='App'>
			<div id="main" className="layout">
				<Toolbar />
				<RouteHandler {...props}/>
			</div>
		</Title>
	);
});

module.exports = (
	<Route name="app" path={routes.base.route} handler={Main}>
        <DefaultRoute name={routes.base.name} handler={require('../Base/Base.jsx')}/>
		<NotFoundRoute handler={require('../NotFound/NotFound.jsx')}/>
	</Route>
);
