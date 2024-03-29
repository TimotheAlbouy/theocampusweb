const axios = require("axios");

exports.getDateFrench = function(date) {
	const daysFrench = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
	const monthsFrench = [
		"Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
		"Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
	];
	const day = daysFrench[date.getDay() - 1];
	const dayNo = date.getDate();
	const month = monthsFrench[date.getMonth()];
	const year = date.getFullYear();
	return day + " " + dayNo + " " + month + " " + year;
}

exports.getPsalmChorus = async function(date) {
	const dateISO = date.toISOString().split("T")[0];
	const endpoint = "https://api.aelf.org/v1/messes/" + dateISO + "/france";
	const { data } = await axios.get(endpoint);
	let canticle_chorus = null;
	for (let reading of data.messes[0].lectures) {
		if (reading.type == "psaume")
			return reading.refrain_psalmique.replace(/(<[^>]+>)/g, "");
		if (reading.type == "cantique")
			canticle_chorus = reading.refrain_psalmique.replace(/(<[^>]+>)/g, "");
	}
	if (canticle_chorus) return canticle_chorus;
	return "";
}
