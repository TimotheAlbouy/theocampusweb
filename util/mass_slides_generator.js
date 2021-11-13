const axios = require("axios");
const { jsPDF } = require("jspdf");

const {
	KYRIE_LATIN, KYRIE_FRENCH,
	SANCTUS_LATIN, SANCTUS_FRENCH,
	AGNUS_LATIN, AGNUS_FRENCH
} = require("./constants.js");

module.exports = class MassSlidesGenerator {
	addPage() {
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		this._doc.addPage();
		this._doc.setFillColor(33, 33, 33);
		this._doc.rect(0, 0, width, height, 'F');
	}

	addOrdinarySong(title, latinLyrics, frenchLyrics) {
		const width = this._doc.internal.pageSize.getWidth();
		this._doc.setFontSize(30);
		this._doc.text(title, 10, 20);
		this._doc.setFontSize(20);
		this._doc.setFont(undefined, "italic");
		this._doc.text("Latin", 20, 40);
		this._doc.text("Français", width/2 + 10, 40);
		this._doc.setFont(undefined, "normal");
		const splitLatin = this._doc.splitTextToSize(latinLyrics, width/2 - 30);
		this._doc.text(splitLatin, 20, 60);
		const splitFrench = this._doc.splitTextToSize(frenchLyrics, width/2 - 30);
		this._doc.text(splitFrench, width/2 + 10, 60);
	}

	addNonOrdinarySong(title, lyrics) {
		const width = this._doc.internal.pageSize.getWidth();
		const height = this._doc.internal.pageSize.getHeight();
		this._verseNumber = 1;
		this._doc.setFontSize(30);
		this._doc.text(title, 10, 20);
		this._doc.setFontSize(20);
		const lineHeight = this._doc.getTextDimensions('text').h;
		if (lyrics.length == 1) {
			const splitP1 = this._doc.splitTextToSize(lyrics[0], width - 40);
			this.addParagraph(splitP1, 20, height/3);
		} else if (lyrics.length == 2) {
			const yP1 = 40;
			const splitP1 = this._doc.splitTextToSize(lyrics[0], width - 40);
			this.addParagraph(splitP1, 20, yP1);
			const yP2 = yP1 + splitP1.length * lineHeight + 20;
			const splitP2 = this._doc.splitTextToSize(lyrics[1], width - 40);
			this.addParagraph(splitP2, 20, yP2);
		} else if (lyrics.length == 3) {
			const yP1 = 40;
			const splitP1 = this._doc.splitTextToSize(lyrics[0], width - 40);
			this.addParagraph(splitP1, 20, yP1);
			const yP2 = yP1 + splitP1.length * lineHeight + 20;
			const splitP2 = this._doc.splitTextToSize(lyrics[1], width - 40);
			this.addParagraph(splitP2, 20, yP2);
			const yP3 = yP2 + splitP2.length * lineHeight + 20;
			const splitP3 = this._doc.splitTextToSize(lyrics[2], width - 40);
			this.addParagraph(splitP3, 20, yP3);
		} else if (lyrics.length >= 4) {
			const splitP1 = this._doc.splitTextToSize(lyrics[0], width/2 - 30);
			this.addParagraph(splitP1, 20, 40);
			const splitP2 = this._doc.splitTextToSize(lyrics[1], width/2 - 30);
			this.addParagraph(splitP2, 20, height/2 + 10);
			const splitP3 = this._doc.splitTextToSize(lyrics[2], width/2 - 30);
			this.addParagraph(splitP3, width/2 + 10, 40);
			const splitP4 = this._doc.splitTextToSize(lyrics[3], width/2 - 30);
			this.addParagraph(splitP4, width/2 + 10, height/2 + 10);
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