
import {state} from 'omnistate'


var _id = 1000;
function id() {return _id+=1}

function setTodos(updFn) {
	state.update("todos", updFn);
}

export default {

	init: function() {
		setTodos(() => []);
	},

	addTodo: function(title) {
		setTodos(todos => todos.concat({
			id: id(),
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