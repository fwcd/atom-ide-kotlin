const https = require("https");
const { promisify } = require("util");

module.exports = {
    httpsGet(options) {
        return new Promise((resolve, reject) => {
            let request = https.get(options, res => {
                let data = "";
                res.on("data", chunk => data += chunk.toString("utf8"));
                res.on("end", () => resolve(data));
            });
            request.on("error", err => reject(err));
        });
    }
};
