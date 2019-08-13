const { DownloadFile } = require("atom-languageclient");
const { fsExists, fsMkdir, fsUnlink, fsReadFile, fsWriteFile } = require("./fsUtils");
const { httpsGet } = require("./httpsUtils");
const { promisify } = require("util");
const extractZip = promisify(require("extract-zip"));
const semver = require("semver");
const path = require("path");

const KLS_DOWNLOAD_URL = "https://github.com/fwcd/kotlin-language-server/releases/latest/download/server.zip";

async function latestServerVersion() {
    const rawJson = await httpsGet({
        hostname: "api.github.com",
        path: "/repos/fwcd/kotlin-language-server/releases/latest",
        headers: { "User-Agent": "atom-ide-kotlin" }
    });
    const result = JSON.parse(rawJson);
    return result.tag_name;
}

function serverInfoFile(installDir) {
    return path.join(installDir, "SERVER-INFO");
}

/** Fetches the installed server info or null if there is none. */
async function installedServerInfo(installDir) {
    try {
        const info = JSON.parse((await fsReadFile(serverInfoFile(installDir))).toString("utf8"));
        return semver.valid(info.version) ? info : null;
    } catch {
        return null;
    }
}

async function updateInstalledServerInfo(installDir, info) {
    await fsWriteFile(serverInfoFile(installDir), JSON.stringify(info), { encoding: "utf8" });
}

async function downloadServer(installDir, progressMessage) {
    if (!(await fsExists(installDir))) {
        await fsMkdir(installDir, { recursive: true });
    }

    const installParentDir = path.join(installDir, "..")
    const downloadDest = path.join(installParentDir, "serverDownload.zip")
    await DownloadFile(KLS_DOWNLOAD_URL, downloadDest, (bytes, percent) => {
        const progress = (percent == null) ? (bytes == null ? "?" : `${bytes / 1000000} MB`) : `${percent} %`;
        progressMessage(`Downloading Kotlin LS (${progress})`);
    });

    progressMessage("Unpacking Kotlin LS");
    await extractZip(downloadDest, { dir: installDir });
    await fsUnlink(downloadDest);
}

module.exports = { latestServerVersion, installedServerInfo, updateInstalledServerInfo, downloadServer };
