# Théocampus Web
Application web pour répertorier des outils Théocampus utiles

## Exporter la base de données en CSV
Lancer SQLITE3 sur le fichier de base de données :
`$ sqlite3 theocampusweb.db`

Lancer les commandes suivantes:
```
.headers on
.mode csv
.output songs.csv
SELECT Song.id, title, lyrics,
	EXISTS(SELECT 1 FROM EntranceSong WHERE Song.id = EntranceSong.id) AS isEntranceSong,
	EXISTS(SELECT 1 FROM OffertorySong WHERE Song.id = OffertorySong.id) AS isOffertorySong,
	EXISTS(SELECT 1 FROM CommunionSong WHERE Song.id = CommunionSong.id) AS isCommunionSong,
	EXISTS(SELECT 1 FROM RecessionalSong WHERE Song.id = RecessionalSong.id) AS isRecessionalSong
FROM Song;

.output universal_prayers.csv
SELECT id, chorus FROM UniversalPrayer;
```