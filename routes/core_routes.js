const bcrypt = require("bcrypt");

exports.getHome = (req, res) => {
	res.render("pages/core/home.ejs", { title: "Accueil" });
};

exports.getLogin = (req, res) => {
	res.render("pages/core/login.ejs", { title: "Connexion" });
};

exports.postLogin = (req, res) => {
	const db = req.app.get("db");

	if (!req.body.username || !req.body.password) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Informations manquantes.");
		res.redirect("/login");
		return;
	}

	const { username, password } = req.body;
	const admin = db.prepare("SELECT password_hash FROM Admin WHERE username = ?").get(username);
	
	if (!admin) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Nom d'utilisateur inconnu.");
		res.redirect("/login");
		return;
	}

	if (!bcrypt.compareSync(password, admin.password_hash)) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Mot de passe incorrect.");
		res.redirect("/login");
		return;
	}
	
	req.session.username = username;
	res.redirect("/");
};

exports.getLogout = (req, res) => {
	req.session.destroy();
	res.redirect("/");
};