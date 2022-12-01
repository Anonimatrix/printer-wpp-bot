const pdfPrinter = require("pdf-to-printer");
const { unlink } = require("fs/promises");

class Printer {
    static async print(filepath) {
        await pdfPrinter.print(filepath);
        await unlink(filepath);
    }
}

module.exports = Printer;
