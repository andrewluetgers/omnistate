
import {state} from 'omnistate'

function uid() {return new Date().getTime()}

function setTodos(updFn) {
	state.update("todos", updFn);
}

export default {

	init: function() {
		state.merge({
			todos: [],
			activeTodos: [],
			completedTodos: []
		});
	},

	addTodo: function(title) {
		setTodos(todos => todos.concat({
			id: uid(),
			title: title,
			completed: false
		}));
	},
	
	toggleAll: function(checked) {
		setTodos(todos => todos.map(todo => _.assign(todo, {completed: checked})));
	},
	
	toggle: function(todoToToggle) {
		setTodos(todos =>
			todos.map(todo => {
				return todo.id == todoToToggle.id
					? _.assign(todo, {completed: !todo.completed})
					: todo;
			})
		);
	},
	
	destroy: function(todo) {
		setTodos(todos => todos.filter(candidate => candidate.id != todo.id));
	},
	
	save: function(todoToSave, text) {
		setTodos(todos =>
			todos.map(todo =>
				todo.id == todoToSave.id
					? _.assign(todo, {title: text})
					: todo
		));
	},
	
	clearCompleted: function() {
		setTodos(todos => todos.filter(todo => !todo.completed));
	}
};