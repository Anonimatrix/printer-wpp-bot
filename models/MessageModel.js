const { model, Schema } = require("mongoose");

const schema = new Schema(
    {
        number: String,
        content: String,
        status: String,
        preference_id: String,
        filename: String,
    },
    { timestamps: true }
);

module.exports = model("Message", schema);
