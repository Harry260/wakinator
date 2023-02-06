import qrcode from "qrcode-terminal";
import WhatsApp from "whatsapp-web.js";

// Custom Modules IMport
import { getIntro, questionBuilder } from "./libs/presets.js";
import { getSession, destroySession } from "./libs/sessions.js";
import { akiNext, createAkiSession } from "./libs/akinator.js";
import config from "./libs/config.js";

// WhatsApp Auth
const { Client, LocalAuth } = WhatsApp;
const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: {
		executablePath: "/usr/bin/chromium-browser",
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
		headless: true,
	},
});

// QR Code Building in case of Auth
client.on("qr", (qr) => {
	qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
	console.log("WhatsApp Successfully Authenticated!");
});

// Bot Startup event
client.on("ready", () => {
	console.log("Bot Woke up!");
});

// Handle Message
client.on("message", async (msg) => {
	const chat = await msg.getChat();
	var content = msg.body;

	// Function to send message on the chat
	const replyBucket = function (reply) {
		client.sendMessage(chat.id._serialized, reply);
	};

	// If Start command is triggered
	if (config.commands.start.includes(content.toLowerCase())) {
		msg.reply(config.text.intro);
	}

	// If A command to play is triggered
	// If Group and Group Command || If Not Group and DM command
	if (
		(chat.isGroup &&
			config.commands.group_trigger.includes(content.toLocaleLowerCase())) ||
		(!chat.isGroup &&
			config.commands.trigger.includes(content.toLocaleLowerCase()))
	) {
		// Get and Send intro message
		var btn = getIntro();
		client.sendMessage(chat.id._serialized, btn);
	} else if (["buttons_response", "list_response"].includes(msg.type)) {
		// Get game Session if exists
		var session = await getSession(msg.from);

		var StartingOptions = Object.values(config.buttons),
			AnswerOptions = ["Yes", "No", "Don't know", "Probably", "Probably not"];

		// If session exists but new game command is triggered
		if (session && StartingOptions.includes(content)) {
			msg.reply(config.text.exist);
		}

		// Ig No session exists and new game is triggered
		// Sends Typing state and creates akiSession
		else if (!session && StartingOptions.includes(content)) {
			chat.sendStateTyping();

			var forWho = false;
			if (chat.isGroup) {
				const contact = await msg.getContact();
				forWho = contact.pushname;
			}
			await createAkiSession(msg.from, msg.body, (akiSession) => {
				var question = questionBuilder(
					akiSession.question,
					akiSession.currentStep + 1,
					forWho
				);

				client.sendMessage(chat.id._serialized, question);
			});
		}

		// If session already exists and reply response for a question is triggered
		else if (session && AnswerOptions.includes(content)) {
			chat.sendStateTyping();
			await akiNext(session, content, replyBucket, chat, forWho);
		}
	}

	// If stop command is triggered
	else if (
		(chat.isGroup &&
			config.commands.group_end.includes(content.toLocaleLowerCase())) ||
		(!chat.isGroup && config.commands.end.includes(content.toLocaleLowerCase()))
	) {
		destroySession(msg.from);
		msg.reply(config.text.end);
	}
});

// Initializing Whatsapp bot with Events
client.initialize();
