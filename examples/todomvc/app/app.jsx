// for webpack to compile css
require('./App.styl');

var React =         require('react'),
    RR =            require('react-router'),
    history =       require('history/lib/createBrowserHistory')(),
    reactDom =      require('react-dom'),
    omni = 	        require('omnistate'),
    operations =	require('./operations/operations');


var debug = false,
    initialState = {}; // global provided in initial page load could go here

// provide a pushState(state, title, href) implementation that works with React Router
// this is optional and used support playback of recorded route changes
function pushState(state, title, href) {
	console.log("pushState -----", arguments);
	history.push(href);
	window.document.title = title;
}

omni.init(operations, topDownRender, initialState, debug, pushState);
// ========== !! don't load any view components before this point ======== !!

// expose state for easy debugging
debug && (window.state = omni.state);


// configure router provide the top-down render fn used above
var {Router, Route, IndexRoute, Link} = RR;

// parent route for all others, provides route state to the state container
// perhaps there is a better way to hook into React Router to do this?
var CaptureRouterState = React.createClass({
	render() {
		// store route information on state
		omni.state.set('route', {
			href: window.location.href,
			title: window.document.title,
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
		return (
			<div>
				<h1>Index</h1>
				<Link to="/base">Base</Link>
			</div>
		);
	}
});

// basic example
var Base = React.createClass({
	render() {
		return (
			<div>
				<h1>Base</h1>
				<Link to="/">Index</Link>
			</div>
		);
	}
});

// basic example
var OmniStateTools = require('omnistate-tools');

var App = React.createClass({
	render() {
		return (
			<div id="appMain">
				<Router history={history}>
					<Route path="/" component={CaptureRouterState}>
						<IndexRoute component={Index}/>
						<Route path={"/base"} component={Base}/>
					</Route>
				</Router>
				<OmniStateTools/>
			</div>
		);
	}
});


function topDownRender() {
	reactDom.render(<App/>, document.getElementById('root'));
}

// initial render
topDownRender();