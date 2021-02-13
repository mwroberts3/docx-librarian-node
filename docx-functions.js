const mammoth = require('mammoth');
const HTMLtoDOCX = require('html-to-docx');

exports.loadDocx = (buffer) => {
    return mammoth.convertToHtml({buffer:buffer})
        .then((result) => {
        return result.value;
        })
        .catch(err => {
            throw new Error(err)
        });
}

exports.saveAsDocxFile = (sectionsToSaveArr) => {
    let chunkToReplace1a = RegExp(`<p class="show-entry-content hover-bold">Show Content</p><p class="remove-selected-entry hover-bold">x</p>`, "gi");
    let chunkToReplace1b = RegExp(`<div class="hidden-entry-content">`, "gi");
    let chunkToReplace2 = RegExp(`<div class="hidden-entry-content">`, "gi");
    let chunkToReplace3 = RegExp(`<p></p>`, "gi");
    let chunkToReplace4 = RegExp(`<p><strong></strong></p><strong>`, "gi");

    sectionsToSaveArr = sectionsToSaveArr.replace(chunkToReplace1a, '<strong>CONTENT:</strong>');
    sectionsToSaveArr = sectionsToSaveArr.replace(chunkToReplace1b, '');
    sectionsToSaveArr = sectionsToSaveArr.replace(chunkToReplace2, '');
    sectionsToSaveArr = sectionsToSaveArr.replace(chunkToReplace3, '');
    sectionsToSaveArr = sectionsToSaveArr.replace(chunkToReplace4, '');

    let fileBuffer = HTMLtoDOCX(sectionsToSaveArr, null, {
          table: { row: { cantSplit: true } },
          footer: true,
          pageNumber: false,
        });   
    
    return fileBuffer;
}
    