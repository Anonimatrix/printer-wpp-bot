const { pricePerPage } = require("./billing");

module.exports = {
    response: {
        initial: {
            message: "Bienvenido, mande el archivo que quiera imprimir",
        },
        file: {
            function: "manageFile",
            functionMessages: {
                received: "Archivo recibido correctamente",
                invalidFile: "El archivo debe ser un pdf",
            },
        },
        createPayment: {
            function: "createPayment",
            functionMessages: {
                creating: "Creando url de pago...",
                created:
                    "Debe pagar a la siguiente url: ${url}\n Son ${pages} paginas y el costo es ${price} ARS",
            },
            next: "questPayment",
        },
        questPayment: {
            buttons: {
                title: "Realizar pago",
                footer: "",
                content: [{ body: "Realizado" }],
                body: "Aprete el boton cuando haya realizado el pago",
            },
            options: [{ value: "Realizado", next: "checkPayment" }],
        },
        checkPayment: {
            message: "Chequeando pago...",
            function: "checkPayment",
            functionMessages: {
                notPaid:
                    "El pago no se ha realizado correctamente.\nSi ya realizo el pago, reintentelo mas tarde",
                paid: "Pago ejecutado correctamente. Se esta mandando a imprimir el archivo",
            },
        },
        finish: {
            message: "Finalizado",
        },
    },
};
