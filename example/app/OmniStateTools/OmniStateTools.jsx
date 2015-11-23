
var React =     require('react'),
	_ =         require('lodash'),
    omni = 	    require('omnistate');



var last = new Date(),
    fmtDate = function(ts) {
	    var d = new Date(ts),
	        diff = d.getTime() - last.getTime(),
	        diffAbs = Math.abs(diff),
	        timeDiff = diff + "ms",
	        time = d.toTimeString().split(" ")[0],
	        h = parseInt(time.split(":")[0]),
	        m = time.split(":")[1],
	        s = time.split(":")[2],
	        dp = h>12 ? "PM" : "AM",
	        t = [h%12 || 12, m, s, d.getMilliseconds()].join(":");

	    if (diffAbs > 1000) {
		    if (diffAbs > 1000 && diffAbs < 60 * 1000) {
			    timeDiff = Math.round(diff / 100)/10 + "s";
		    } else if (diffAbs > 60 * 1000 && diffAbs < 60 * 60 * 1000) {
			    timeDiff = Math.round(diff / (60 * 100))/10 + " mins"
		    } else if (diffAbs > 60 * 60 * 1000 && diffAbs < 24 * 60 * 60 * 1000) {
			    timeDiff = Math.round(diff / (60 * 60 * 100))/10 + " hours"
		    } else if (diffAbs > 24 * 60 * 60 * 1000) {
			    timeDiff = Math.round(diff / (60 * 60 * 100))/10 + " days"
		    }
	    }

	    last = d;
	    return {
		    diff: timeDiff,
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
		if (this.state.view == "log") {
			//console.log("change", omni.state.history.getLog());
			this.update();
		}
	},

	update: function() {
		this.isMounted() && this.forceUpdate();
	},

	getLogEvents: function() {
		var self = this,
		    currentTs = omni.state.history.getCurrentTs(),
			vals = omni.state.history.getLog(),
		    showLog = this.state.view == "log",
			items = showLog ? vals.log : vals.checkpoints;

		return _.map(items, function(log) {

			function minMax(e) {
				e.stopPropagation();
				log.max = !log.max;
				self.update();
				console.log(log);
			}

			var d = fmtDate(log.ts),
			    val = "val" in log ? log.val : log.cp,
			    valIsObj = typeof val == "object",
				path = log.path
					? <div className="path">{log.path.join ? log.path.join(".") : log.path}</div>
					: "";

			return (
				<li key={log.ts} className={currentTs == log.ts ? "active" : ""} onClick={()=>self.skipTo(log.ts)}>
					<h3 className="title">
						<span className="time">{d.time}</span>
						<span className="timeDiff">{d.diff}</span>
						<br className="clear" />
					</h3>
					{path}
					<pre className="state" onClick={minMax}>
						{valIsObj ? JSON.stringify(val, null, log.max ? 2 : null) : val+""}
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

			<ul>{this.getLogEvents()}</ul>
		</div>
	);
});








