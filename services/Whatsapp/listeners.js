const MessageManager = require("./MessageManager/MessageManager");
var qrcode = require("qrcode-terminal");

module.exports = {
    qr: (qr) => {
        qrcode.generate(qr, { small: true });
    },
    ready: () => {
        console.log("Inicializado correctamente");
    },
    message: (client, message) => {
        const mm = new MessageManager(client, message);
        mm.manage();
    },
};
