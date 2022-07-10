const path = require("path");

const MassSlidesGenerator = require("../util/mass_slides_generator.js");
const generateWhatsappMessage = require("../util/mass_message_generator.js");
const { NO_SONG } = require("../util/constants.js");
const { getPsalmChorus } = require("../util/util.js");

exports.getSlides = (req, res) => {
	res.sendFile("slides.pdf", { root: path.join(__dirname, "..") });
};

exports.getMass = (req, res) => {
	const db = req.app.get("db");
	const entranceSongTitles = db.prepare("SELECT title FROM Song, EntranceSong WHERE Song.id = EntranceSong.id")
		.all().map(song => song.title);
	const universalPrayerChoruses = db.prepare("SELECT chorus FROM UniversalPrayer ORDER BY chorus")
		.all().map(universalPrayer => universalPrayer.chorus);
	const offertorySongTitles = db.prepare("SELECT title FROM Song, OffertorySong WHERE Song.id = OffertorySong.id")
		.all().map(song => song.title);
	const communionSongTitles = db.prepare("SELECT title FROM Song, CommunionSong WHERE Song.id = CommunionSong.id")
		.all().map(song => song.title);
	const recessionalSongTitles = db.prepare("SELECT title FROM Song, RecessionalSong WHERE Song.id = RecessionalSong.id")
		.all().map(song => song.title);
	
	res.render("pages/mass/mass.ejs", {
		title: "Générateur de support de messe",
		entranceSongTitles: entranceSongTitles,
		universalPrayerChoruses: universalPrayerChoruses,
		offertorySongTitles: offertorySongTitles,
		communionSongTitles: communionSongTitles,
		recessionalSongTitles: recessionalSongTitles,
		noSong: NO_SONG
	});
};

exports.postMass = async (req, res) => {
	const db = req.app.get("db");

	const {
		entranceSongTitle,
		offertorySongTitle,
		communionSongTitle,
		recessionalSongTitle,
		date
	} = req.body;
	let { universalPrayerChorus } = req.body;

	const sqlSong = "SELECT title, lyrics FROM Song WHERE title = ?";
	const sqlUP =  "SELECT chorus FROM UniversalPrayer WHERE chorus = ?";
	let entranceSong = null;
	let offertorySong = null;
	let communionSong = null;
	let recessionalSong = null;
	let addGloria = false;
	
	if (entranceSongTitle !== NO_SONG)
		entranceSong = db.prepare(sqlSong).get(entranceSongTitle);
	if (offertorySongTitle !== NO_SONG)
		offertorySong = db.prepare(sqlSong).get(offertorySongTitle);
	if (communionSongTitle !== NO_SONG)
		communionSong = db.prepare(sqlSong).get(communionSongTitle);
	if (recessionalSongTitle !== NO_SONG)
		recessionalSong = db.prepare(sqlSong).get(recessionalSongTitle);
	
	if (universalPrayerChorus !== NO_SONG) {
		universalPrayerChorus = db.prepare(sqlUP).get(universalPrayerChorus);
		if (universalPrayerChorus)
			universalPrayerChorus = universalPrayerChorus.chorus;
	} else universalPrayerChorus = null;

	if (req.body.addGloria === "true")
		addGloria = true;
	
	let dateObj = new Date(date);
	if (dateObj.toString() === "Invalid Date")
		dateObj = new Date();
	
	const psalmChorus = await getPsalmChorus(dateObj);
	
	const generator = new MassSlidesGenerator();
	const slides = await generator.generateSlides(
		entranceSong, psalmChorus, universalPrayerChorus,
		offertorySong, communionSong, recessionalSong,
		dateObj, addGloria
	);
	slides.save("slides.pdf");

	const whatsappMessage = generateWhatsappMessage(
		entranceSong, psalmChorus, universalPrayerChorus,
		offertorySong, communionSong, recessionalSong,
		dateObj
	);

	res.status(201);
	res.send(whatsappMessage); 
};
