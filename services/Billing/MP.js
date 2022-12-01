const axios = require("axios");
const mercadopago = require("mercadopago");
const config = require("../../config/billing");

mercadopago.merchant_orders.search = async function (options) {
    return (
        await axios.get("https://api.mercadopago.com/merchant_orders/search", {
            params: options,
            headers: {
                Authorization: "Bearer " + config.accessToken,
            },
        })
    ).data;
};

class MP {
    service;
    preference;
    order;
    index = 0;

    init() {
        mercadopago.configure({
            access_token: config.accessToken,
        });
        return this;
    }

    setPages(pages) {
        this.pages = pages;
        return this;
    }

    async setPreference(id) {
        if (id) {
            this.preference = { id };
            return;
        }
        const preference = {
            items: [
                {
                    title: `Impresion-${this.index}`,
                    quantity: this.pages,
                    currency_id: "ARS",
                    unit_price: config.pricePerPage,
                },
            ],
        };

        const res = await mercadopago.preferences.create(preference);
        this.preference = res.body;
    }

    paymentUrl() {
        return this.preference.init_point;
    }

    getPreferenceId() {
        return this.preference.id;
    }

    async isPaid() {
        let paid = false;
        const res = await mercadopago.merchant_orders.search({
            preference_id: this.preference.id,
            order_status: "paid",
        });
        if (res.elements && res.elements.length > 0) paid = true;

        return paid;
    }

    getPreferencePrice() {
        let price = 0;
        for (let item of this.preference.items) {
            price += item.quantity * item.unit_price;
        }

        return price;
    }
}

module.exports = {
    MP,
};
