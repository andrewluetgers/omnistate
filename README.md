# Omnistate

* Single state container
* Use path strings into state object (backed by lodash get and set)
* Views declare what state they need using path strings
* Needed state is delivered to views as state proxy mixins (read replica + setter)
* State change pattern matching drives "operations" (simple controllers)
* Views can render independently of parents (does not preclude top-down)


## Component (declarative state access)

A custom component constructor is provided which makes accessing state easy. 
It also automatically renders the component if any of it's state changes, 
bypassing the traditional top-down rendering path.
This is optional but can be a powerful tool for performance and scalability.
In worst-case scenarios rendering performance is similar to raw js. See example code.

	module.exports = omnistate.component("UserName", {
		proxies: {
			name: "user.name"	
		}
	}, function() {
		return (<div className="userName">{this.name}</div>)
	});
	
Our simple UserName component will now reflect any changes to user.name app state.
How about a list of users? The parent can simply redefine the path via props.

	module.exports = omnistate.component("Users", {
		proxies: {
			name: "users"	
		},
		userList: function(users) {
			return _.each(users, function(user, i) {
				return <li><UserName proxies={{name: "users."+i}}
			});
		}
		
	}, function() {
		return <ul>{this.userList(this.users)}</ul>
	});

Now if users[10].name is changed only that component will render. 
The ShouldComponentUpdate functions will not even be triggered for the parents or any siblings.
This can be a big win when there are many siblings or complex parents to render. 
This of course is an optional feature that can be disabled by declaring the state 
as an accessor only (no direct rendering on change) Simply prefix the proxy path with @

	module.exports = omnistate.component("UserName", {
		proxies: {
			name: "@user.name"
		}
	}, function() {
		return (<div className="userName">{this.name}</div>)
	});
	
The view will not force a direct render when the user.name changes. 
In practice there are few edge cases for needing this capability.
See the example code Alpha.jsx for such a case.

## Operations (simple controllers/middleware)

Views react to changes in state. But how does state itself react to 
changes in state?

The basic idea is that itate-change pattern matching. Operations are simple functions paired with pattern matching expressions.
When the application state matches what an operation is looking for that
function is triggered with the new state and a diff object showing what changed.
	
	// operations.js
	var state = require('omnistate').state;

	module.exports = {

		profile: {
			changes: ['user.id'],
			operation: function(readReplica, diff) {
				// hypothetical api
				api.fetchUser(diff.user.id, function(profile) {
					state.set("user.profile", profile); 
				});
			}
		}
	};

Now any time the user.id state changes this operation will be triggered to update the user profile.

you can express multiple changes using patch 


## But is it immutable?
This work is largely inspired by practical experence developing with Immutable.js
backed application state. One of the annoyances there was the api boilerplate and
constant serialization and deserialization of application state. Omnistate uses a copy on write
read-replica of the entire app state to provide state to views and operations.
All state changes go through setters that then update the read replica.

The read replica is a plain js object and if you make changes to it you will not 
trigger a state change and your read replica will be different than the true app state object.
So don't assign values to app state read replicas only use the omnistate.state api methods for updates.