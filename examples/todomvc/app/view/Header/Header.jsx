
import React from 'react'
import {component} from 'omnistate'
import todoState from '../../state/todos/todos'


var ENTER_KEY = 13;

export default component("Header", {

	proxies: {
		newTodo: 'newTodo'
	},

	handleChange: function(event) {
		this.setNewTodo(event.target.value);
	},

	handleNewTodoKeyDown: function(event) {
		if (event.keyCode == ENTER_KEY) {

			event.preventDefault();

			var val = this.newTodo.trim();

			if (val) {
				todoState.addTodo(val);
				this.setNewTodo('');
			}
		}
	}

}, function() {
	return (
		<header className="header">
			<h1>todos</h1>
			<input
				className="new-todo"
				placeholder="What needs to be done?"
				value={this.newTodo}
				onKeyDown={(e)=>this.handleNewTodoKeyDown(e)}
				onChange={(e)=>this.handleChange(e)}
				autoFocus={true}
			/>
		</header>
	);
});


