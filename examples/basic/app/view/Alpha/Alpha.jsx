
var React =         require('react'),
    If =			require('../../common/If/If.jsx'),
    component = 	require('omnistate').component,
    alphaState =    require('../../state/alpha/alpha');


var AlphaCell = component('AlphaCell', {
	proxies: {
		cell: 'alpha.layout.0.0' // provided by parent e.g. <Parent proxies={{cell: 'alpha.layout.0.0'}}/>
		// will create a this.cell property which is a continually updated
		// serialized copy of the immutable state at the provided path
		// any updated to the path will force a render of the component
		// with the new state. In this case we will override the example
		// path via the proxies property, see getCell in AlphaTable below
	}

}, function() {
	return (
		<li style={{backgroundColor: this.cell.active ? this.cell.color : "#444444"}}>{this.cell.letter}</li>
	);
});



var AlphaRow = component('AlphaRow', {
	proxies: {
		row:    '@alpha.layout.0',
		width:  'alpha.layout.0.length'
	}

}, function() {
	var cells = this.row.map((cell, cellIdx) => {
		var path = this.props.rowIndex+"."+cellIdx;
		return <AlphaCell key={path} proxies={{cell: 'alpha.layout.'+path}} />
	});

	return <ul>{cells}</ul>;
});



var AlphaTable = component('AlphaTable', {

	proxies: {
		layout: "@alpha.layout",
		//width: "alpha.width",
		height: "alpha.height"
		// will create a this.getLayout function
		// getters are useful when you want easy access
		// to some part of the state but do not need data binding to it
		// in this case if we were to use proxies instead
		// this component would re-render every time a cell changed
		// thats because a change deeper in the state is seen as a change
		// inn all of its parents. This would be expensive because that would
		// kick off 10000 calls to shouldComponentUpdate, one for each cell
		// it would do this for each and every cell update,
		// that would be very slow
	},

	//Cell: function(path) {
	//	return (
	//		<AlphaCell key={path} proxies={{cell: 'alpha.layout.'+path}} />
	//	);
	//},

	//Row: function(row, rowIndex) {
	//	var cells = row.map((cell, cellIdx) => {
	//		return this.Cell(rowIndex+"."+cellIdx);
	//	});
	//
	//	return <ul key={rowIndex}>{cells}</ul>;
	//},

	Rows: function(rows) {
		return rows.map(function(row, rowIndex) {
			return <AlphaRow key={rowIndex} rowIndex={rowIndex} proxies={{
						row: '@alpha.layout.'+rowIndex,
						width: 'alpha.layout.'+rowIndex+'.length'
					}} />
		});
	}

}, function() {
	return this.layout
		? <div id="alphaTable">{this.Rows(this.layout)}</div>
		: <ul><li>no data</li></ul>;
});


// todo support changing # of rows and # of cells per row
var cleared = true;

module.exports = component('Alpha', {

	proxies: {
		visible: "alpha.visible",
		width: "alpha.width",
		height: "alpha.height"
	},

	running: false,
	updateTable: function(ms) {
		var self = this;
		stats.setMode(0);

		function update(ms) {
			stats.end();
			stats.begin();

			alphaState.toggleRandomCell(self.width, self.height);

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
		alphaState.fillTheTable(this.width, this.height);
	},

	clear: function() {
		alphaState.clearTheTable(this.width, this.height);
	},

	componentWillUnmount: function() {
		this.stop();
	}

}, function() {
	return (
		<div>
			<div>
				<button onClick={()=> alphaState.newLayout(5, 5)}>5x5</button>
				<button onClick={()=> alphaState.newLayout(10, 5)}>10x5</button>
				<button onClick={()=> alphaState.newLayout(5, 10)}>5x10</button>
				<button onClick={()=> alphaState.newLayout(10, 10)}>10x10</button>
				<button onClick={()=> alphaState.newLayout(100, 100)}>100x100</button>
			</div>
			<button onClick={this.start}>Start</button>
			<button onClick={this.stop}>Stop</button>
			<button onClick={this.fill}>Fill</button>
			<button onClick={this.clear}>Clear</button>
			<button onClick={alphaState.toggleVisible}>{this.visible ? "Hide" : "Show"}</button>
			<div className={this.visible ? "" : "hide"}>
				<AlphaTable id="alphaTable"/>
			</div>
		</div>
	);
});


// kinda messy but stays out of the react profiling
window.stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '50px';
document.body.appendChild( stats.domElement );




