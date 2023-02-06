import { Aki } from "aki-api";
import { storeSession, destroySession } from "./sessions.js";
import { questionBuilder, sendGameEndMessage } from "./presets.js";

import config from "./config.js";

async function createAkiSession(number, gm, callback) {
	const region = getRegion(gm);
	const aki = new Aki({ region });
	await aki.start();

	storeSession(number, aki);

	callback(aki);
}

async function akiNext(session, answer, replyBucket, chat) {
	var answerId = getAnswer(answer);
	await session.step(answerId);

	if (session.progress >= 70 || session.currentStep >= 78) {
		await session.win();

		console.log(session.answers[1]);
		var { name, description, absolute_picture_path } = session.answers[0];
		sendGameEndMessage(
			name,
			absolute_picture_path,
			description,

			chat
		);
		destroySession(session.bucketName);
	} else {
		const question = questionBuilder(session.question, session.currentStep + 1);
		replyBucket(question);
	}
}

function getRegion(t) {
	let region;
	var { animal, object } = config.buttons;
	switch (t) {
		case animal:
			region = "en_animals";
			break;
		case object:
			region = "en_objects";
			break;
		default:
			region = "en";
	}
	return region;
}

function getAnswer(answer) {
	let answerOptions = ["Yes", "No", "Don't know", "Probably", "Probably not"];
	return answerOptions.indexOf(answer);
}

export { createAkiSession, akiNext };
