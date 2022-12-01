const mongoose = require("mongoose");
const config = require("../config/db");

module.exports = class DB {
    async connect() {
        const uri = `mongodb://${
            config.user ? config.user + ":" + config.password : ""
        }${config.host}:${config.port}/${config.db}`;

        await mongoose.connect(uri);
    }
};
