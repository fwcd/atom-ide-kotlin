const fs = require("fs");
const { promisify } = require("util");

module.exports = {
    async fsExists(path) {
        try {
            await fs.promises.access(path);
            return true;
        } catch {
            return false;
        }
    }
};
