
import React from 'react'
import {component} from 'omnistate'
import OmniStateTools from 'omnistate-tools'
import Header from '../Header/Header.jsx'
import TodoItems from '../TodoItems/TodoItems.jsx'
import Footer from '../Footer/Footer.jsx'


export default component("TodoApp", function() {
	return (
		<div>
			<Header/>
			<TodoItems/>
			<Footer/>
			<OmniStateTools/>
		</div>
	);
});