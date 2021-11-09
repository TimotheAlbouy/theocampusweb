const bcrypt = require("bcrypt");

exports.getLogin = function(req, res) {
	res.render("/views/pages/login.ejs");
}

exports.postLogin = function(req, res) {
	const db = req.app.get("db");
	const { username, password } = req.body;
	const stmt = db.prepare("SELECT password_hash FROM Admin WHERE username = ?");
	const admin = stmt.get(username);
	
	if (!admin) {
		// flash message: username not found
		res.redirect("/login");
	}

	if (bcrypt.compareSync(password, admin.password_hash)) {
		// flash message: incorrect password
		res.redirect("/login");
	}
	
	const sess = req.session;
	sess.username = username;
	res.redirect("/mass");
}