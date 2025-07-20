Module.register("MMM-GPT-Voice", {
  defaults: {
    openaiApiKey: "YOUR_API_KEY_HERE",
    wakeWord: "Jarvis",
    model: "gpt-3.5-turbo",
    maxTokens: 300,
    temperature: 0.8
  },

  start() {
    this.sendSocketNotification("INIT", this.config);
    this.state = "idle";
    this.responseText = "";
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "gpt-script-wrapper";

    if (this.state === "listening") {
      const orbWrap = document.createElement("div");
      orbWrap.className = "gpt-orb-container";

      const orb = document.createElement("div");
      orb.className = "gpt-orb-core";

      orbWrap.appendChild(orb);
      wrapper.appendChild(orbWrap);
    }

    if (this.state === "speaking" && this.responseText) {
      const orbWrap = document.createElement("div");
      orbWrap.className = "gpt-orb-container";

      const orb = document.createElement("div");
      orb.className = "gpt-orb-core";

      const orbInner = document.createElement("div");
      orbInner.className = "gpt-orb-inner";

      const textEl = document.createElement("div");
      textEl.className = "gpt-orb-text";

      const cursor = document.createElement("span");
      cursor.className = "gpt-cursor";
      textEl.appendChild(cursor);

      orbInner.appendChild(textEl);
      orb.appendChild(orbInner);
      orbWrap.appendChild(orb);
      wrapper.appendChild(orbWrap);

      let i = 0;
      const type = () => {
        if (i < this.responseText.length) {
          const charNode = document.createTextNode(this.responseText[i]);
          textEl.insertBefore(charNode, cursor);
          i++;
          setTimeout(type, 30);
        } else {
          textEl.removeChild(cursor);
        }
      };
      type();
    }

    return wrapper;
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "GPT_RESPONSE") {
      this.responseText = payload.response;
      this.state = "speaking";
      this.updateDom();
    }

    if (notification === "SPEAKING_DONE") {
      this.state = "idle";
      this.responseText = "";
      this.updateDom();
      this.showAllOtherModules();
    }

    if (notification === "WAKE_WORD_DETECTED") {
      this.state = "listening";
      this.updateDom();
      this.sendSocketNotification("START_LISTENING");
      this.hideAllOtherModules();
    }
  },

  hideAllOtherModules() {
    const modules = MM.getModules();
    modules.enumerate((module) => {
      if (module.name !== this.name) {
        module.hide(500);
      }
    });

    const compliments = document.getElementById("module_0_compliments");
    if (compliments) compliments.style.display = "none";
  },

  showAllOtherModules() {
    const modules = MM.getModules();
    modules.enumerate((module) => {
      if (module.name !== this.name) {
        module.show(500);
      }
    });

    const compliments = document.getElementById("module_0_compliments");
    if (compliments) compliments.style.display = "block";
  },

  getStyles() {
    return ["MMM-GPT-Voice.css"];
  }
});
