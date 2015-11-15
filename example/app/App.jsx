// for webpack to compile css
require('../styles.js').webpackStylesBootstrap();

var React =         require('react'),
    RR =            require('react-router'),
    history =       require('history/lib/createBrowserHistory')(),
    reactDom =      require('react-dom'),
	omni = 	        require('./common/omni/omni'),
	appRoutes =     require('../routes'),
	operations =	require('./operations/operations');


var debug = true,
    initialState = {};

omni.init(operations, topDownRender, initialState, debug);
// !! don't load any view components before this point !!

// expose our state for easy debugging
window.state = omni.state;

// call other state inits here
require('./state/alpha/alpha').init();


var {Router, Route, IndexRoute, Link} = RR,
    routes = appRoutes.byAction;

var App = React.createClass({

	render() {
		var appRoute = appRoutes.match(this.props.location.pathname) || {};

		state.set('route', {
			action: appRoute.action,
			actionPath: appRoute.actionPath,
			location: this.props.location,
			params: this.props.params,
			routeParams: this.props.routeParams
		});

		return this.props.children;
	}
});




const Index = React.createClass({
	render() {
		console.log("RENDER INDEX", routes);
		return (
			<Link to={routes.alpha.route}>Alpha</Link>
		);
	}
});





function topDownRender() {
	reactDom.render((
			<Router history={history}>
				<Route path="/" component={App}>
					<IndexRoute component={Index}/>
					<Route path={routes.alpha.route} component={require('./view/Base/Base.jsx')}/>
				</Route>
			</Router>
	), document.getElementById('app'));
}

topDownRender();