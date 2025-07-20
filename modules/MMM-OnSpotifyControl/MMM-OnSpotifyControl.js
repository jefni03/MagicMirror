Module.register("MMM-OnSpotifyControl", {
  start() {
    this.sendSocketNotification("SPOTIFY_INIT", this.config);
  },

  notificationReceived(notification, payload, sender) {
    console.log("[Frontend SpotifyControl] Received command");

    const commandMap = {
      "SPOTIFY_SKIP_COMMAND": this.skip.bind(this),
      "SPOTIFY_PLAY_COMMAND": this.play.bind(this),
      "SPOTIFY_PAUSE_COMMAND": this.pause.bind(this),
      "SPOTIFY_PREVIOUS_COMMAND": this.previous.bind(this),
    };

    const action = commandMap[notification];
    if (action) {
      action();
    }
  },

  // socketNotificationReceived(notification, payload) {
  //   if (notification === "SPOTIFY_RESPONSE") {
  //     console.log("[MMM-OnSpotifyControl] Spotify response:", payload);
  //   }
  // },

  play() {
    this.sendSocketNotification("SPOTIFY_PLAY");
  },
  skip() {
    this.sendSocketNotification("SPOTIFY_SKIP");
  },
  pause() {
    this.sendSocketNotification("SPOTIFY_PAUSE");
  },
  previous() {
    this.sendSocketNotification("SPOTIFY_PREVIOUS");
  }

});