const NodeHelper = require("node_helper");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { spawn, exec } = require("child_process");
const textToSpeech = require("@google-cloud/text-to-speech");
const { Porcupine } = require("@picovoice/porcupine-node");
require("dotenv").config();

const gcpClient = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
const player = require("play-sound")({
  player: process.env.AUDIO_PLAYER || "mpg123"
});

module.exports = NodeHelper.create({
  start() {
    this.config = {};
    this.audioFile = "recording.wav";
    this.messageHistory = [
      { role: "system", content: "You are a helpful voice assistant for a smart mirror." }
    ];
    this.startWakeDetection();
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "INIT") {
      this.config = payload;
    } else if (notification === "START_LISTENING") {
      this.recordAudio();
    }
  },

  startWakeDetection() {
    const accessKey = process.env.PICOVOICE_ACCESS_KEY;
    const keywordPath = "./modules/MMM-GPT-Voice/jarvis_windows.ppn";
    const sensitivity = 0.65;

    const porcupine = new Porcupine(accessKey, [keywordPath], [sensitivity]);
    const sox = spawn("sox", [
      "-t", "waveaudio", "-d", "-r", "16000", "-c", "1", "-b", "16",
      "-e", "signed-integer", "-t", "raw", "-"
    ]);

    let audioBuffer = Buffer.alloc(0);
    const frameLength = porcupine.frameLength * Int16Array.BYTES_PER_ELEMENT;

    sox.stdout.on("data", (chunk) => {
      audioBuffer = Buffer.concat([audioBuffer, chunk]);

      while (audioBuffer.length >= frameLength) {
        const frame = audioBuffer.slice(0, frameLength);
        audioBuffer = audioBuffer.slice(frameLength);

        const pcm = new Int16Array(frameLength / 2);
        for (let i = 0; i < frameLength; i += 2) {
          pcm[i / 2] = frame.readInt16LE(i);
        }

        try {
          const keywordIndex = porcupine.process(pcm);
          if (keywordIndex >= 0) {
            this.sendSocketNotification("WAKE_WORD_DETECTED");
          }
        } catch (err) {
          console.error("[WakeWord] Error:", err.message);
        }
      }
    });

    sox.stderr.on("data", (data) => {
      console.error(`SoX stderr: ${data}`);
    });

    sox.on("exit", (code) => {
      console.log(`SoX exited with code ${code}`);
      porcupine.release();
    });
  },

  recordAudio() {
    const command = `sox -t waveaudio -d ${this.audioFile} silence 1 0.1 1% 1 1.5 1%`;

    exec(command, (error) => {
      if (error) {
        console.error("[GPT-Voice] SoX error:", error.message);
        this.sendSocketNotification("GPT_RESPONSE", { response: "Recording failed." });
        return;
      }

      try {
        const stats = fs.statSync(this.audioFile);
        if (stats.size > 1000) {
          this.transcribeAudio(this.audioFile);
        } else {
          this.sendSocketNotification("GPT_RESPONSE", { response: "No speech detected." });
        }
      } catch {
        this.sendSocketNotification("GPT_RESPONSE", { response: "Recording failed." });
      }
    });
  },

  async transcribeAudio(filePath) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("model", "whisper-1");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );

      const transcript = response.data.text;
      this.queryChatGPT(transcript);
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      this.sendSocketNotification("GPT_RESPONSE", { response: "Whisper failed: " + message });
    }
  },

  async queryChatGPT(prompt) {
    this.messageHistory.push({ role: "user", content: prompt });

    if (this.messageHistory.length > 20) {
      this.messageHistory = [
        this.messageHistory[0],
        ...this.messageHistory.slice(-18)
      ];
    }

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: this.config.model,
          messages: this.messageHistory,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );

      const message = response.data.choices[0].message.content.trim();
      this.messageHistory.push({ role: "assistant", content: message });

      this.speakWithGoogleTTS(message);
      this.sendSocketNotification("GPT_RESPONSE", { response: message });
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      this.sendSocketNotification("GPT_RESPONSE", { response: "ChatGPT failed: " + message });
    }
  },

  async speakWithGoogleTTS(text) {
    const request = {
      input: { text },
      voice: {
        languageCode: "en-US",
        name: "en-US-Wavenet-F",
        ssmlGender: "FEMALE"
      },
      audioConfig: { audioEncoding: "MP3" }
    };

    try {
      const [response] = await gcpClient.synthesizeSpeech(request);
      const filePath = "gpt-response.mp3";
      fs.writeFileSync(filePath, response.audioContent, "binary");
      player.play(filePath, {
        mpg123: ["-q"]
      }, (err) => {
        if (err) {
          console.error("[GPT-Voice] Playback error:", err.message);
        } else {
          this.sendSocketNotification("SPEAKING_DONE");
        }
      });
    } catch (err) {
      console.error("[GPT-Voice] Google TTS error:", err.message);
    }
  }
});
