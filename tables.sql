DROP TABLE IF EXISTS Admin;
CREATE TABLE Admin (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL
);

DROP TABLE IF EXISTS Song;
CREATE TABLE Song (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT UNIQUE NOT NULL,
	lyrics TEXT NOT NULL
);

DROP TABLE IF EXISTS EntranceSong;
CREATE TABLE EntranceSong (
	id INTEGER PRIMARY KEY REFERENCES Song(id)
);

DROP TABLE IF EXISTS UniversalPrayer;
CREATE TABLE UniversalPrayer (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	chorus TEXT UNIQUE NOT NULL
);

DROP TABLE IF EXISTS OffertorySong;
CREATE TABLE OffertorySong (
	id INTEGER PRIMARY KEY REFERENCES Song(id)
);

DROP TABLE IF EXISTS CommunionSong;
CREATE TABLE CommunionSong (
	id INTEGER PRIMARY KEY REFERENCES Song(id)
);

DROP TABLE IF EXISTS RecessionalSong;
CREATE TABLE RecessionalSong (
	id INTEGER PRIMARY KEY REFERENCES Song(id)
);

-- example query for inserting an admin (password = 'admin')
INSERT INTO Admin (username, password_hash)
VALUES ('admin', '$2b$10$CMpTthysoSKwIMy1YDsRj.4ms0wZKQDFk2V5shKvsWUzE.j4p88NG');