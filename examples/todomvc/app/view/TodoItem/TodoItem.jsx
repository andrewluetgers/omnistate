
import React from 'react'
import omni from 'omnistate'
import classNames from 'classnames'
import todoState from '../../state/todos/todos'


var ESCAPE_KEY = 27,
    ENTER_KEY = 13;

export default omni.component("TodoItem", {

	proxies: {
		todo: "todosById.xxxxxx",
		// will be overwritten by parent via proxies prop
		// e.g. <TodoItem proxies={{todo: "todosById." + id }}

		editing: 'editing',
		editText: 'editText'
	},

	toggle: function() {
		this.mergeTodo({completed: !this.todo.completed});
	},

	destroy: function() {
		todoState.destroy(this.todo);
	},

	edit: function() {
		this.setEditing(this.todo.id);
	},

	save: function(text) {
		this.mergeTodo({title: text});
		this.setEditing(null);
	},

	cancel: function() {
		this.setEditing(null);
	},

	handleSubmit: function() {
		var val = this.editText.trim();
		if (val) {
			this.setEditText(val);
			this.save(val);
		} else {
			this.destroy();
			this.setEditing(null);
		}
	},

	handleEdit: function() {
		this.setEditText(this.todo.title);
		this.edit();
	},

	handleKeyDown: function(event) {
		if (event.which === ESCAPE_KEY) {
			this.setEditText(this.todo.title);
			this.cancel();
		} else if (event.which === ENTER_KEY) {
			this.handleSubmit();
		}
	},

	handleChange: function(event) {
		if (this.editing == this.todo.id) {
			this.setEditText(event.target.value);
		}
	}

}, function() {

	if (!this.todo) {
		return null;
	}

	var classes = {
		completed: this.todo.completed,
		editing: this.editing == this.todo.id
	};

	console.log("RENDER", this.todo);

	return (
		<li className={classNames(classes)}>

			<div className="view">
				<input
					className="toggle"
					type="checkbox"
					checked={this.todo.completed}
					onChange={()=>this.toggle()}
				/>
				<label onDoubleClick={()=>this.handleEdit()}>{this.todo.title}</label>
				<button className="destroy" onClick={()=>this.destroy()} />
			</div>

			<input
				ref="editField"
				className="edit"
				value={this.editText}
				onBlur={()=>this.handleSubmit()}
				onChange={(e)=>this.handleChange(e)}
				onKeyDown={(e)=>this.handleKeyDown(e)}
			/>
		</li>
	);
});
