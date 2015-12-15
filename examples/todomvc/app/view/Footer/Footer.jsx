
import React from 'react'
import {Link} from 'react-router'
import {component} from 'omnistate'
import todoState from '../../state/todos/todos'


export default component("Footer", {

	proxies: {
		count: 'count',
		completedCount: 'completedCount',
		showing: 'showing',
		todos: 'todos'
	}

}, function() {

	var showing =            this.showing,
		allClass =          showing == "all" ? 'selected' : '',
		activeClass =       showing == "active" ? 'selected' : '',
		completedClass =    showing == "completed" ? 'selected' : '',
		activeTodoWord =    this.count == 1 ? 'item' : 'items',
		clearButton =       null;

	if (this.completedCount > 0) {
		clearButton = (
			<button
				className="clear-completed"
				onClick={todoState.clearCompleted}>
				Clear completed
			</button>
		);
	}

	return this.count ? (
		<footer className="footer">

			<span className="todo-count">
				<strong>{this.count}</strong> {activeTodoWord} left
			</span>

			<ul className="filters">
				<li><Link to="/" className={allClass}>All</Link></li>
				<li><Link to="/active" className={activeClass}>Active</Link></li>
				<li><Link to="/completed" className={completedClass}>Completed</Link></li>
			</ul>

			 {clearButton}

		</footer>
	) : null;
});
