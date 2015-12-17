
import React from 'react'
import {component} from 'omnistate'
import todoState from '../../state/todos/todos'
import TodoItem from '../TodoItem/TodoItem.jsx'


export default component("TodoItems", {
	
	proxies: {
		allTodoIds: 'allTodoIds',
		completedTodoIds: 'completedTodoIds',
		activeTodoIds: 'activeTodoIds',
		showing: 'showing',
		editing: 'editing'
	},
	
	toggleAll: function(event) {
		todoState.toggleAll(event.target.checked);
	},

	getShownTodos: function() {
		switch (this.showing) {
			case 'active':      return this.activeTodoIds;
			case 'completed':   return this.completedTodoIds;
			default:            return this.allTodoIds;
		}
	},

	getTodoItems: function() {
		return this.getShownTodos().map((todoId) => {
			return (
				<TodoItem key={todoId} proxies={{todo: 'todosById.'+todoId}} />
			);
		});
	}
	
}, function() {

	var len = this.allTodoIds && this.allTodoIds.length;
	
	return len ? (
		<section className="main">

			<input
				className="toggle-all"
				type="checkbox"
				onChange={this.toggleAll}
				checked={this.activeTodoIds.length === 0}
			/>

			<ul className="todo-list">
				{this.getTodoItems()}
			</ul>

		</section>
	) : null;
});

