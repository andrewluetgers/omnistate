
// configure router
var React = require('react'),
    omni = require('omnistate');

/* <CaptureReactRouterState>
 *
 * ReactRouter takes care of
 * - parsing the URL
 * - changing the URL
 * - switching top level views when URL/route changes
 *
 * route info will be useful throughout the app so this component
 * is used to provide route state to the state container
 * this way views can react to and access route state the same way all other
 * state is accessed. It also allows OmniState features such as
 * the history api to fully integrate with ReactRouter
 *
 * Changing the route will still follow the the standard approach
 * of React Router with it's api and link component
 */
var CaptureReactRouterState = React.createClass({
	render() {
		// setting up this state structure is a convention for OmniState
		// the OmniState history api can replay route changes
		// given 'route.href' and 'route.title',
		// the props are specific to React Router and such info
		// should be stored here under 'route' as well
		// follow this convention when using other routing libraries
		console.log("set route");
		omni.state.set('route', {
			href:           window.location.href,
			title:          window.document.title,
			location:       this.props.location,
			params:         this.props.params,
			routeParams:    this.props.routeParams
		});

		return this.props.children;
	}
});


var history = require('history/lib/createBrowserHistory')();

/* reactRouterPushStateIntegration
 *
 * this is used to support OmniState history api
 * playback of recorded state changes changes in
 * 'route.href' and 'route.title' will be
 * passed to this function during playback
 */
function reactRouterPushStateIntegration(state, title, href) {
	history.push(href);
	window.document.title = title;
}


// any router integration for OmniState will need to provide
// at minimum CaptureRouteState and pushState
module.exports = {
	history: history,
	CaptureRouteState: CaptureReactRouterState,
	pushState: reactRouterPushStateIntegration
};