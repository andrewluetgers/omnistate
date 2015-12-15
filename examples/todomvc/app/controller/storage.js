
import {debounce} from 'lodash'
import omni from 'omnistate'

var history = omni.state.history;

export default omni.controller("saveState", {

	// load saved app state
	load: function() {
		history.loadLatestCheckpoint();
	},

	save: function() {
		history.clearCheckpoints();
		history.checkpoint();
	},

	onStateChange: debounce(function() {
		console.log("state saved", omni.state.replica);
		this.save();
	}, 500, {maxWait: 5000})
});