const mammoth = require('mammoth');
const docx = require('docx');
const { saveAs } = require('file-saver');

exports.loadDocx = (buffer) => {
    return mammoth.convertToHtml({buffer:buffer}).then((result) => {
        return result.value;
    });
}

exports.saveAsDocxFile =(collectedEntriesContainer) => {

    // Extract raw text
    let textContentContainer = [];
    const entriesForDocx = collectedEntriesContainer.querySelectorAll('.selected-entry');

    entriesForDocx.forEach((entry, index1) => {
        textContentContainer.push([])
        entry.childNodes.forEach((child, index2) => {
            if (child.tagName === 'P' && index2 < 4) {
                textContentContainer[index1].push(child.textContent.split(' '))
            } else if (index2 === 4) {
                textContentContainer[index1].push('CONTENT:')
            } else if (child.tagName === 'DIV') {
                textContentContainer[index1].push(child.textContent)
            }
        })
    })

    const doc = new docx.Document();

    for (let i = 0; i < textContentContainer.length; i++) {
        doc.addSection ({
            children: [
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: textContentContainer[i][0][0],
                            bold: true,
                        }),
                        new docx.TextRun({
                            text: ` ${textContentContainer[i][0].splice(1).join(" ")}`,
                        }),
                    ]
                }),
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: textContentContainer[i][1][0],
                            bold: true,
                        }),
                        new docx.TextRun({
                            text: ` ${textContentContainer[i][1].splice(1).join(" ")}`,
                        }),
                    ]
                }),
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: textContentContainer[i][2][0],
                            bold: true,
                        }),
                        new docx.TextRun({
                            text: ` ${textContentContainer[i][2].splice(1).join(" ")}`,
                        }),
                    ]
                }),
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: textContentContainer[i][3],
                            bold: true,
                        }),
                    ]
                }),
                new docx.Paragraph(textContentContainer[i][4]),
            ],
        });
    }
    

    // Package and download new docx
    docx.Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${newFileName.value}`);
    });

}