const { getDateFrench } = require("./util.js");

module.exports = function generateWhatsappMessage(
	entranceSong, psalmChorus, universalPrayerChorus,
	offertorySong, communionSong, recessionalSong,
	date
) {
	let whatsappMessage = `*Messe du ${getDateFrench(date)}*`;
	let firstPassed = false;

	if (entranceSong) {
		whatsappMessage += "\n\n" + generateWhatsappSong("Entrée", entranceSong.title, entranceSong.lyrics);
		firstPassed = true;
	}

	if (psalmChorus) {
		if (firstPassed) whatsappMessage += "\n";
		whatsappMessage += "\n\n" + generateWhatsappSong("Psaume", psalmChorus, null);
		firstPassed = true;
	}
		
	if (universalPrayerChorus) {
		if (firstPassed) whatsappMessage += "\n";
		whatsappMessage += "\n\n" + generateWhatsappSong("Prière universelle", universalPrayerChorus, null);
		firstPassed = true;
	}

	if (offertorySong) {
		if (firstPassed) whatsappMessage += "\n";
		whatsappMessage += "\n\n" + generateWhatsappSong("Offertoire", offertorySong.title, offertorySong.lyrics);
		firstPassed = true;
	}

	if (communionSong) {
		if (firstPassed) whatsappMessage += "\n";
		whatsappMessage += "\n\n" + generateWhatsappSong("Communion", communionSong.title, communionSong.lyrics);
		firstPassed = true;
	}

	if (recessionalSong) {
		if (firstPassed) whatsappMessage += "\n";
		whatsappMessage += "\n\n" + generateWhatsappSong("Envoi", recessionalSong.title, recessionalSong.lyrics);
	}
	
	return whatsappMessage;
}

function generateWhatsappSong(type, title, lyrics) {
	let whatsappSong = `*${type} :* _${title}_`;
	if (lyrics) {
		const paragraphs = lyrics.split(/\r?\n\r?\n/);
		let verseNumber = 1;
		for (let paragraph of paragraphs.slice(0, 4)) {
			whatsappSong += "\n";
			const isChorus = paragraph.startsWith("R.");
			if (!isChorus) paragraph = (verseNumber++) + ". " + paragraph;
			for (const line of paragraph.split(/\r?\n/))
                whatsappSong += `\n${isChorus ? "*" : ""}${line}${isChorus ? "*" : ""}`;
		}
	}
	return whatsappSong;
}