const axios = require("axios");
const { jsPDF } = require("jspdf");

const {
	KYRIE_FRENCH, KYRIE_GREEK,
	GLORIA_FRENCH,
	SANCTUS_FRENCH, SANCTUS_LATIN,
	AGNUS_FRENCH, AGNUS_LATIN,
	CONFITEOR_FRENCH,
	ACCLAMATION_FRENCH,
	ANAMNESIS_FRENCH
} = require("./constants.js");

module.exports = class MassSlidesGenerator {
	constructor() {
		this._introductionTitleSize = 60;
		this._introductionSubtitleSize = 30;
		this._songTitleSize = 30;
		this._lyricsSize = 20;
		this._singleLineSize = 30;

		this._backgroundShade = 33;
		this._primaryTextShade = 255;
		this._secondaryTextShade = 171;

		this._xSongTitle = 5;
		this._ySongTitle = 15;

		this._interParagraphWidth = 10;
		this._interParagraphHeight = 20;
		this._songBoxMarginLeft = 10;
		this._songBoxMarginRight = 10;
		this._songBoxTop = this._ySongTitle + this._interParagraphHeight;

		this._verseNumber = 0;
	}

	setPrimaryFontColor() {
		this._doc.setTextColor(
			this._primaryTextShade, this._primaryTextShade, this._primaryTextShade
		);
	}

	setSecondaryFontColor() {
		this._doc.setTextColor(
			this._secondaryTextShade, this._secondaryTextShade, this._secondaryTextShade
		);
	}

	addBackground() {
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		this._doc.setFillColor(this._backgroundShade, this._backgroundShade, this._backgroundShade);
		this._doc.rect(0, 0, width, height, "F");
	}

	addPage() {
		this._doc.addPage();
		this.addBackground();
	}

	addTitle(title) {
		this._doc.setFontSize(this._songTitleSize);
		this._doc.text(title, this._xSongTitle, this._ySongTitle);
		this._doc.setFontSize(this._lyricsSize);
	}

	addIntroduction() {
		this.addBackground();
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();

		this.setPrimaryFontColor();
		const title = "Messe du " + this.getNextWednesdayFrench();
		this._doc.setFontSize(this._introductionTitleSize);
		const splitTitle = this._doc.splitTextToSize(title, width - 40);
		this._doc.text(splitTitle, width/2, height/3, { align: "center" });

		this.setSecondaryFontColor();
		const substitle = "Aumônerie de Beaulieu";
		this._doc.setFontSize(this._introductionSubtitleSize);
		this._doc.text(substitle, width/2, 2*height/3, { align: "center" });
		this.setPrimaryFontColor();
	}

	addConclusion() {
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		this._doc.setFontSize(this._singleLineSize);
		this._doc.text("Bonne soirée, et souriez, Jésus vous aime !", width/2, height/2, { align: 'center' });
	}

	addOrdinarySong(title, frenchLyrics, oldLyrics, isLatin) {
		this.addTitle(title);
		const width = this._doc.internal.pageSize.getWidth();
		const fullSongBoxWidth = width - this._songBoxMarginLeft - this._songBoxMarginRight;
		const xLeft = this._songBoxMarginLeft;
		let yTop = this._songBoxTop;

		this._doc.setFont(undefined, "italic");
		this._doc.text("Français", xLeft, yTop);
		const splitFrench = this._doc.splitTextToSize(frenchLyrics, fullSongBoxWidth);
		yTop += this._interParagraphHeight;
		this._doc.setFont(undefined, "normal");
		yTop = this.addTextWithStyle(splitFrench, xLeft, yTop);

		if (oldLyrics) {
			this._doc.setFont(undefined, "italic");
			const oldLanguage = isLatin ? "Latin" : "Grec";
			this._doc.text(oldLanguage, xLeft, yTop);
			const splitOldLyrics = this._doc.splitTextToSize(oldLyrics, fullSongBoxWidth);
			yTop += this._interParagraphHeight;
			this._doc.setFont(undefined, "normal");
			this.addTextWithStyle(splitOldLyrics, xLeft, yTop);
		}
	}

	addTextWithStyle(lines, xLeft, yTop) {
		this._doc.setFontSize(this._lyricsSize);
		const lineHeight = this._doc.getTextDimensions("TEXT").h * 1.5;
		lines.forEach((line, i) => {
			let x = xLeft;
			let y = yTop + lineHeight*i;
			line.split("*").forEach((part, j) => {
				part.split("_").forEach((subpart, k) => {
					if (j % 2 === 1)
						this._doc.setFont(undefined, "bold");
					else if (k % 2 === 1)
						this._doc.setFont(undefined, "italic");
					else this._doc.setFont(undefined, "normal");
					this._doc.text(subpart, x, y);
					x += this._doc.getTextDimensions(subpart).w;
				});
			});
		});
		return yTop + (lines.length-1) * lineHeight + this._interParagraphHeight;
	}

	addNonOrdinarySong(title, lyrics) {
		this.addTitle(title);
		this._verseNumber = 1;
		const width = this._doc.internal.pageSize.getWidth();
		const fullSongBoxWidth = width - this._songBoxMarginLeft - this._songBoxMarginRight;
		const halfSongBoxWidth = (fullSongBoxWidth - this._interParagraphWidth) / 2;
		if (lyrics.length == 1) {
			const xP1 = this._songBoxMarginLeft;
			const yP1 = this._songBoxTop;
			this.addSongParagraph(lyrics[0], xP1, yP1, fullSongBoxWidth);
		} else if (lyrics.length == 2) {
			const xP1P2 = this._songBoxMarginLeft;
			const yP1 = this._songBoxTop;
			const yP2 = this.addSongParagraph(lyrics[0], xP1P2, yP1, fullSongBoxWidth);
			this.addSongParagraph(lyrics[1], xP1P2, yP2, fullSongBoxWidth);
		} else if (lyrics.length == 3) {
			const xP1P2P3 = this._songBoxMarginLeft;
			const yP1 = this._songBoxTop;
			const yP2 = this.addSongParagraph(lyrics[0], xP1P2P3, yP1);
			const yP3 = this.addSongParagraph(lyrics[1], xP1P2P3, yP2, fullSongBoxWidth);
			this.addSongParagraph(lyrics[2], xP1P2P3, yP3, fullSongBoxWidth);
		} else if (lyrics.length >= 4) {
			const xP1P3 = this._songBoxMarginLeft;
			const xP2P4 = xP1P3 + halfSongBoxWidth + this._interParagraphWidth;
			const yP1P2 = this._songBoxTop;
			const yP3P4 = Math.max(
				this.addSongParagraph(lyrics[0], xP1P3, yP1P2, halfSongBoxWidth),
				this.addSongParagraph(lyrics[1], xP2P4, yP1P2, halfSongBoxWidth)
			);
			this.addSongParagraph(lyrics[2], xP1P3, yP3P4, halfSongBoxWidth);
			this.addSongParagraph(lyrics[3], xP2P4, yP3P4, halfSongBoxWidth);
		}
	}

	addSongParagraph(paragraph, xLeft, yTop, width) {
		this._doc.setFontSize(this._lyricsSize);
		const lineHeight = this._doc.getTextDimensions("TEXT").h;
		const isChorus = paragraph.startsWith("R.");
		
		if (isChorus)
			this._doc.setFont(undefined, "bold");
		else paragraph = this._verseNumber + ". " + paragraph;
		
		const splitParagraph = this._doc.splitTextToSize(paragraph, width);
		this._doc.text(splitParagraph, xLeft, yTop);
		
		if (isChorus)
			this._doc.setFont(undefined, "normal");
		else this._verseNumber++;

		return yTop + splitParagraph.length * lineHeight + this._interParagraphHeight;
	}

	addUniversalPrayerChorus(universalPrayerChorus) {
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		const fullSongBoxWidth = width - this._songBoxMarginLeft - this._songBoxMarginRight;
		this._doc.setFontSize(this._singleLineSize);
		const splitUniversalPrayerChorus = this._doc.splitTextToSize(universalPrayerChorus, fullSongBoxWidth);
		this._doc.text(splitUniversalPrayerChorus, width/2, height/2, { align: "center" });
	}

	async addPsalm() {
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		const fullSongBoxWidth = width - this._songBoxMarginLeft - this._songBoxMarginRight;
		this._doc.setFontSize(this._singleLineSize);
		const psalmChorus = await this.getPsalmChorus();
		const splitPsalmChorus = this._doc.splitTextToSize(psalmChorus, fullSongBoxWidth);
		this._doc.text(splitPsalmChorus, width/2, height/2, { align: "center" });
	}

	addLiturgyChange(title, lyrics) {
		this.addTitle(title);
		const xLeft = this._songBoxMarginLeft;
		const yTop = this._songBoxTop;
		const lyricsSplit = lyrics.split(/\r?\n/);
		this.addTextWithStyle(lyricsSplit, xLeft, yTop);
	}

	getNextWednesday() {
		const nextWednesday = new Date();
		while (nextWednesday.getDay() !== 3)
			nextWednesday.setDate(nextWednesday.getDate() + 1);
		return nextWednesday;
	}

	getNextWednesdayDigits() {
		const nextWednesday = this.getNextWednesday();
		const year = nextWednesday.getFullYear();
		const month = nextWednesday.getMonth() + 1;
		const day = nextWednesday.getDate();

		let str = year + "-";
		if (month < 10) 
			str += "0";
		str += month + "-";
		if (day < 10) 
			str += "0";
		str += day;
		return str;
	}

	getNextWednesdayFrench() {
		const months = [
			"Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
			"Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
		];
		const nextWednesday = this.getNextWednesday();
		const year = nextWednesday.getFullYear();
		const month = months[nextWednesday.getMonth()];
		const day = nextWednesday.getDate();
		return "Mercredi " + day + " " + month + " " + year;
	}

	async getPsalmChorus() {
		const endpoint = "https://api.aelf.org/v1/messes/" + this.getNextWednesdayDigits() + "/france";
		const { data } = await axios.get(endpoint);
		for (let lect of data.messes[0].lectures)
			if (lect.type == "psaume")
				return lect.refrain_psalmique.replace(/(<[^>]+>)/g, "");
		return null;
	}

	async generateSlides(
		entranceSong, universalPrayerChorus, offertorySong, communionSong, recessionalSong,
		addGloria=false
	) {
		this._doc = new jsPDF({ orientation: "l", format: "a4" });
		
		// introduction
		this.addIntroduction();
		
		if (entranceSong) {
			// entrance
			this.addPage();
			this.addNonOrdinarySong(entranceSong.title, entranceSong.lyrics.split(/\r?\n\r?\n/));
		}

		// empty
		this.addPage();

		// confiteor
		this.addPage();
		this.addLiturgyChange("Confiteor", CONFITEOR_FRENCH);

		// empty
		this.addPage();

		// kyrie
		this.addPage();
		this.addOrdinarySong("Kyrie", KYRIE_FRENCH, KYRIE_GREEK, false);

		// empty
		this.addPage();

		if (addGloria) {
			// gloria
			this.addPage();
			this.addOrdinarySong("Gloria", GLORIA_FRENCH, null, true);
			// empty
			this.addPage();
		}

		// psalm
		this.addPage();
		await this.addPsalm();

		// empty
		this.addPage();

		// universal prayer
		if (universalPrayerChorus) {
			this.addPage();
			this.addUniversalPrayerChorus(universalPrayerChorus);
			// empty
			this.addPage();
		}

		// offertory
		if (offertorySong) {
			this.addPage();
			this.addNonOrdinarySong(offertorySong.title, offertorySong.lyrics.split(/\r?\n\r?\n/));
			// empty
			this.addPage();
		}

		// acclamation
		this.addPage();
		this.addLiturgyChange("Acclamation", ACCLAMATION_FRENCH);

		// empty
		this.addPage();

		// sanctus
		this.addPage();
		this.addOrdinarySong("Sanctus", SANCTUS_FRENCH, SANCTUS_LATIN, true);

		// empty
		this.addPage();

		// anamnesis
		this.addPage();
		this.addLiturgyChange("Anamnèse", ANAMNESIS_FRENCH);

		// empty
		this.addPage();

		// agnus
		this.addPage();
		this.addOrdinarySong("Agnus Dei", AGNUS_FRENCH, AGNUS_LATIN, true);

		// empty
		this.addPage();

		// communion
		if (communionSong) {
			this.addPage();
			this.addNonOrdinarySong(communionSong.title, communionSong.lyrics.split(/\r?\n\r?\n/));
			// empty
			this.addPage();
		}

		if (recessionalSong) {
			// recessional
			this.addPage();
			this.addNonOrdinarySong(recessionalSong.title, recessionalSong.lyrics.split(/\r?\n\r?\n/));
		}

		// conclusion
		this.addPage();
		this.addConclusion();

		return this._doc;
	}
}