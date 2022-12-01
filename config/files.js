const path = require("path");

module.exports = {
    getPath: (filename) => {
        return path.join(__dirname, "..", "files", filename);
    },
};
