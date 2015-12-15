
import {reduce} from 'lodash'
import {state, computed} from 'omnistate'


export default {

	init: function() {
		state.init({
			todos: null, // see todos.js
			activeTodos: null, // see todos.js
			completedTodos: null, // see todos.js

			editing: null, // null or some todo id
			editText: '', // the inline edit text input value
			newTodo: '', // the main text input value

			// see computed values below
			showing: 'all' // all | active | completed
		});
	}

};


computed({

	'showing': [
		['route.location.pathname'],
		path => {
			switch(path) {
				case "/active":     return "active";
				case "/completed":  return "completed";
				default:            return "all";
			}
		}
	],

	'showing2': 'showing'
});
