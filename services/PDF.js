const pdfjsLib = require("pdfjs-dist");

class PDF {
    static async countPages(pdfPath) {
        const doc = await pdfjsLib.getDocument(pdfPath).promise;

        return doc.numPages;
    }
}

module.exports = PDF;
