exports.getUniversalPrayers = (req, res) => {
	const db = req.app.get("db");
	const universalPrayers = db.prepare("SELECT id, chorus FROM UniversalPrayer ORDER BY id").all();
	res.render("pages/universal_prayers/universal_prayers.ejs", {
		title: "Liste des prières universelles",
		universalPrayers: universalPrayers
	});
};

exports.getUniversalPrayer = (req, res) => {
	const db = req.app.get("db");
	const { id } = req.params;
	const universalPrayer = db.prepare("SELECT chorus FROM UniversalPrayer WHERE id = ?").get(id);
	res.render("pages/universal_prayers/universal_prayer.ejs", {
		title: "Détail du chant",
		universalPrayer: universalPrayer
	});
};

exports.deleteUniversalPrayer = (req, res) => {
	const db = req.app.get("db");
	const { id } = req.params;
	db.prepare("DELETE FROM UniversalPrayer WHERE id = ?").run(id);
	
	req.flash("flashType", "success");
	req.flash("flashMessage", "Prière universelle supprimée.");
	res.redirect("/mass/universal-prayers");
};

exports.editUniversalPrayer = (req, res) => {
	const db = req.app.get("db");
	const { id } = req.params;

	if (!req.body.chorus) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Informations manquantes.");
		req.redirect("/mass/universal-prayers/" + id);
		return;
	}

	const { chorus } = req.body;
	const existingUniversalPrayer = db.prepare("SELECT * FROM UniversalPrayer WHERE chorus = ? AND id != ?")
		.get(chorus, id);

	if (existingUniversalPrayer) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Une prière universelle avec ce titre existe déjà.");
		req.redirect("/mass/universal-prayers/" + id);
		return;
	}

	db.prepare("UPDATE UniversalPrayer SET chorus = ? WHERE id = ?").run(chorus, id);
	req.flash("flashType", "success");
	req.flash("flashMessage", "Prière universelle modifiée.");
	res.redirect("/mass/universal-prayers/" + id);
};

exports.getNewUniversalPrayer = (req, res) => {
	res.render("pages/universal_prayers/new_universal_prayer.ejs", {
		title: "Ajout d'une prière universelle"
	});
};

exports.postNewUniversalPrayer = (req, res) => {
	const db = req.app.get("db");

	if (!req.body.chorus) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Informations manquantes.");
		res.redirect("/mass/universal-prayers/new");
		return;
	}

	const { chorus } = req.body;
	const existingUniversalPrayer = db.prepare("SELECT * FROM UniversalPrayer WHERE chorus = ?")
		.get(chorus);

	if (existingUniversalPrayer) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Une prière universelle avec ce titre existe déjà.");
		res.redirect("/mass/universal-prayers/new");
		return;
	}

	db.prepare("INSERT INTO UniversalPrayer (chorus) VALUES (?)").run(chorus);
	const { id } = db.prepare("SELECT id FROM UniversalPrayer WHERE chorus = ?").get(chorus);

	req.flash("flashType", "success");
	req.flash("flashMessage", "Prière universelle créée.");
	res.redirect("/mass/universal-prayers/" + id);
};