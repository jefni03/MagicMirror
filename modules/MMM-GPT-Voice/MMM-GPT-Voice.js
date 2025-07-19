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
		this.state = "idle"; // idle | listening | speaking
	},

	getDom() {
		const wrapper = document.createElement("div");
		wrapper.className = "gpt-script-wrapper";

		if (this.state === "listening") {
			const orb = document.createElement("div");
			orb.className = "gpt-orb";

			const dots = document.createElement("div");
			dots.className = "gpt-orb-dots";
			dots.innerHTML = "<span>.</span><span>.</span><span>.</span>";
			orb.appendChild(dots);

			wrapper.appendChild(orb);
		}

		return wrapper;
	},

	socketNotificationReceived(notification, payload) {
		if (notification === "GPT_RESPONSE") {
			this.responseText = payload.response;
			this.state = "speaking";
			this.updateDom();

			setTimeout(() => {
				this.responseText = null;
				this.state = "idle";
				this.updateDom();
			}, 15000);
		}

		if (notification === "WAKE_WORD_DETECTED") {
			this.state = "listening";
			this.responseText = null;
			this.updateDom();
			this.sendSocketNotification("START_LISTENING");
		}
	},

	getStyles() {
		return ["MMM-GPT-Voice.css"];
	}
});
