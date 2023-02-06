import config from "./config.js";
import { destroySession } from "./sessions.js";
var timeoutBucket = {};

function createAkiTimeout(bucket, chat) {
	var m = config.timeout || 3;

	timeoutBucket[bucket] = setTimeout(() => {
		clearTimeout(timeoutBucket[bucket]);
		destroySession(bucket);
		chat.sendMessage(config.text.timeout);
	}, m * 60000);
}

function destroyAkiTimeout(bucket, callback) {
	try {
		clearTimeout(timeoutBucket[bucket]);
		if (typeof callback === "function") {
			callback();
		}
	} catch {}
}

export { createAkiTimeout, destroyAkiTimeout };
