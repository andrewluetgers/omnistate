
import React from 'react'
import {component} from 'omnistate'
import todoState from '../../state/todos/todos'
import TodoItem from '../TodoItem/TodoItem.jsx'


export default component("TodoItems", {
	
	proxies: {
		todos: 'todos',
		showing: 'showing',
		editing: 'editing',
		activeTodoCount: 'activeCount'
	},
	
	toggleAll: function(event) {
		todoState.toggleAll(event.target.checked);
	},

	getShownTodos: function() {
		return this.todos.filter(todo => {
			console.log("filter todo", this.showing, todo);
			switch (this.showing) {
				case 'active':      return !todo.completed;
				case 'completed':   return todo.completed;
				default:            return true;
			}
		});
	},

	getTodoItems: function() {
		return this.getShownTodos().map((todo, idx) => {
			console.log("shown todo", todo, idx);
			return (
				<TodoItem key={todo.id} proxies={{todo: 'todos.'+idx}} />
			);
		});
	}
	
}, function() {

	var todos = this.todos,
	    len = todos && todos.length;
	
	return len ? (
		<section className="main">

			<input
				className="toggle-all"
				type="checkbox"
				onChange={this.toggleAll}
				checked={this.activeCount === 0}
			/>

			<ul className="todo-list">
				{this.getTodoItems()}
			</ul>

		</section>
	) : null;
});

