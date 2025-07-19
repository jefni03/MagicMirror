// control.js
const io = require("socket.io-client");

// Connect to MagicMirror backend socket (default port 8080)
const socket = io("http://localhost:8080", {
  path: "/socket.io", // default, can be omitted
});

// Choose one of: 'SPOTIFY_PLAY', 'SPOTIFY_SKIP'
const COMMAND = process.argv[2] || "SPOTIFY_PLAY";

socket.on("connect", () => {
  console.log(COMMAND);
  console.log("{[control.js]} Connected to MagicMirror socket server");

  socket.emit("notification", COMMAND);

  setTimeout(() => socket.disconnect(), 1000);
});

socket.on("disconnect", () => {
  console.log("[control.js] Disconnected");
});
