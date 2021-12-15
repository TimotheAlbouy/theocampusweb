const axios = require("axios");
const { jsPDF } = require("jspdf");

const {
	KYRIE_LATIN, KYRIE_FRENCH,
	SANCTUS_LATIN, SANCTUS_FRENCH,
	AGNUS_LATIN, AGNUS_FRENCH
} = require("./constants.js");

module.exports = class MassSlidesGenerator {
	constructor() {
		this._songTitleSize = 30;
		this._lyricsSize = 20;
		this._xSongTitle = 5;
		this._ySongTitle = 15;
		this._interParagraphWidth = 10;
		this._interParagraphHeight = 20;
		this._songBoxMarginLeft = 10;
		this._songBoxMarginRight = 10;
		this._songBoxTop = this._ySongTitle + this._interParagraphHeight;
	}

	addPage() {
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		this._doc.addPage();
		this._doc.setFillColor(33, 33, 33);
		this._doc.rect(0, 0, width, height, "F");
	}

	addOrdinarySong(title, latinLyrics, frenchLyrics) {
		const width = this._doc.internal.pageSize.getWidth();
		this._doc.setFontSize(this._songTitleSize);
		this._doc.text(title, this._xSongTitle, this._ySongTitle);
		this._doc.setFontSize(this._lyricsSize);
		const fullSongBoxWidth = width - this._songBoxMarginLeft - this._songBoxMarginRight;
		const halfSongBoxWidth = (fullSongBoxWidth - this._interParagraphWidth) / 2;
		const splitLatin = this._doc.splitTextToSize(latinLyrics, halfSongBoxWidth);
		const splitFrench = this._doc.splitTextToSize(frenchLyrics, halfSongBoxWidth);
		const xLatin = this._songBoxMarginLeft;
		const xFrench = xLatin + halfSongBoxWidth + this._interParagraphWidth;
		const yLanguages = this._songBoxTop;
		const yLyrics = this._songBoxTop + this._interParagraphHeight;
		this._doc.setFont(undefined, "italic");
		this._doc.text("Latin", xLatin, yLanguages);
		this._doc.text("Français", xFrench, yLanguages);
		this._doc.setFont(undefined, "normal");
		this._doc.text(splitLatin, xLatin, yLyrics);
		this._doc.text(splitFrench, xFrench, yLyrics);
	}

	addNonOrdinarySong(title, lyrics) {
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		this._verseNumber = 1;
		this._doc.setFontSize(this._songTitleSize);
		this._doc.text(title, this._xSongTitle, this._ySongTitle);
		this._doc.setFontSize(this._lyricsSize);
		const lineHeight = this._doc.getTextDimensions('text').h;
		const fullSongBoxWidth = width - this._songBoxMarginLeft - this._songBoxMarginRight;
		const halfSongBoxWidth = (fullSongBoxWidth - this._interParagraphWidth) / 2;
		if (lyrics.length == 1) {
			const xP1 = this._songBoxMarginLeft;
			const yP1 = this._songBoxTop;
			const splitP1 = this._doc.splitTextToSize(lyrics[0], fullSongBoxWidth);
			this.addParagraph(splitP1, xP1, yP1);
		} else if (lyrics.length == 2) {
			const splitP1 = this._doc.splitTextToSize(lyrics[0], fullSongBoxWidth);
			const splitP2 = this._doc.splitTextToSize(lyrics[1], fullSongBoxWidth);
			const xP1P2 = this._songBoxMarginLeft;
			const yP1 = this._songBoxTop;
			const yP2 = yP1 + splitP1.length * lineHeight + this._interParagraphHeight;
			this.addParagraph(splitP1, xP1P2, yP1);
			this.addParagraph(splitP2, xP1P2, yP2);
		} else if (lyrics.length == 3) {
			const splitP1 = this._doc.splitTextToSize(lyrics[0], fullSongBoxWidth);
			const splitP2 = this._doc.splitTextToSize(lyrics[1], fullSongBoxWidth);
			const splitP3 = this._doc.splitTextToSize(lyrics[2], fullSongBoxWidth);
			const xP1P2P3 = this._songBoxMarginLeft;
			const yP1 = this._songBoxTop;
			const yP2 = yP1 + splitP1.length * lineHeight + this._interParagraphHeight;
			const yP3 = yP2 + splitP2.length * lineHeight + this._interParagraphHeight;
			this.addParagraph(splitP1, xP1P2P3, yP1);
			this.addParagraph(splitP2, xP1P2P3, yP2);
			this.addParagraph(splitP3, xP1P2P3, yP3);
		} else if (lyrics.length >= 4) {
			const splitP1 = this._doc.splitTextToSize(lyrics[0], halfSongBoxWidth);
			const splitP2 = this._doc.splitTextToSize(lyrics[1], halfSongBoxWidth);
			const splitP3 = this._doc.splitTextToSize(lyrics[2], halfSongBoxWidth);
			const splitP4 = this._doc.splitTextToSize(lyrics[3], halfSongBoxWidth);
			const xP1P2 = this._songBoxMarginLeft;
			const xP2P3 = xP1P2 + halfSongBoxWidth + this._interParagraphWidth;
			const yP1P3 = this._songBoxTop;
			const yP2P4 = Math.max(
				yP1P3 + splitP1.length * lineHeight + this._interParagraphHeight,
				yP1P3 + splitP3.length * lineHeight + this._interParagraphHeight
			);
			this.addParagraph(splitP1, xP1P2, yP1P3);
			this.addParagraph(splitP2, xP1P2, yP2P4);
			this.addParagraph(splitP3, xP2P3, yP1P3);
			this.addParagraph(splitP4, xP2P3, yP2P4);
		}
	}

	addParagraph(paragraph, x, y) {
		this._doc.setFontSize(20);
		const isChorus = paragraph[0].startsWith("R.");
		if (isChorus) {
			this._doc.setFont(undefined, "bold");
			this._doc.text(paragraph, x, y);
			this._doc.setFont(undefined, "normal");
		} else {
			paragraph[0] = this._verseNumber + ". " + paragraph[0];
			this._doc.text(paragraph, x, y);
			this._verseNumber++;
		}
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
		entranceSongTitle, entranceSongLyrics,
		universalPrayerChorus,
		offertorySongTitle, offertorySongLyrics,
		communionSongTitle, communionSongLyrics,
		recessionalSongTitle, recessionalSongLyrics
	) {
		this._doc = new jsPDF({
			orientation: "l",
			format: "a4",
		});
		this._verseNumber = 0;
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		this._doc.setTextColor(255, 255, 255);
		
		// introduction
		this._doc.setFillColor(33, 33, 33);
		this._doc.rect(0, 0, width, height, 'F');
		this._doc.setFontSize(60);
		const title = "Messe du " + this.getNextWednesdayFrench();
		const splitTitle = this._doc.splitTextToSize(title, width - 40);
		this._doc.text(splitTitle, width/2, height/3, { align: 'center' });
		this._doc.setFontSize(30);
		this._doc.setTextColor(171, 171, 171);
		this._doc.text("Aumônerie de Beaulieu", width/2, 2*height/3, { align: 'center' });
		this._doc.setTextColor(255, 255, 255);
		
		// entrance
		this.addPage();
		this.addNonOrdinarySong(entranceSongTitle, entranceSongLyrics.split(/\r?\n\r?\n/));

		// empty
		this.addPage();

		// kyrie
		this.addPage();
		this.addOrdinarySong("Kyrie", KYRIE_LATIN, KYRIE_FRENCH);

		// empty
		this.addPage();

		// psalm
		this.addPage();
		this._doc.setFontSize(30);
		const psalmChorus = await this.getPsalmChorus();
		const splitPsalmChorus = this._doc.splitTextToSize(psalmChorus, width - 40);
		this._doc.text(splitPsalmChorus, width/2, height/2, { align: 'center' });

		// empty
		this.addPage();

		// universal prayer
		this.addPage();
		this._doc.setFontSize(30);
		const splitUniversalPrayerChorus = this._doc.splitTextToSize(universalPrayerChorus, width - 40);
		this._doc.text(splitUniversalPrayerChorus, width/2, height/2, { align: 'center' });

		// empty
		this.addPage();

		// offertory
		this.addPage();
		this.addNonOrdinarySong(offertorySongTitle, offertorySongLyrics.split(/\r?\n\r?\n/));

		// empty
		this.addPage();

		// sanctus
		this.addPage();
		this.addOrdinarySong("Sanctus", SANCTUS_LATIN, SANCTUS_FRENCH);

		// empty
		this.addPage();

		// agnus
		this.addPage();
		this.addOrdinarySong("Agnus Dei", AGNUS_LATIN, AGNUS_FRENCH);

		// empty
		this.addPage();

		// communion
		this.addPage();
		this.addNonOrdinarySong(communionSongTitle, communionSongLyrics.split(/\r?\n\r?\n/));

		// empty
		this.addPage();

		// recessional
		this.addPage();
		this.addNonOrdinarySong(recessionalSongTitle, recessionalSongLyrics.split(/\r?\n\r?\n/));

		// conclusion
		this.addPage();
		this._doc.setFontSize(30);
		this._doc.text("Bonne soirée, et souriez, Jésus vous aime !", width/2, height/2, { align: 'center' });

		return this._doc;
	}
}