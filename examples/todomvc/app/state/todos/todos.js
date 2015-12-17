
import {state, computed} from 'omnistate';
import _ from 'lodash';

function uid() {return new Date().getTime()}

export default {

	init: function() {
		state.merge({

			// omnistate collections work best when indexed by unique identifier
			// see how this is populated by addTodo
			// for bigger projects use something like https://github.com/gaearon/normalizr
			todosById: {},

			// secondary views store only the ids in desired sort order
			// this is very efficient and helps keep logic out of views
			// these lists are computed on the fly, see the computed section below
			// look at TodoItems to see how this gets used
			allTodoIds: [],
			activeTodoIds: [],
			completedTodoIds: []
		});
	},

	addTodo: function(title) {
		var id = uid();
		state.set(["todosById", id], {
			id: id,
			title: title,
			completed: false
		});
	},
	
	toggleAll: function(checked) {
		// mapValues here will return the same structure as todosById
		state.update("todosById", todos => _.mapValues(todos, todo => {
			todo.completed = checked;
			return todo;
		}));
	},
	
	toggle: function(t) {
		state.update("todosById", todos => {
			var todo = todos[t.id];
			todo.completed = !todo.completed;
			return todos;
		});
	},
	
	destroy: function(t) {
		state.update("todosById", todos => {
			delete todos[t.id];
			return todos;
		});
	},
	
	save: function(t, text) {
		state.update("todosById", todos => {
			todos[t.id].title = text;
			return todos;
		});
	},
	
	clearCompleted: function() {
		var activeById = {};
		_.each(state.get('activeTodoIds'), t => activeById[t.id] = t);
		state.set("todosById", activeById);
	}
};


computed({

	allTodoIds: [
		['todosById'],
		todosById => _(todosById).sortBy('id').pluck('id').value()
	],

	activeTodoIds: [
		['todosById'],
		todosById => _(todosById).filter({completed: false}).sortBy('id').pluck('id').value()
	],

	completedTodoIds: [
		['todosById'],
		todosById => _(todosById).filter({completed: true}).sortBy('id').pluck('id').value()
	]
});