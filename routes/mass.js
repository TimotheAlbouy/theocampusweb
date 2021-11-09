exports.getMass = function(req, res) {
	const db = req.app.get("db");
	const entrySongNames = db.all("SELECT name FROM Song, EntrySong WHERE Song.id = EntrySong.id")
		.map(song => song.name);
	const universalPrayerSongNames = db.all("SELECT name FROM Song, UniversalPrayerSong WHERE Song.id = UniversalPrayerSong.id")
		.map(song => song.name);
	const offertorySongNames = db.all("SELECT name FROM Song, OffertorySong WHERE Song.id = OffertorySong.id")
		.map(song => song.name);
	const communionSongNames = db.all("SELECT name FROM Song, CommunionSong WHERE Song.id = CommunionSong.id")
		.map(song => song.name);
	const sendingSongNames = db.all("SELECT name FROM Song, SendingSong WHERE Song.id = SendingSong.id")
		.map(song => song.name);
	
	const admin = stmt.get(username);
	res.render("/templates/messe.ejs", {
		entrySongNames: entrySongNames,
		universalPrayerSongName: universalPrayerSongNames,
		offertorySongName: offertorySongNames,
		communionSongName: communionSongNames,
		sendingSongName: sendingSongNames
	});
};

exports.postMass = function(req, res) {
	const db = req.app.get("db");
	const {
		entrySongName,
		universalPrayerSongName,
		offertorySongName,
		communionSongName,
		sendingSongName
	} = req.body;

	const sql = "SELECT lyrics FROM Song WHERE name = ?";
	let stmt = db.prepare(sql);
	const entrySongLyrics = stmt.get(entrySongName).lyrics;
	stmt = db.prepare(sql);
	const universalPrayerSongLyrics = stmt.get(universalPrayerSongName).lyrics;
	stmt = db.prepare(sql);
	const offertorySongLyrics = stmt.get(offertorySongName).lyrics;
	stmt = db.prepare(sql);
	const communionSongLyrics = stmt.get(communionSongName).lyrics;
	stmt = db.prepare(sql);
	const sendingSongLyrics = stmt.get(sendingSongName).lyrics;

  res.status(201);
  res.send(""); 
};

exports.getSlides = function(req, res) {
	res.sendFile("/slides.pdf");
};