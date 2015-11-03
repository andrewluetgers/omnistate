
var React =         require('react'),
    Link = 			require('react-router').Link,
    D =			    require('../../common/Direct/Direct.jsx'),
    If =			require('../../common/If/If.jsx'),
    component = 	require('../../common/component/component'),
    state =         require('../../state/state'),
    alphaState =    require('../../state/alpha/alpha');


var AlphaCell = component('AlphaCell', {


	dataBindings: {
		cell: 'alpha.layout.0.0'
		// will create a this.cell property which is a continually updated
		// serialized copy of the immutable state at the provided path
		// any updated to the path will force a render of the component
		// with the new state. In this case we will override the example
		// path via the dataBindings property, see getCell in AlphaTable below
	}

}, function() {
	return (
		<td style={{backgroundColor: this.cell.active ? this.cell.color : "#444444"}}>{this.cell.letter}</td>
	);
});



var AlphaTable = component('AlphaTable', {

	getters: {
		layout: "alpha.layout"
		// will create a this.getLayout function
		// getters are useful when you want easy access
		// to some part of the state but do not need data binding to it
		// in this case if we were to use dataBindings instead
		// this component would re-render every time a cell changed
		// thats because a change deeper in the state is seen as a change
		// inn all of its parents. This would be expensive because that would
		// kick off 10000 calls to shouldComponentUpdate, one for each cell
		// it would do this for each and every cell update,
		// that would be very slow
	},

	getCell: function(path) {
		return (
			<AlphaCell key={path} dataBindings={{cell: 'alpha.layout.'+path}} />
		);
	},

	getRow: function(row, rowIndex) {
		var cells = row.map((cell, cellIdx) => {
			return this.getCell(rowIndex+"."+cellIdx);
		});

		return <tr key={rowIndex}>{cells}</tr>;
	},

	getRows: function(rows) {
		return rows
			? rows.map(this.getRow)
			: <tr><td>no data</td></tr>
	}

}, function() {
	return (
		<table id="alphaTable"><tbody>{this.getRows(this.getLayout())}</tbody></table>
	);
});


var cleared = true;

module.exports = component('AlphaTable', {

	dataBindings: {
		alphTableVisible: "alphTableVisible"
	},

	running: false,

	updateTable: function(ms) {
		var self = this;
		stats.setMode(0);

		function update(ms) {
			stats.end();
			stats.begin();

			alphaState.toggleRandomCell();

			//cleared = !cleared;
			//cleared
			//	? alphaState.clearTheTable()
			//	: alphaState.fillTheTable();

			self.running && setTimeout(update, ms);
		}

		update(ms);
	},

	start: function() {
		this.running = true;
		this.updateTable(0);
	},

	stop: function() {
		this.running = false;
	},

	fill: function() {
		alphaState.fillTheTable();
	},

	clear: function() {
		alphaState.clearTheTable();
	},

	componentWillUnmount: function() {
		this.stop();
	},

	toggleVisibility: function() {
		state.update("alphTableVisible", v=>!v);
	}

}, function() {

	return (
		<div>
			<button onClick={this.start}>Start</button>
			<button onClick={this.stop}>Stop</button>
			<button onClick={this.fill}>Fill</button>
			<button onClick={this.clear}>Clear</button>
			<button onClick={this.toggleVisibility}>{this.alphTableVisible ? "Hide" : "Show"}</button>
			<div className={this.alphTableVisible ? "" : "hide"}>
				<AlphaTable id="alphaTable"/>
			</div>
		</div>
	);
});




