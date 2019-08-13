"use strict";
const gulp = require("gulp");
const download = require("gulp-download");
const filter = require("gulp-filter");
const decompress = require('gulp-decompress');

gulp.task("downloadLanguageServer", done => {
	download("https://github.com/fwcd/kotlin-language-server/releases/latest/download/server.zip")
		.pipe(decompress())
		.pipe(gulp.dest("."));
	done();
});

gulp.task("downloadTextMateGrammars", done => {
	download("https://github.com/fwcd/kotlin-language-server/releases/latest/download/grammars.zip")
		.pipe(decompress())
		.pipe(filter("Kotlin.tmLanguage.json"))
		.pipe(gulp.dest("grammars"));
	done();
});
