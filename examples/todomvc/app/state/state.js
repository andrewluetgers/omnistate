
import {reduce} from 'lodash'
import {state, computed} from 'omnistate'


export default {

	init: function() {
		state.init({
			// see todos.js for these
			todosById: null,
			allTodoIds: null,
			activeTodoIds: null,
			completedTodoIds: null,

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
	]
});
