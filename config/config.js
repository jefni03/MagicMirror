/* Config Sample
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 *
 * You can use environment variables using a `config.js.template` file instead of `config.js`
 * which will be converted to `config.js` while starting. For more information
 * see https://docs.magicmirror.builders/configuration/introduction.html#enviromnent-variables
 */

let config = {
	address: "localhost", // Address to listen on, can be:
	// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	// - another specific IPv4/6 to listen on a specific interface
	// - "0.0.0.0", "::" to listen on any interface
	// Default, when address config is left out or empty, is "localhost"
	port: 8081,
	basePath: "/", // The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
	// you must set the sub path here. basePath must end with a /
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"], // Set [] to allow all IP addresses
	// or add a specific IPv4 of 192.168.1.5 :
	// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false, // Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "", // HTTPS private key path, only require when useHttps is true
	httpsCertificate: "", // HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US", // this variable is provided as a consistent location
	// it is currently only used by 3rd party modules. no MagicMirror code uses this value
	// as we have no usage, we  have no constraints on what this field holds
	// see https://en.wikipedia.org/wiki/Locale_(computer_software) for the possibilities

	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 24,
	units: "imperial",

	modules: [
		// other modules
		{},

		{
			module: "MMM-GPT-Voice",
			position: "middle_center",
			config: {
				model: "gpt-3.5-turbo",
				maxTokens: 500,
				temperature: 0.8
			}
		},

		{
			module: "alert"
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "calendar",
			header: "US Holidays",
			position: "top_left",
			config: {
				calendars: [
					{
						fetchInterval: 7 * 24 * 60 * 60 * 1000,
						symbol: "calendar-check",
						url: "https://ics.calendarlabs.com/76/mm3137/US_Holidays.ics"
					}
				]
			}
		},
		{
			module: "compliments",
			position: "lower_third"
		},
		{
			module: "weather",
			position: "top_right",
			header: "Rowland Heights",
			config: {
				weatherProvider: "openmeteo",
				type: "current",
				lat: 33.93,
				lon: -117.9477
			}
		},
		{
			module: "weather",
			position: "top_right",
			header: "Weather Forecast for Rowland Heights",
			config: {
				weatherProvider: "openmeteo",
				type: "forecast",
				lat: 33.93,
				lon: -117.9477
			}
		},

		{
			module: "newsfeed",
			position: "bottom_bar",
			config: {
				feeds: [
					{
						title: "New York Times",
						url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
					}
				],
				showSourceTitle: true,
				showPublishDate: true,
				broadcastNewsFeeds: true,
				broadcastNewsUpdates: true
			}
		},
		{
			/* Don't share your credentials! */
			module: "MMM-OnSpotify",
			position: "middle_center" /* bottom_left, bottom_center */,
			// //jeff
			// config: {
			// 	clientID: "003f253dfa1a4274be03cb7b07495676",
			// 	clientSecret: "e2d2f3fb35e34f2080d885fb1943be07",
			// 	accessToken:
			// 		"BQAap_G5_0YK2O96hDe-ITG_ZDfaBLPHLP8OFmsZSjFq0-Ps9Qv1Gl8pg1Ko1vqgLg37TtXe0Izc4_YsqtAyNfQLQETYeMgdtLSCyS1SL5oGA82R4_awNwX9lf3E8Nb2NOnHuquYcSKRI3mvqVTsN97qzHmZ61e_CSuGGJEobTSfeYxjR0y-Rozm4ksvELBRITskFs_dxd0d4Zsme98JLqVHrN6Lgn9VkH7VFg60fWRlN05j2CDFaxW4Rw86iZc6y3tkyepKRg",
			// 	refreshToken: "AQAPgLSk1ctl1zpCW5R7WIk9EKwvRIBG9xKJinrA_CiscqArJ7c8xQUcJHLt4D472613OVGGO8tREORE-ZwIxaB2oybOzs3POG7B38_49wEn4pjHg_G0h5btDSgh_lhsAn0"
			// 	/* Add here your configurations */
			// }
			//malcolm
			// position: "middle_center" /* bottom_left, bottom_center */,
			config: {
				clientID: "4c956895af654f3cb191664803402f81",
				clientSecret: "2c1e9f30edaf4f609b4a154f8fb3d69c",
				accessToken:
					"BQBf6tDlSNMuFvQGdSxH41OVwGbgLStTvzk_vzaxFFq8QSOoZRq6Sa78igNGDQ6pK1vNKj95uw9h_ZBwn4UxSEDLEXrOxBJIKaBgV13tSPYfvQNi0v6jufCi8LzTh6U33anrvHeC0dIuE9CbQOnOkmMl1YXp2TZlXFh5sZiu4j9OoeHUdh6Grg7ebwWUwoOO5cQ9RVVktSJrsf0qbMlQSusBYLqvUv0_a4BAz8Ws_P0nSqmWuMjTLMC5_Xp7D8Wj6BSXqGjQfiEk71GP",
				refreshToken: "AQCz9gSZkPAqrekZGcfoeGQZLV_aIBMg9VoQxexsm_rU1zp7KhAFdzAzgPlHUjsQFGd_lzjXGuNUx-AMy5Qq5c7zYFf4Pdqk96b5-hX-OfeI3H0bRbwDYH26YhOVKZTndeE",
				redirectUri: "http://127.0.0.1:8100/callback",
				/* Add here your configurations */
				// Animations look "better" with a Pi5
				mediaAnimations: true,
				fadeAnimations: true,
				scrollAnimations: true,
				textAnimations: true,
				transitionAnimations: true,
				spotifyVectorAnimations: true,
				//that lil barcode thing not necessary
				spotifyCodeExperimentalShow: false,
				blurCorrectionInFrameSide: true,
				blurCorrectionInAllSides: true
			}
		},
		{
			module: "MMM-OnSpotifyControl",
			position: "top_right", // position doesn't matter, no UI
			config: {
				clientID: "4c956895af654f3cb191664803402f81",
				clientSecret: "2c1e9f30edaf4f609b4a154f8fb3d69c",
				accessToken:
					"BQBf6tDlSNMuFvQGdSxH41OVwGbgLStTvzk_vzaxFFq8QSOoZRq6Sa78igNGDQ6pK1vNKj95uw9h_ZBwn4UxSEDLEXrOxBJIKaBgV13tSPYfvQNi0v6jufCi8LzTh6U33anrvHeC0dIuE9CbQOnOkmMl1YXp2TZlXFh5sZiu4j9OoeHUdh6Grg7ebwWUwoOO5cQ9RVVktSJrsf0qbMlQSusBYLqvUv0_a4BAz8Ws_P0nSqmWuMjTLMC5_Xp7D8Wj6BSXqGjQfiEk71GP",
				refreshToken: "AQCz9gSZkPAqrekZGcfoeGQZLV_aIBMg9VoQxexsm_rU1zp7KhAFdzAzgPlHUjsQFGd_lzjXGuNUx-AMy5Qq5c7zYFf4Pdqk96b5-hX-OfeI3H0bRbwDYH26YhOVKZTndeE",
				redirectUri: "http://127.0.0.1:8100/callback" // or your redirect URI
			}
		}
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
	module.exports = config;
}
