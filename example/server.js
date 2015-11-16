var os = 				require('os'),
    express = 			require('express'),
    path =				require('path'),
    favicon =			require("serve-favicon"),
	serveStatic =		require("serve-static"),
	bodyParser =		require("body-parser"),
	session = 			require("express-session"),
	compression =		require('compression'),
	cookieParser = 		require("cookie-parser"),
	dot = 				require("dot"),
    _ =					require("lodash");

// config
var env = 				process.env,
    nodeEnv = 			env.NODE_ENV,
	runningLocal =      nodeEnv === "local",
	runningHot =      	env.BUILD_ENV == "hot",
	processTitle = 		"omni",
	secret =            "s;lsj_a;fljaslqk23-98714#2kzlkjh42a3+=1l12ljhbljf",
	port = 				process.env.PORT || 3000,
	appRoot = 			"",
	staticDir = 		path.join(__dirname, '/build'),
    pkg = 			    require('./package.json'),
	sessionStore = 		new session.MemoryStore(),
	sessionTtl = 		1000 * 60 * 60 * 24;


var app = express();
app.use(compression({threshold: 512}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(appRoot, serveStatic(staticDir));
app.use(favicon(staticDir + "/assets/favicon.ico"));
app.use(session({
	name: 	"sid",
	proxy: 	!runningLocal,
	secret: secret,
	cookie: {
		path: '/',
		rolling: true,
		httpOnly: true,
		secure: !runningLocal,
		maxAge: 1000 * 60 * 30
	},
	store: 	sessionStore,
	resave: true,
	saveUninitialized: false
}));


app.use(session({
	name: 		"sid",
	secret: 	secret,
	cookie: 	{httpOnly: true, secure: false, maxAge: sessionTtl},
	store: 		sessionStore,
	resave: 	false,
	saveUninitialized: false
}));

app.use(bodyParser.json());


require('./api/api.js')(app);


// Serve up the single page app template
var routes = require('./appRoutes').routes,
	template = dot.process({path: staticDir + "/assets"}),
	validRoutes = _.map(routes, function(r) {return r.route;}),
	hotLoad = runningLocal && runningHot,
	script = runningHot
			? "http://localhost:3001" + appRoot + "/assets/"+pkg.name+".js"
			: appRoot + "/assets/"+pkg.name+".js";

var initialState = {user: null};

app.get(validRoutes, function (req, res, next) {
	res.send(template.index({
		title: 		'OmniStruct Demo',
		cssPath: 	hotLoad ? "" : appRoot + "/assets/" + pkg.name + ".css",
		scriptSrc: 	script,
		appRoot:	appRoot,
		host:       os.hostname(),
		appState: 	JSON.stringify(initialState)
	}));
});


// Handle 500
app.use(function(error, req, res, next) {
	if (error) {
		console.log(error);
		res.status(500).send("500");
	} else {
		next();
	}
});


// Handle 404
app.use(function(req, res) {
	res.status(404).send("404");
});


process.addListener("uncaughtException", function (err, stack) {
	console.log("Caught exception: " + err);
	console.log((err.stack || stack || "").split("\n"));
});


app.listen(port);
console.log(processTitle +' ENV='+ nodeEnv +' started on port '+ port);