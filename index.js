require("dotenv").config();
const DB = require("./services/DB");
const { WhatsappBot } = require("./services/Whatsapp/Whatsapp");

(async () => {
    const db = new DB();
    await db.connect();
    const wb = new WhatsappBot();
    await wb.init();
})();
