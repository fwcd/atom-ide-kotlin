// A small script to download the TextMate grammar
// for Kotlin at compile time (i.e. before packaging the extension)

const request = require("request");
const path = require("path");
const extractZip = require("extract-zip");
const fs = require("fs");

const GRAMMAR_ZIP_URL = "https://github.com/fwcd/kotlin-language-server/releases/latest/download/grammars.zip";
const GRAMMAR_NAME = "Kotlin.tmLanguage.json";
const GRAMMARS_PATH = path.join(__dirname, "..", "grammars");
const GRAMMAR_PATH = path.join(GRAMMARS_PATH, GRAMMAR_NAME);
const DOWNLOADS_PATH = path.join(__dirname, "..", "downloads");
const DOWNLOAD_ZIP_PATH = path.join(DOWNLOADS_PATH, "grammars.zip");
const DOWNLOAD_GRAMMAR_PATH = path.join(DOWNLOADS_PATH, GRAMMAR_NAME);

console.log("Downloading grammars...");
fs.promises.mkdir(DOWNLOADS_PATH, { recursive: true })
	.then(() => {
		request.get(GRAMMAR_ZIP_URL)
			.on("complete", () => {
				console.log("Extracting grammars...");
				extractZip(DOWNLOAD_ZIP_PATH, { dir: DOWNLOADS_PATH })
					.then(() => fs.promises.mkdir(GRAMMARS_PATH, { recursive: true }))
					.then(() => fs.promises.copyFile(DOWNLOAD_GRAMMAR_PATH, GRAMMAR_PATH))
					.then(() => fs.promises.unlink(DOWNLOAD_ZIP_PATH))
					.catch(e => console.log(e));
			})
			.on("error", e => console.log(e))
			.pipe(fs.createWriteStream(DOWNLOAD_ZIP_PATH));
		})
		.catch(e => console.log(e));
