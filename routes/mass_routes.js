const path = require("path");

const MassSlidesGenerator = require("../util/mass_slides_generator.js");

exports.getSlides = (req, res) => {
	res.sendFile("slides.pdf", { root: path.join(__dirname, "..") });
};

exports.getMass = (req, res) => {
	const db = req.app.get("db");
	const entranceSongTitles = db.prepare("SELECT title FROM Song, EntranceSong WHERE Song.id = EntranceSong.id")
		.all().map(song => song.title);
	const universalPrayerChoruses = db.prepare("SELECT chorus FROM UniversalPrayer")
		.all().map(universalPrayer => universalPrayer.chorus);
	const offertorySongTitles = db.prepare("SELECT title FROM Song, OffertorySong WHERE Song.id = OffertorySong.id")
		.all().map(song => song.title);
	const communionSongTitles = db.prepare("SELECT title FROM Song, CommunionSong WHERE Song.id = CommunionSong.id")
		.all().map(song => song.title);
	const recessionalSongTitles = db.prepare("SELECT title FROM Song, RecessionalSong WHERE Song.id = RecessionalSong.id")
		.all().map(song => song.title);
	
	res.render("pages/mass/mass.ejs", {
		title: "Générateur de diaporama de messe",
		entranceSongTitles: entranceSongTitles,
		universalPrayerChoruses: universalPrayerChoruses,
		offertorySongTitles: offertorySongTitles,
		communionSongTitles: communionSongTitles,
		recessionalSongTitles: recessionalSongTitles
	});
};

exports.postMass = async (req, res) => {
	const db = req.app.get("db");

	if (
		!req.body.entranceSongTitle || !req.body.universalPrayerChorus ||
		!req.body.offertorySongTitle || !req.body.communionSongTitle ||
		!req.body.recessionalSongTitle
	) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Informations manquantes.");
		res.redirect("/mass");
		return;
	}

	const {
		entranceSongTitle,
		universalPrayerChorus,
		offertorySongTitle,
		communionSongTitle,
		recessionalSongTitle
	} = req.body;

	let sql = "SELECT lyrics FROM Song WHERE title = ?";
	
	let stmt = db.prepare(sql);
	const entranceSong = stmt.get(entranceSongTitle);
	stmt = db.prepare(sql);
	const offertorySong = stmt.get(offertorySongTitle);
	stmt = db.prepare(sql);
	const communionSong = stmt.get(communionSongTitle);
	stmt = db.prepare(sql);
	const recessionalSong = stmt.get(recessionalSongTitle);
	const universalPrayer = db.prepare("SELECT chorus FROM UniversalPrayer WHERE chorus = ?")
		.get(universalPrayerChorus);

	if (!entranceSong || !universalPrayer || !offertorySong || !communionSong || !recessionalSong) {
		req.flash("flashType", "error");
		req.flash("flashMessage", "Au moins un des chants renseignés n'existe pas.");
		res.redirect("/mass");
		return;
	}

	const generator = new MassSlidesGenerator();
	const slides = await generator.generateSlides(
		entranceSongTitle, entranceSong.lyrics,
		universalPrayerChorus,
		offertorySongTitle, offertorySong.lyrics,
		communionSongTitle, communionSong.lyrics,
		recessionalSongTitle, recessionalSong.lyrics
	);
	slides.save("slides.pdf");

  res.status(201);
  res.send(""); 
};