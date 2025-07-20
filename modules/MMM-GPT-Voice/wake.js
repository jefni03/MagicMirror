require("dotenv").config();
const record = require("node-record-lpcm16");
const Porcupine = require("@picovoice/porcupine-node");

const fs = require("fs");

(async () => {
	try {
		const accessKey = process.env.PICOVOICE_ACCESS_KEY;
		const keywordPath = "./jarvis_windows.ppn"; // update name if different

		const porcupine = await Porcupine.create(accessKey, [{ custom: keywordPath, sensitivity: 0.7 }]);

		const mic = record.start({
			sampleRate: porcupine.sampleRate,
			threshold: 0,
			verbose: false
		});

		console.log("🎙️ Listening for wake word...");

		mic.on("data", (data) => {
			const pcm = new Int16Array(data.buffer, data.byteOffset, data.byteLength / Int16Array.BYTES_PER_ELEMENT);
			const index = porcupine.process(pcm);
			if (index !== -1) {
				console.log("🧠 Wake word DETECTED!");
				// trigger your GPT or orb animation here
			}
		});

		process.on("SIGINT", () => {
			mic.stop();
			porcupine.release();
			console.log("👋 Wake detection stopped.");
			process.exit();
		});
	} catch (err) {
		console.error("❌ Error initializing wake detection:", err);
	}
})();
