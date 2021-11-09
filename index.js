const express = require("express");
const session = require("express-session");
const sqlite3 = require("better-sqlite3").verbose();

const { getLogin, postLogin } = require("./routes/login.js");
const { getMass, postMass, getSlides } = require("./routes/mass.js");
const { getSongs, getSong, deleteSong, getNewSong, postNewSong } = require("./routes/songs.js");

const app = express();
const port = 8080;
app.use(express.urlencoded());
app.use(session(
	{
		secret: "blabla",
		saveUninitialized: false,
		resave: false
	}
));

const db = new sqlite3.Database("./beaulieuweb.db");

app.set("view engine", "ejs");
app.set("db", db);

app.get("/", (req, res) => {
	res.send("TODO: Home page");
});

app.get("/login", getLogin);
app.post("/login", postLogin);

app.get("/mass", getMass);
app.post("/mass", postMass);
app.get("/mass/slides", getSlides);

app.get("/mass/songs", getSongs);
app.get("/mass/songs/:id", getSong);
app.delete("/mass/songs/:id", deleteSong);
app.get("/mass/songs/new", getNewSong);
app.post("/mass/songs/new", postNewSong);

app.listen(port, () => {
  console.log(`Web app listening at http://localhost:${port}`);
});