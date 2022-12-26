const { Buttons } = require("whatsapp-web.js");
const chatConfig = require("../../../config/chat");
const MessageModel = require("../../../models/MessageModel");
const functions = require("./functions");

class MessageManager {
    chat;

    constructor(client, message) {
        this.message = message;
        this.client = client;
    }

    async manage() {
        this.chat = await this.message.getChat();
        let lastMessage = await this.getLastMessageForNumber(this.message.from);
        let responseIndex = "";
        let lastResponse = "";

        const hasMedia = this.message.hasMedia;

        if (
            lastMessage &&
            (!lastMessage.status || lastMessage.status === "finish")
        )
            lastMessage = null;

        if (!lastMessage) {
            responseIndex = "initial";
        }

        if (lastMessage) lastResponse = chatConfig.response[lastMessage.status];

        if (lastResponse) {
            if (lastResponse.next) {
                responseIndex = lastResponse.next;
            }
            if (lastResponse.options) {
                const option = lastResponse.options.find(({ value }) => {
                    if (value == this.message.body) return true;
                    else false;
                });

                managementOption: if (!option) {
                    if (this.message.body === "Cerrar") break managementOption;
                    this.chat.sendMessage(
                        "Opcion no disponible. Seleccione una que le aparezca. Si no quiere continuar escriba 'Cerrar'"
                    );
                    return;
                } else {
                    responseIndex = option.next;
                }
            }
        }

        if (this.message.body === "Cerrar") {
            responseIndex = "finish";
            lastMessage = {};
        }

        if (hasMedia) responseIndex = "file";

        if (!lastMessage) lastMessage = {};

        const messageDb = await MessageModel.create({
            number: this.message.from,
            content: this.message.body,
            status: responseIndex,
            preference_id: lastMessage.preference_id ?? null,
            filename: lastMessage.filename ?? null,
        });

        if (hasMedia) {
            await messageDb.update({
                filename: messageDb._id + ".pdf",
            });
            messageDb.filename = messageDb._id + ".pdf";
        }

        if (!responseIndex) return;

        await this.response(responseIndex, {
            messageDb,
            lastResponse,
            lastResponseIndex: lastMessage.status,
        });
    }

    async response(index, extra) {
        const response = chatConfig.response[index];

        if (response.message) await this.chat.sendMessage(response.message);

        try {
            if (response.function) {
                const res = await functions[response.function](
                    this.client,
                    this.message,
                    this.chat,
                    extra,
                    response
                );
                if (res && res.next) await this.response(res.next, extra);
            }
        } catch (err) {
            await this.chat.sendMessage(
                'Error al ejecutar la funcion. Cierre y vuelva a intentar "Cerrar"'
            );
            console.log(err);
        }

        if (response.buttons) {
            const { body, title, footer, content } = response.buttons;
            const buttons = new Buttons(body, [...content], title, footer);
            await this.chat.sendMessage(buttons);
        }

        if (response.next) {
            await this.response(response.next, extra);
        }
    }

    async getLastMessageForNumber(number) {
        return await MessageModel.findOne({
            number,
        })
            .sort({ createdAt: -1 })
            .exec();
    }

    async isChatClosing() {}
}

module.exports = MessageManager;
