import WhatsApp from "whatsapp-web.js";
const { Buttons, List, MessageMedia } = WhatsApp;
import config from "./config.js";

function getIntro(list = false) {
	const messageProperties = {
		title: "Start a game",
		description:
			"Choose you game thematic before you go! I can guess about any character, animal or object!",
		subTitle: "AVAILABLE THEMATIC",
	};

	if (list === true) {
		const list = new List(
			messageProperties.description,
			"Choose",
			[
				{
					title: messageProperties.subTitle,
					rows: [
						{
							title: "Character",
							id: "0",
						},
						{
							title: "Object",
							id: "1",
						},
						{
							title: "Animal",
							id: "2",
						},
					],
				},
			],
			messageProperties.title
		);

		return list;
	} else {
		var { character, animal, object } = config.buttons;
		const btn = new Buttons(
			messageProperties.description,
			[
				{
					body: character,
				},
				{
					body: object,
				},

				{
					body: animal,
				},
			],
			messageProperties.title,
			messageProperties.subTitle
		);

		return btn;
	}
}

function questionBuilder(q_text, q_no, for_who = false) {
	if (for_who) {
		q_no = q_no + " for " + for_who;
	}
	const list = new List(
		q_text,
		"Pick",
		[
			{
				title: q_text,
				rows: [
					{
						title: "Yes",
						id: "0",
					},
					{
						title: "No",
						id: "1",
					},
					{
						title: "Don't know",
						id: "2",
					},
					{
						title: "Probably",
						id: "3",
					},
					{
						title: "Probably not",
						id: "4",
					},
				],
			},
		],
		`Question ${q_no}`
	);
	return list;
}

async function sendGameEndMessage(name, image, description, replyBucket) {
	replyBucket.sendMessage("*🧞 𝕷𝖊𝖙 𝖒𝖊 𝖙𝖍𝖎𝖓𝖐*");

	var dcx = `I guess it is *${name}*, ${description}! Am i correct? \n`;

	const media = await MessageMedia.fromUrl(image);
	replyBucket.sendMessage(media, { caption: dcx });
}

export { getIntro, questionBuilder, sendGameEndMessage };
