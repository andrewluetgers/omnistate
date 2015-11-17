// for webpack to compile css
require('../styles.js').webpackStylesBootstrap();

var React =         require('react'),
    RR =            require('react-router'),
    history =       require('history/lib/createBrowserHistory')(),
    reactDom =      require('react-dom'),
	omni = 	        require('omnistate'),
	appRoutes =     require('../appRoutes'),
	operations =	require('./operations/operations');


var debug = true,
    initialState = {};

omni.init(operations, topDownRender, initialState, debug);
// !! don't load any view components before this point !!

// can now access our state container and api
var state = omni.state;

// expose state for easy debugging
window.state = state;

// for more interesting applications initial state configuration above will not suffice
// you will want to break up initial state and various state methods into multiple files.
// other modules can access the state container by importing omni and calling getState()
// but these components need to be initialized after omni.init is called
require('./state/alpha/alpha').init();


// configure router provide the top-down render fn used above
var {Router, Route, IndexRoute, Link} = RR,
    routes = appRoutes.byAction;

// parent route for all others, provides route state to the state container
var App = React.createClass({
	render() {

		// though not required the extra route info provided by this appRoutes matcher can
		// be quite useful when creating operations that respond to specific route patterns
		// appRoutes also serves react-router config, links and in server.js as a SPA routs white-list
		var appRoute = appRoutes.match(this.props.location.pathname) || {};

		// omni assumes route information is stored on the state under route
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

// basic example
var Index = React.createClass({
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

// initial render
topDownRender();