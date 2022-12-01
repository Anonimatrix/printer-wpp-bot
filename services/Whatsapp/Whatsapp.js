const { Client, LocalAuth } = require("whatsapp-web.js");
const { qr, ready, message } = require("./listeners");
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
});

class WhatsappBot {
    async init() {
        this.setListeners();
        await client.initialize();
    }

    setListeners() {
        client.on("qr", qr);
        client.on("ready", ready);
        client.on("message", (msg) => message(client, msg));
    }
}

module.exports = { WhatsappBot };
