// A small script to download the TextMate grammar
// for Kotlin at compile time (i.e. before packaging the extension)

const request = require("request");
const path = require("path");
const extractZip = require("extract-zip");
const fs = require("fs");

const GRAMMAR_URL = "https://github.com/fwcd/kotlin-language-server/releases/latest/download/grammars.zip";
const GRAMMARS_PATH = path.join(__dirname, "..", "grammars");
const DOWNLOAD_PATH = path.join(GRAMMARS_PATH, "grammarsDownload.zip");

console.log("Downloading grammars...");
request.get(GRAMMAR_URL)
	.on("complete", () => {
		console.log("Extracting grammars...");
		extractZip(DOWNLOAD_PATH, { dir: GRAMMARS_PATH })
			.then(() => {
				console.log("Cleaning up downloaded zip...");
				fs.unlink(DOWNLOAD_PATH, err => {
					if (err) console.log(err);
				});
			})
			.catch(e => console.log(e));
	})
	.on("error", err => console.log(err))
	.pipe(fs.createWriteStream(DOWNLOAD_PATH));
