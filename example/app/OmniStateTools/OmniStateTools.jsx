
var React =     require('react'),
	_ =         require('lodash'),
    omni = 	    require('omnistate');



var last = new Date(),
    fmtDate = function(ts) {
	    var d = new Date(ts),
	        msDiff = d.getTime() - last.getTime(),
	        time = d.toTimeString().split(" ")[0],
	        h = parseInt(time.split(":")[0]),
	        m = time.split(":")[1],
	        s = time.split(":")[2],
	        dp = h>12 ? "PM" : "AM",
	        t = [h%12 || 12, m, s, d.getMilliseconds()].join(":");

	    last = d;
	    return {
		    msDiff: msDiff,
			time:  t + " " + dp,
		    date: d.toDateString()
	    };
    };


module.exports = omni.component('OmniStateTools', {

	getInitialState: function() {
		return {
			view:       "log", // log|checkpoints
			recording:  false
		};
	},

	onStateChange: function() {
		console.log("OSC");
		if (this.state.view == "log") {
			console.log("change", omni.state.history.getLog());
			this.update();
		}
	},

	update: function() {
		this.isMounted() && this.forceUpdate();
	},

	getLogEvents: function() {
		var self = this,
			vals = omni.state.history.getLog(),
		    showLog = this.state.view == "log",
			items = showLog ? vals.log : vals.checkpoints;

		return _.map(items, function(log) {

			function minMax() {
				log.max = !log.max;
				self.update();
				console.log(log);
			}

			var d = fmtDate(log.ts),
				path = log.path
					? <div className="path">{log.path.join ? log.path.join(".") : log.path}</div>
					: "";

			return (
				<li key={log.ts}>
					<h3 className="title" onClick={()=>self.skipTo(log.ts)}>
						<span className="time">{d.time}</span>
						<span className="msDiff">{"+"+d.msDiff+"ms"}</span>
						<span className="date">{d.date}</span>
						<br className="clear" />
					</h3>
					{path}
					<pre className="state" onClick={minMax}>
						{JSON.stringify("val" in log ? log.val : log.cp, null, log.max ? 2 : null)}
					</pre>
				</li>
			);
		}).reverse();
	},

	log: function() {
		this.setState({view: "log"});
	},

	checkPoints: function() {
		this.setState({view: "checkpoints"});
	},

	record: function() {
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

	skipTo: function(ts) {
		omni.state.history.skipTo(ts);
		this.setState({recording: false});
	}


}, function() {

	console.log("RENDER OmniStateTools");

	var view = this.state.view,
	    logActive = view == "log",
	    recButton = this.state.recording
			? <button onClick={this.pause}>Pause</button>
			: <button onClick={this.record}>Record</button>;

	return (
		<div id="OmniStateTools">
			<div>
				<button className={logActive ? "active" : ""} onClick={this.log}>Change Log</button>
				<button className={!logActive ? "active" : ""} onClick={this.checkPoints}>Checkpoints</button>
				{recButton}
				<button onClick={this.stop}>Clear</button>
			</div>

			<ul>{this.getLogEvents()}</ul>
		</div>
	);
});








