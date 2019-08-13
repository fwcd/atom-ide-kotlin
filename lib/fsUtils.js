const fs = require("fs");
const { promisify } = require("util");

module.exports = {
    fsUnlink: promisify(fs.unlink),
    fsExists: promisify(fs.exists),
    fsMkdir: promisify(fs.mkdir),
    fsReadFile: promisify(fs.readFile),
    fsWriteFile: promisify(fs.writeFile)
};
