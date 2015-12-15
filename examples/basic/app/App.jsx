// for webpack to compile css
require('../styles.js').webpackStylesBootstrap();

var React =         require('react'),
    RR =            require('react-router'),
    history =       require('history/lib/createBrowserHistory')(),
    reactDom =      require('react-dom'),
	omni = 	        require('omnistate'),
	appRoutes =     require('../appRoutes'),
	operations =	require('./operations/operations');


// init OmniState with settings
omni.init({
	pushState:          pushState,
	useRAFBatching:     true,
	debug:              false
});

// a pushState(state, title, href) implementation that works with React Router
// this is optional and used to support playback of recorded route changes in OmniStateTools
function pushState(state, title, href) {
	console.log("pushState -----", arguments);
	history.push(href);
	window.document.title = title;
}

// init our app state, there may be several of these inits
require('./state/alpha/alpha').init();

// !!!!!! do not load any view components before this point !!!!!!!
// ================================================================


// expose state for easy debugging
window.state = omni.state;

// init example controllers
require('./controllers/example');

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

		// OmniState convention is to store this route information under route
		omni.state.set('route', {
			href: window.location.href,
			title: window.document.title,
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

var OmniStateTools = require('./OmniStateTools/OmniStateTools.jsx');

function topDownRender() {
	reactDom.render((
			<div id="appMain">
				<Router history={history}>
					<Route path="/" component={App}>
						<IndexRoute component={Index}/>
						<Route path={routes.alpha.route} component={require('./view/Base/Base.jsx')}/>
					</Route>
				</Router>
				<OmniStateTools />
			</div>
	), document.getElementById('app'));
}

// initial render
topDownRender();