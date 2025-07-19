const NodeHelper = require("node_helper");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { exec } = require("child_process");
const path = require("path");
require("dotenv").config();

const textToSpeech = require("@google-cloud/text-to-speech");
const player = require("play-sound")({ player: "mpg123" });

const gcpClient = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

module.exports = NodeHelper.create({
  start() {
    console.log("[GPT-Voice] Node helper started");
    this.config = {};
    this.audioFile = "recording.wav";
  },

  socketNotificationReceived(notification, payload) {
    console.log("[GPT-Voice] Notification received:", notification);
    if (notification === "INIT") {
      this.config = payload;
    } else if (notification === "START_LISTENING") {
      console.log("[GPT-Voice] START_LISTENING received");
      this.recordAudio();
    }
  },

  recordAudio() {
    console.log("[GPT-Voice] Starting recordAudio()");
    const micDevice = "-d";
    const filePath = this.audioFile;
    const command = `sox -t waveaudio ${micDevice} ${filePath} trim 0 5`;
    console.log("[GPT-Voice] Running SoX command:", command);

    exec(command, (error) => {
      console.log("[GPT-Voice] SoX finished");
      if (error) {
        console.error("[GPT-Voice] SoX error:", error.message);
        this.sendSocketNotification("GPT_RESPONSE", { response: "Recording failed." });
        return;
      }

      try {
        const stats = fs.statSync(filePath);
        console.log(`[GPT-Voice] Audio file size: ${stats.size} bytes`);
        if (stats.size > 1000) {
          console.log("[GPT-Voice] Proceeding to transcription...");
          this.transcribeAudio(filePath);
        } else {
          console.warn("[GPT-Voice] Audio too small — skipping Whisper.");
          this.sendSocketNotification("GPT_RESPONSE", { response: "No speech detected. Try again." });
        }
      } catch (err) {
        console.error("[GPT-Voice] File error:", err.message);
        this.sendSocketNotification("GPT_RESPONSE", { response: "Recording failed." });
      }
    });
  },

  async transcribeAudio(filePath) {
    console.log("[GPT-Voice] Transcribing with Whisper...");
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
      console.log("[GPT-Voice] Transcription:", transcript);
      this.queryChatGPT(transcript);
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      console.error("[GPT-Voice] Whisper failed:", message);
      this.sendSocketNotification("GPT_RESPONSE", { response: "Whisper failed: " + message });
    }
  },

  async queryChatGPT(prompt) {
    console.log("[GPT-Voice] Sending to ChatGPT:", prompt);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: this.config.model,
          messages: [{ role: "user", content: prompt }],
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
      console.log("[GPT-Voice] ChatGPT Reply:", message);

      this.speakWithGoogleTTS(message);
      this.sendSocketNotification("GPT_RESPONSE", { response: message });
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      console.error("[GPT-Voice] ChatGPT failed:", message);
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
      console.log("[GPT-Voice] Playing response with Google TTS...");
      player.play(filePath, (err) => {
        if (err) console.error("[GPT-Voice] Playback error:", err.message);
      });
    } catch (err) {
      console.error("[GPT-Voice] Google TTS error:", err.message);
    }
  }
});
