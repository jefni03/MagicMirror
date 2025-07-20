const fs = require("fs");
const http = require("http");

const configPath = "./config/config.js";

http.get("http://ipapi.co/json", (res) => {
	let data = "";

	res.on("data", (chunk) => (data += chunk));
	res.on("end", () => {
		try {
			const location = JSON.parse(data);
			const lat = location.latitude;
			const lon = location.longitude;
			const city = location.city;

			if (!lat || !lon || !city) {
				console.error("❌ Could not get location details.");
				return;
			}

			let content = fs.readFileSync(configPath, "utf-8");

			content = content
				.replace(/lat:\s*-?\d+(\.\d+)?/g, `lat: ${lat}`)
				.replace(/lon:\s*-?\d+(\.\d+)?/g, `lon: ${lon}`)
				.replace(/LOCATION_HERE/g, city);

			fs.writeFileSync(configPath, content, "utf-8");

			console.log(`✅ config.js updated with ${city} (${lat}, ${lon})`);
		} catch (err) {
			console.error("❌ Error parsing location:", err.message);
		}
	});
}).on("error", (err) => {
	console.error("❌ Failed to fetch location:", err.message);
});
