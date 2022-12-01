const { writeFile } = require("fs/promises");
const { MP } = require("../../Billing/MP");
const PDF = require("../../PDF");
const Printer = require("../../Printer");
const chatConfig = require("../../../config/chat");
const { getPath } = require("../../../config/files");

const mp = new MP();

mp.init();

const replaceVars = (text, vars) => {
    let replaced = text;
    const keys = Object.keys(vars);

    keys.forEach((key) => {
        replaced = replaced.replaceAll(
            new RegExp("\\$\\{" + key + "\\}", "g"),
            vars[key]
        );
    });

    return replaced;
};

module.exports = {
    manageFile: async (client, message, chat, extra, response) => {
        const { messageDb } = extra;
        const { filename } = messageDb;
        const media = await message.downloadMedia();
        if (!media.filename.includes(".pdf")) {
            await chat.sendMessage(response.functionMessages.invalidFile);
            await messageDb.update({ status: "finish" });
            return;
        }

        await writeFile(getPath(filename), media.data, "base64");
        await chat.sendMessage(response.functionMessages.received);
        return { next: "createPayment" };
    },
    createPayment: async (client, message, chat, extra, response) => {
        const { messageDb } = extra;
        const { filename } = messageDb;
        let pages = await PDF.countPages(getPath(filename));
        await chat.sendMessage(response.functionMessages.creating);
        mp.setPages(pages);
        await mp.setPreference();
        const id = mp.getPreferenceId();
        const price = mp.getPreferencePrice();
        const url = mp.paymentUrl();

        await chat.sendMessage();
        await chat.sendMessage(
            replaceVars(response.functionMessages.created, {
                url,
                price,
                pages,
            })
        );
        await messageDb.update({
            preference_id: id,
            status: response.next ?? "createPayment",
        });
    },
    checkPayment: async (client, message, chat, extra, response) => {
        const { messageDb, lastResponseIndex } = extra;
        const { filename } = messageDb;
        mp.setPreference(messageDb.preference_id);
        const isPaid = await mp.isPaid();
        if (!isPaid) {
            await chat.sendMessage(response.functionMessages.notPaid);
            await messageDb.update({ status: lastResponseIndex });
            return { next: lastResponseIndex };
        }

        await chat.sendMessage(response.functionMessages.paid);
        await Printer.print(getPath(filename));
        await messageDb.update({ status: "finish" });
    },
};
