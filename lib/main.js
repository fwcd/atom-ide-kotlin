const { AutoLanguageClient, DownloadFile } = require("atom-languageclient");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const decompress = require("decompress");
const { promisify } = require("util");

const fsUnlink = promisify(fs.unlink);
const fsExists = promisify(fs.exists);
const fsMkdir = promisify(fs.mkdir);
const KLS_DOWNLOAD_URL = "https://github.com/fwcd/kotlin-language-server/releases/download/0.2.9/server.zip";

class KotlinLanguageClient extends AutoLanguageClient {
    constructor() {
        super();
        this.statusMessage = document.createElement("span");
    }

    getGrammarScopes() { return ["source.kotlin"]; }

    getLanguageName() { return "Kotlin"; }

    getServerName() { return "KotlinLanguageServer"; }

    async startServerProcess(projectPath) {
        const serverDir = path.join(__dirname, "..", "server");
        
        if (!(await this.isServerPresent(serverDir))) {
            await this.downloadServer(serverDir);
        }
        
        const serverPath = path.join(serverDir, "bin", this.correctScriptName("kotlin-language-server"));
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
    
    async isServerPresent(serverDir) {
        return await fsExists(path.join(serverDir, "bin"));
    }
    
    async downloadServer(serverDir) {
        if (!(await fsExists(serverDir))) {
            await fsMkdir(serverDir, { recursive: true });
        }
        
        const serverParentDir = path.join(serverDir, "..")
        const downloadDest = path.join(serverParentDir, "serverDownload.zip")
        await DownloadFile(KLS_DOWNLOAD_URL, downloadDest, (bytes, percent) => {
            this.updateStatusMessage(`Downloading Kotlin LS (${percent} %)`);
        });
        
        this.updateStatusMessage("Unpacking Kotlin LS");
        await decompress(downloadDest, serverParentDir);
        await fsUnlink(downloadDest);
        
        this.updateStatusMessage("Initializing Kotlin LS");
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
