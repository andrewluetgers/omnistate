
module.exports = function(app) {
	// force some auth
	//app.all('/api/*', app.passwordless.restricted({originField: 'origin', failureRedirect: '/login'}));

	app.get("/api/*", function(req, res, next) {
		res.json({err: "no API implemented yet"});
	});
};


