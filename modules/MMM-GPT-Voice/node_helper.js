const NodeHelper = require("node_helper");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { exec } = require("child_process");
const path = require("path");
require("dotenv").config();

const textToSpeech = require("@google-cloud/text-to-speech");
const player = require("play-sound")({
  player: process.env.AUDIO_PLAYER || "mpg123"
});

const gcpClient = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

module.exports = NodeHelper.create({
  start() {
    console.log("[GPT-Voice] Node helper started");
    this.config = {};
    this.audioFile = "recording.wav";

    
    this.messageHistory = [
      { role: "system", content: "You are a helpful voice assistant for a smart mirror." }
    ];
  },

  socketNotificationReceived(notification, payload) {
    console.log("[GPT-Voice] Notification received:", notification);
    if (notification === "INIT") {
      this.config = payload;
    } else if (notification === "START_LISTENING") {
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
      if (error) {
        console.error("[GPT-Voice] SoX error:", error.message);
        this.sendSocketNotification("GPT_RESPONSE", { response: "Recording failed." });
        return;
      }

      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 1000) {
          this.transcribeAudio(filePath);
        } else {
          this.sendSocketNotification("GPT_RESPONSE", { response: "No speech detected." });
        }
      } catch (err) {
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
      console.log("[GPT-Voice] Transcription:", transcript);
      this.queryChatGPT(transcript);
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      this.sendSocketNotification("GPT_RESPONSE", { response: "Whisper failed: " + message });
    }
  },

  async queryChatGPT(prompt) {
    console.log("[GPT-Voice] Sending to ChatGPT:", prompt);
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
          max_tokens: this.config.maxTokens || 300,
          temperature: this.config.temperature || 0.8
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
        if (err) console.error("[GPT-Voice] Playback error:", err.message);
      });
    } catch (err) {
      console.error("[GPT-Voice] Google TTS error:", err.message);
    }
  }
});
