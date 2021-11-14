const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const Database = require("better-sqlite3");

const { DATABASE_NAME, SESSION_SECRET } = require("./env.js");
const { getHome, getLogin, postLogin, getLogout } = require("./routes/core_routes.js");
const { getMass, postMass, getSlides } = require("./routes/mass_routes.js");
const {
	getSongs, getSong, deleteSong, editSong, getNewSong, postNewSong
} = require("./routes/songs_routes.js");
const {
	getUniversalPrayers, getUniversalPrayer, deleteUniversalPrayer,
	editUniversalPrayer, getNewUniversalPrayer, postNewUniversalPrayer
} = require("./routes/universal_prayers_routes.js");

const app = express();
const port = 8080;
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride((req, res) => {
	if (req.body && typeof req.body === "object" && "_method" in req.body) {
		// look in urlencoded POST bodies and delete it
		const method = req.body._method;
		delete req.body._method;
		return method;
	}
}));
app.use(session(
	{
		secret: SESSION_SECRET,
		saveUninitialized: false,
		resave: false
	}
));
app.use(flash());
app.use((req, res, next) => {
	res.locals.username = req.session.username;
	const flashTypeArray = req.flash("flashType");
	const flashMessageArray = req.flash("flashMessage");
	if (flashTypeArray) res.locals.flashType = flashTypeArray[0];
	if (flashTypeArray) res.locals.flashMessage = flashMessageArray[0];
	next();
});
app.use(express.static("public"));

const db = new Database(DATABASE_NAME);
//const db = new Database(DATABASE_NAME, { verbose: console.log });

app.set("view engine", "ejs");
app.set("db", db);

const auth = (req, res, next) => {
	if (req.session.username) return next();
	else return res.redirect("/login");
};

app.get("/", getHome);
app.get("/login", getLogin);
app.post("/login", postLogin);
app.get("/logout", getLogout);

app.get("/mass/slides", getSlides);
app.get("/mass", auth, getMass);
app.post("/mass", auth, postMass);

app.get("/mass/songs", auth, getSongs);
app.get("/mass/songs/:id(\\d+)", auth, getSong);
app.delete("/mass/songs/:id(\\d+)", auth, deleteSong);
app.put("/mass/songs/:id(\\d+)", auth, editSong);
app.get("/mass/songs/new", auth, getNewSong);
app.post("/mass/songs/new", auth, postNewSong);

app.get("/mass/universal-prayers", auth, getUniversalPrayers);
app.get("/mass/universal-prayers/:id(\\d+)", auth, getUniversalPrayer);
app.delete("/mass/universal-prayers/:id(\\d+)", auth, deleteUniversalPrayer);
app.put("/mass/universal-prayers/:id(\\d+)", auth, editUniversalPrayer);
app.get("/mass/universal-prayers/new", auth, getNewUniversalPrayer);
app.post("/mass/universal-prayers/new", auth, postNewUniversalPrayer);

app.listen(port, () => {
	console.log(`Web app listening at http://localhost:${port}`);
});