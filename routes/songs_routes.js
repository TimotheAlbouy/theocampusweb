exports.getSongs = (req, res) => {
	const db = req.app.get("db");
	const songs = db.prepare("SELECT id, title, lyrics FROM Song").all();
	res.render("pages/songs/songs.ejs", { title: "Liste des chants", songs: songs });
};

exports.getSong = (req, res) => {
	const db = req.app.get("db");
	const { id } = req.params;
	const song = db.prepare("SELECT title, lyrics FROM Song WHERE id = ?").get(id);
	let stmt = db.prepare("SELECT * FROM EntranceSong WHERE id = ?");
	song.isEntranceSong = Boolean(stmt.get(id));
	stmt = db.prepare("SELECT * FROM OffertorySong WHERE id = ?");
	song.isOffertorySong = Boolean(stmt.get(id));
	stmt = db.prepare("SELECT * FROM CommunionSong WHERE id = ?");
	song.isCommunionSong = Boolean(stmt.get(id));
	stmt = db.prepare("SELECT * FROM RecessionalSong WHERE id = ?");
	song.isRecessionalSong = Boolean(stmt.get(id));
	res.render("pages/songs/song.ejs", { title: "Détail du chant", song: song });
};

exports.deleteSong = (req, res) => {
	const db = req.app.get("db");
	const { id } = req.params;
	
	db.prepare("DELETE FROM EntranceSong WHERE id = ?").run(id);
	db.prepare("DELETE FROM OffertorySong WHERE id = ?").run(id);
	db.prepare("DELETE FROM CommunionSong WHERE id = ?").run(id);
	db.prepare("DELETE FROM RecessionalSong WHERE id = ?").run(id);
	db.prepare("DELETE FROM Song WHERE id = ?").run(id);
	
	req.flash("flashType", "success");
	req.flash("flashMessage", "Chant supprimé.");
	res.redirect("/mass/songs");
};

exports.editSong = (req, res) => {
	const db = req.app.get("db");
	const { id } = req.params;

	if (!req.body.title || !req.body.lyrics) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Informations manquantes.");
		req.redirect("/mass/songs/" + id);
		return;
	}

	const { title, lyrics } = req.body;
	const existingSong = db.prepare("SELECT * FROM Song WHERE title = ? AND id != ?").get(title, id);

	if (existingSong) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Un chant avec ce titre existe déjà.");
		req.redirect("/mass/songs/" + id);
		return;
	}

	db.prepare("UPDATE Song SET title = ?, lyrics = ? WHERE id = ?").run(title, lyrics, id);
	db.prepare("DELETE FROM EntranceSong WHERE id = ?").run(id);
	db.prepare("DELETE FROM OffertorySong WHERE id = ?").run(id);
	db.prepare("DELETE FROM CommunionSong WHERE id = ?").run(id);
	db.prepare("DELETE FROM RecessionalSong WHERE id = ?").run(id);

	if (req.body.isEntranceSong)
		db.prepare("INSERT INTO EntranceSong (id) VALUES (?)").run(id);
	if (req.body.isOffertorySong)
		db.prepare("INSERT INTO OffertorySong (id) VALUES (?)").run(id);
	if (req.body.isCommunionSong)
		db.prepare("INSERT INTO CommunionSong (id) VALUES (?)").run(id);
	if (req.body.isRecessionalSong)
		db.prepare("INSERT INTO RecessionalSong (id) VALUES (?)").run(id);

	req.flash("flashType", "success");
	req.flash("flashMessage", "Chant modifié.");
	res.redirect("/mass/songs/" + id);
};

exports.getNewSong = (req, res) => {
	res.render("pages/songs/new_song.ejs", { title: "Ajout d'un chant" });
};

exports.postNewSong = (req, res) => {
	const db = req.app.get("db");

	if (!req.body.title || !req.body.lyrics) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Informations manquantes.");
		res.redirect("/mass/songs/new");
		return;
	}

	const { title, lyrics } = req.body;
	const existingSong = db.prepare("SELECT * FROM Song WHERE title = ?").get(title);

	if (existingSong) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Un chant avec ce titre existe déjà.");
		res.redirect("/mass/songs/new");
		return;
	}

	db.prepare("INSERT INTO Song (title, lyrics) VALUES (?, ?)").run(title, lyrics);
	const { id } = db.prepare("SELECT id FROM Song WHERE title = ?").get(title);

	if (req.body.isEntranceSong)
		db.prepare("INSERT INTO EntranceSong (id) VALUES (?)").run(id);
	if (req.body.isOffertorySong)
		db.prepare("INSERT INTO OffertorySong (id) VALUES (?)").run(id);
	if (req.body.isCommunionSong)
		db.prepare("INSERT INTO CommunionSong (id) VALUES (?)").run(id);
	if (req.body.isRecessionalSong)
		db.prepare("INSERT INTO RecessionalSong (id) VALUES (?)").run(id);

	req.flash("flashType", "success");
	req.flash("flashMessage", "Chant créé.");
	res.redirect("/mass/songs/" + id);
};
