const mammoth = require('mammoth');
const docx = require('docx');
const { saveAs } = require('file-saver');
const fs = require('fs');

exports.loadDocx = (buffer) => {
    return mammoth.convertToHtml({buffer:buffer})
        .then((result) => {
        return result.value;
        })
        .catch(err => {
            throw new Error(err)
        });
}

exports.saveAsDocxFile =(sectionsToSaveArr) => {

    // might want to try a different pluggin here, maybe html-to-docx
    const doc = new docx.Document();
        doc.addSection ({
            children: [
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: sectionsToSaveArr,
                            bold: false,
                        })
                    ]
                }),
            ],
        });
        return docx.Packer.toBuffer(doc)
    }
    