Module.register("MMM-OnSpotifyControl", {
  // No UI, so no getDom or styles needed
  start() {
    this.sendSocketNotification("SPOTIFY_INIT", this.config);
    this.sendSocketNotification("SPOTIFY_SKIP", this.config)
  },

  socketNotificationReceived(notification, payload) {
    console.log("[Frontend SpotifyControl] Response Received");
    if (notification === "SPOTIFY_RESPONSE") {
      console.log("[MMM-OnSpotifyControl] Spotify response:", payload);
    }
  },

  // For testing: expose methods to send play/skip commands from console
  // Later these can be triggered by voice commands
  play() {
    this.sendSocketNotification("SPOTIFY_PLAY");
  },

  skip() {
    this.sendSocketNotification("SPOTIFY_SKIP");
  }
});
