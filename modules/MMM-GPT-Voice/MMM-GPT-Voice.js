// MMM-GPT-Voice.js
// ChatGPT-powered voice assistant for MagicMirror²

Module.register("MMM-GPT-Voice", {
  defaults: {
    openaiApiKey: "YOUR_API_KEY_HERE", 
    wakeWord: "mirror",
    model: "gpt-3.5-turbo",
    maxTokens: 300,
    temperature: 0.8
  },

  start() {
    this.sendSocketNotification("INIT", this.config);
    this.responseText = null;
    this.loaded = false;
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "gpt-voice-wrapper";

    const output = document.createElement("div");
    output.className = "gpt-output";
    output.innerHTML = this.responseText || "Click the button and speak...";
    wrapper.appendChild(output);

    const button = document.createElement("button");
    button.innerText = "Talk to GPT";
    button.onclick = () => {
      this.responseText = "Listening...";
      this.updateDom();
      this.sendSocketNotification("START_LISTENING");
    };
    wrapper.appendChild(button);

    return wrapper;
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "GPT_RESPONSE") {
      this.loaded = true;
      this.responseText = payload.response;
      this.updateDom();
    }
  }
});
