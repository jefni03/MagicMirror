const NodeHelper = require("node_helper");
const SpotifyWebApi = require("spotify-web-api-node");

module.exports = NodeHelper.create({
    start() {
        this.spotifyApi = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.clientId = null;
        this.clientSecret = null;
        this.redirectUri = null;

        // Listen to all socket notifications for debug
        this.sendSocketNotification = this.sendSocketNotification.bind(this);

        this._socket = this._socket || null;
        this.socket = null;

        // Listen to all socket notifications globally (if possible)
        // Actually, we want to add a hook to socket.io directly:
        this.nodeHelperServer = this.nodeHelperServer || null;

        // if (this.nodeHelperServer) {
        //     this.nodeHelperServer.on("connection", (socket) => {
        //     console.log("[MMM-OnSpotifyControl] Socket connected:", socket.id);
        //     socket.on("socketNotification", (payload) => {
        //         console.log("[MMM-OnSpotifyControl] socketNotification event received:", payload);
        //     });
        //     });
        // }
    },


  socketNotificationReceived(notification, payload) {
    console.log("[Backend SpotifyControl] Notification Received");
    if (notification === "SPOTIFY_INIT") {
      this.clientId = payload.clientId;
      this.clientSecret = payload.clientSecret;
      this.redirectUri = payload.redirectUri;
      this.refreshToken = payload.refreshToken;  // You'll need to get this after OAuth flow

      this.spotifyApi = new SpotifyWebApi({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        redirectUri: this.redirectUri,
      });

      if (this.refreshToken) {
        this.spotifyApi.setRefreshToken(this.refreshToken);
        this.refreshAccessToken();
      } else {
        console.warn("[MMM-OnSpotifyControl] No refresh token provided.");
      }
    }

    if (notification === "SPOTIFY_PLAY") {
      this.spotifyApi.play()
        .then(() => {
          this.sendSocketNotification("SPOTIFY_RESPONSE", "Playback started");
        })
        .catch(err => {
          this.sendSocketNotification("SPOTIFY_RESPONSE", "Error playing: " + err.message);
        });
    }

    if (notification === "SPOTIFY_SKIP") {
      this.spotifyApi.skipToNext()
        .then(() => {
          this.sendSocketNotification("SPOTIFY_RESPONSE", "Skipped to next track");
          console.log("[MMM-OnSpotifyControl] Skipped to next track");
        })
        .catch(err => {
          this.sendSocketNotification("SPOTIFY_RESPONSE", "Error skipping: " + err.message);
        });
    }
  
    if (notification === "SPOTIFY_PAUSE") {
      this.spotifyApi.pause()
        .then(() => {
          this.sendSocketNotification("SPOTIFY_RESPONSE", "Playback Paused");
          console.log("[MMM-OnSpotifyControl] Paused track");
        })
        .catch(err => {
          this.sendSocketNotification("SPOTIFY_RESPONSE", "Error pausing: " + err.message);
        });
    }
        
    if (notification === "SPOTIFY_PREVIOUS") {
      this.spotifyApi.skipToPrevious()
        .then(() => {
          this.sendSocketNotification("SPOTIFY_RESPONSE", "Skipped to previous track");
          console.log("[MMM-OnSpotifyControl] Skipped to previous track");
        })
        .catch(err => {
          this.sendSocketNotification("SPOTIFY_RESPONSE", "Error skipping: " + err.message);
        });
    }
  },

  refreshAccessToken() {
    this.spotifyApi.refreshAccessToken()
      .then(data => {
        this.accessToken = data.body['access_token'];
        this.spotifyApi.setAccessToken(this.accessToken);
        console.log("[MMM-OnSpotifyControl] Access token refreshed");
      })
      .catch(err => {
        console.error("[MMM-OnSpotifyControl] Could not refresh access token", err);
      });
  }
});
