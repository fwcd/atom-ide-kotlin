const { AutoLanguageClient, DownloadFile } = require("atom-languageclient");
const cp = require("child_process");
const path = require("path");
const semver = require("semver");
const { downloadServer, latestServerVersion, installedServerInfo, updateInstalledServerInfo } = require("./languageServerDownloader");

class KotlinLanguageClient extends AutoLanguageClient {
    constructor() {
        super();
        this.statusMessage = document.createElement("span");
    }

    getGrammarScopes() { return ["source.kotlin"]; }

    getLanguageName() { return "Kotlin"; }

    getServerName() { return "KotlinLanguageServer"; }

    async startServerProcess(projectPath) {
        const installDir = path.join(__dirname, "..", "install");
        
        const latestVersion = await latestServerVersion();
        const serverInfo = (await installedServerInfo(installDir)) || { version: "0.0.0", lastUpdate: Number.MIN_SAFE_INTEGER };
        const installedVersion = serverInfo.version;
        const serverNeedsUpdate = semver.gt(latestVersion, installedVersion);
        const secondsSinceLastUpdate = (Date.now() - serverInfo.lastUpdate) / 1000;
        
        if (serverNeedsUpdate && (secondsSinceLastUpdate > 120)) {
            await downloadServer(installDir, msg => this.updateStatusMessage(msg));
            await updateInstalledServerInfo(installDir, {
                version: latestVersion,
                lastUpdate: Date.now()
            });
        }

        const serverPath = path.join(installDir, "server", "bin", this.correctScriptName("kotlin-language-server"));
        const process = cp.spawn(serverPath);

        process.on("close", () => {
            if (!process.killed) {
                atom.notifications.addError("Kotlin Language Server closed unexpectedly.", {
                    dismissable: true
                });
            }
        });

        return process;
    }

    async isServerPresent(installDir) {
        return await fsExists(path.join(installDir, "bin"));
    }

    async downloadServer(installDir) {

    }

    correctScriptName(name) {
        return name + ((process.platform === "win32") ? ".bat" : "");
    }

    preInitialization(connection) {
        this.updateStatusMessage("Activating Kotlin LS");
    }

    postInitialization(server) {
        this.updateStatusMessage("Kotlin LS ready");
    }

    consumeStatusBar(statusBar) {
        this.statusBar = statusBar
        if (!this.statusTile) {
            this.createStatusTile();
        }
    }

    updateStatusMessage(message) {
        this.statusMessage.textContent = message;
        if (!this.statusTile && this.statusBar) {
            this.createStatusTile();
        }
    }

    createStatusTile() {
        this.statusTile = this.statusBar.addRightTile({ item: this.statusMessage, priority: 500 });
    }
}

module.exports = new KotlinLanguageClient();
