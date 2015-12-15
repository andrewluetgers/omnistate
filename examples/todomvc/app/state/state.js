
import {reduce} from 'lodash'
import {state, computed} from 'omnistate'


export default {

	init: function() {
		state.init({
			todos: null, // see todos.js
			editing: null, // null or some todo id
			editText: '', // the inline edit text input value
			newTodo: '', // the main text input value

			// see computed values below
			showing: 'all', // all | active | completed
			count: 0,
			activeTodoCount: 0,
			completedCount: 0
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

	'count': [
		['todos.length'],
		length => length
	],

	'activeTodoCount': [
		['todos'],
		todos => {
			console.log("todos", todos);
			return reduce(todos, (accum, todo) => {
				return todo.completed ? accum : accum + 1;
			}, 0)
		}
	],
	'completedCount': [
		['count', 'activeTodoCount'],
		(count, activeTodoCount) => count - activeTodoCount
	]
});
