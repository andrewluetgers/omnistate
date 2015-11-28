
var React =	 require('react'),
	_ =		 require('lodash'),
	omni = 		require('omnistate');



var last = new Date(),
	fmtDate = function(ts) {
		var d = new Date(ts);

		d = new Date(d.getTime() - last.getTime());

		var h = d.getUTCHours()%12,
			m = d.getUTCMinutes(),
			s = d.getUTCSeconds(),
			t = (h ? h + ":" : "")
				+ (m ? (m<10 ? "0"+m : m) + " " : "")
				+ (s ? (s<10 ? "0"+s : s) + "s " : "")
				+ d.getMilliseconds() + "ms";

		return {
			time:  t,
			date: d.toDateString()
		};
	};


var OmniStateHistoryItem = omni.component('OmniStateHistoryItem', {

	//mixins: [Pure],

	shouldComponentUpdate: function(n) {
		var p = this.props;
		return p.active != n.active || p.log != n.log;
	},

	update: function() {
		this.isMounted() && this.forceUpdate();
	},

	skipTo: function(ts) {
		omni.state.history.skipTo(ts);
		this.props.setState({recording: false});
	}

}, function() {

	var self = this,
		log = this.props.log;

	function minMax(e) {
		e.stopPropagation();
		log.max = !log.max;
		self.update();
		console.log(log);
	}

	var d = fmtDate(log.ts),
		val = "val" in log ? log.val : log.cp,
		pathStr = (log.path && log.path.join) ? log.path.join(".") : log.path || "SNAPSHOT",
		valIsObj = typeof val == "object",
		path = log.path
				? <div className="path">{pathStr}</div>
				: "";

	return (
		<li className={this.props.active ? "active" : ""} onClick={()=>self.skipTo(log.ts)}>
			<h3 className="title">
				<span className="time">{d.time}</span>
				<br className="clear" />
			</h3>
			{path}
			<pre className="state" onClick={minMax}>
				{valIsObj ? JSON.stringify(val, null, log.max ? 2 : null) : val+""}
			</pre>
		</li>
	);
});



module.exports = omni.component('OmniStateTools', {

	getInitialState: function() {
		return {
			view:	   "log", // log|checkpoints
			recording:  false
		};
	},

	onStateChange: _.debounce(function() {
		if (this.state.view == "log") {
			//console.log("change", omni.state.history.getLog());
			this.update();
		}
	}, 5, {maxWait: 30}),

	update: function() {
		this.isMounted() && this.forceUpdate();
	},

	getLogEvents: function() {
		var self = this,
			showSize = 20,
			setState = function(val) {self.setState(val)},
			history = omni.state.history,
			vals = history.getLog(),
			currentTs = history.getCurrentTs(),
			showLog = this.state.view == "log",
			recording = this.state.recording,
			items = showLog
				? _.sortBy(([]).concat(vals.log, vals.autoSnaps), "ts")
				: vals.checkpoints;

		if (recording) {
			var len = items.length,
				size = (len-1 >= showSize) ? showSize : len-1;

			items = items.slice(len-size, len);
		}

		return _.map(items, function(log) {
			return <OmniStateHistoryItem key={log.ts+"_"+log.path} log={log} active={log.ts == currentTs} setState={setState}/>;
		}).reverse();
	},

	log: function() {
		this.setState({view: "log"});
	},

	checkPoints: function() {
		this.setState({view: "checkpoints"});
	},

	record: function() {
		last = new Date();
		omni.state.history.startLogging();
		this.setState({recording: true});
	},

	pause: function() {
		omni.state.history.pauseLogging();
		this.setState({recording: false});

	},

	stop: function() {
		omni.state.history.stopLogging();
		this.setState({recording: false});
	},

	recording: function(rec) {
		this.setState({recording: rec});
	},

	show: function() {
		this.setState({hide: false});
	},

	hide: function() {
		this.setState({hide: true});
	}


}, function() {

	var view = this.state.view,
		logActive = view == "log",

		recButton = this.state.recording
			? <button onClick={this.pause}>Pause</button>
			: <button onClick={this.record}>Record</button>;

	// todo https://github.com/tnrich/react-variable-height-infinite-scroller
	// snapshot every n changes
	// gen snapshot and laod it from changes without rendering each change
	// speed control
	// timeline
	// checkpointing add and remove load clear/unload
	return (
		<div id="OmniStateTools"
			 className={this.state.hide ? "hide" : ""}
			 onMouseOver={this.show}>

			<div className="buttons">
				<button onClick={this.hide}>&gt;&gt;</button>
				<button className={logActive ? "active" : ""} onClick={this.log}>Change Log</button>
				<button className={!logActive ? "active" : ""} onClick={this.checkPoints}>Checkpoints</button>
				{recButton}
				<button onClick={this.stop}>Clear</button>
			</div>

			<ul>
				{this.getLogEvents()}
				{this.state.recording ? <li>recording... showing 20 most recent states</li> : null}
			</ul>
		</div>
	);
});








