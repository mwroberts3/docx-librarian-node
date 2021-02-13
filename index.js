// DOM elements and variables
const section3a = document.getElementById("dl-category-select-3a"),
section3b = document.getElementById("raw-search-3b");

const useTemplateBtn = document.querySelector(".use-template"),
noTemplateBtn = document.querySelector(".no-template");

const fileUpload = document.querySelector("#file-upload");

const initialSearchBtn = document.getElementById("initial-search-button"),
caseSensitivity = document.getElementById('case-sensitive');
let initialSearchTerm = document.getElementById("initial-search-term");

const documentDisplay = document.getElementById("document-display"),
documentContent = document.querySelector(".document-content"),
searchStats = document.querySelector(".search-stats"),
searchedWord = document.querySelector(".searched-word"),
newSearchTerm = document.getElementById('new-search'),
newSearchBtn = document.querySelector(".new-search-btn");

const docsLink = document.getElementById('docs-link'),
dlDocs = document.getElementById('dl-docs');

const categoryList = document.querySelector(".category-list"),
nextBtn = document.getElementById("next-button"),
retreivedEntries = document.getElementById('retreived-entries'),
collectedEntriesContainer = document.querySelector(".collected-entries-container"),
selectDifCatBtn = document.getElementById("select-different-categories-btn"),
saveAsNewDocxFileBtn = document.getElementById("save-as-new-docx-file"),
newFileName = document.getElementById("save-as-new-file-input");

let dragStartIndex;
let dragged;

let sessionDocHTML = '';

let seperatedCategories = [];
let seperatedSelectedCategories = [];
let selectedCategories = [];
let slicedLabelList = [];
let uniqueLabelList = [];


// Event listeners
// Load .docx file
docsLink.addEventListener('click', () => dlDocs.style.display = 'block');

fileUpload.addEventListener("change", (e) => {
    document.getElementById('file-select-form').submit();
});

// Use template
useTemplateBtn.addEventListener('click', () => {
    section3a.classList.add("show")
    createCategoryList();
});

collectedEntriesContainer.addEventListener("click", (e) => {
    if(e.target.classList.contains("show-entry-content")){
        e.target.nextElementSibling.nextElementSibling.classList.toggle("show-content");
        e.target.textContent === 'Show Content' ? e.target.textContent = 'Hide Content' : e.target.textContent = 'Show Content';
    }
})

selectDifCatBtn.addEventListener('click', () => {
    retreivedEntries.style.display = 'none';
    collectedEntriesContainer.innerHTML = '';
    seperatedSelectedCategories.splice(0);
})

categoryList.addEventListener("click", (e) => {
    if (!e.target.checked && !e.target.classList.contains('category-checkbox-choose-all')){
        selectedCategories = selectedCategories.filter(catName => catName !== (e.target.nextElementSibling.textContent).trim());
    } else if (e.target.tagName === "INPUT" && !e.target.classList.contains("category-checkbox-choose-all") && e.target.checked)
    {
        selectedCategories.push((e.target.nextElementSibling.textContent).trim());
    } else if (e.target.classList.contains('category-checkbox-choose-all')) {

        if (!e.target.checked) {
            categoryList.childNodes.forEach(child => {
                child.firstChild.checked = false;
            })
            selectedCategories = [];
        } else {
            categoryList.childNodes.forEach(child => {
                child.firstChild.checked = true;
                if (child.childNodes[2]){
                    selectedCategories.push(child.childNodes[2].textContent);
                }
            })
        }
    }
    selectedCategories = [...new Set(selectedCategories)];
})

nextBtn.addEventListener("click", () => {
    if (selectedCategories.length < 1){
        window.alert("please select at least one category");
    } else {
        for (let i = 0; i < selectedCategories.length; i++) {
            for (let j = 0; j < seperatedCategories.length; j++) {
                if (selectedCategories[i] === seperatedCategories[j][2]) {
                    seperatedSelectedCategories.push(seperatedCategories[j]);
                }
            }
        }
      createDragandDropUI(seperatedSelectedCategories);
    }
}) 

saveAsNewDocxFileBtn.addEventListener("click", () => {
    document.getElementById('download-form-button').value = collectedEntriesContainer.innerHTML;
})

// No template
noTemplateBtn.addEventListener('click', () => section3b.classList.add("show"));

initialSearchBtn.addEventListener("click", () => {
    // Make sure search term is entered
    if (!initialSearchTerm.value) {
        window.alert('please enter search term');
    } else {
        initialSearchTerm = initialSearchTerm.value;
        documentDisplay.style.display = 'block';
        rawSearchDoc(document.getElementById('docx-as-html-view').innerHTML, initialSearchTerm);
    }
});

newSearchBtn.addEventListener("click", () => {
    rawSearchDoc(document.getElementById('docx-as-html-view').innerHTML, newSearchTerm.value);
})

// Functions
function createCategoryList() {
    let docxHtml = document.getElementById('docx-as-html-view').innerHTML;

    let list1 = docxHtml.split("<strong>LABEL:</strong> ");
    let list2 = docxHtml.split("<strong>LABEL: </strong>");
    let labelList = [];
    let tempSplit = [];

    let list = [...list1, ...list2];

    // Remove any empty entries
    list = list.map(row => row.trim())
    list = list.filter(row => row[0] !== "<");
  
    for(let i = 0; i < list.length; i++) {
        for(let j = 0; j < 100; j++){
            if (list[i][j] !== '<'){
                labelList[i] += list[i][j]
        } else {
            break;
        }
    }}

    labelList.forEach(label => {
        label = label.slice(9); 
        label = label[0].toUpperCase() + label.slice(1);
        slicedLabelList.push(label);
    })

    // Split each entry in list into two parts, the content headers and the actual content
    for (let i = 0; i < list.length; i++){
        tempSplit = list[i].split("CONTENT:");
        tempSplit[0] = `<p><strong>LABEL:</strong> ${tempSplit[0]}</p>`;
        tempSplit[2] = slicedLabelList[i];

        seperatedCategories.push(tempSplit);
    }

    let copy = slicedLabelList.slice(0);

    for (let i = 0; i < slicedLabelList.length; i++){

        let count = 0;

        for (let k = 0; k < copy.length; k++){
            if (slicedLabelList[i] === copy[k]){
                count++; 

                delete copy[k];
            }
        } 

        if (count > 0) {
            let cat = new Object();
            cat.catName = slicedLabelList[i];
            cat.count = count;
    
            uniqueLabelList.push(cat);
        }

    }

    uniqueLabelList.sort((a,b) => {
        let nameA = a.catName.toLowerCase();
        let nameB = b.catName.toLowerCase();

        if (nameA < nameB){
            return -1;
        }
    });

    categoryList.innerHTML  += `<div><input class="category-checkbox-choose-all" type="checkbox">&nbsp;SELECT ALL`

    uniqueLabelList.forEach((row) => {
        categoryList.innerHTML += `<div><input class="category-checkbox"type="checkbox">&nbsp;<span>${row.catName}</span> (${row.count})</div>`;
    })
}

function createDragandDropUI(seperatedSelectedCategories){
    retreivedEntries.style.display = 'block';

    seperatedSelectedCategories.forEach((entry, index) => {
        collectedEntriesContainer.innerHTML += `
        <div class="selected-entry entry-header" draggable="true" data-index=${index}>
            ${entry[0]}
            </strong><p class="show-entry-content hover-bold">Show Content</p><p class="remove-selected-entry hover-bold">x</p>
            <div class="hidden-entry-content">
                ${entry[1]}            
            </div>
        </div>
        `;
    })
    
    dragEvents();
}

function dragEvents() {
    let draggables = document.querySelectorAll('.selected-entry');
    
    draggables.forEach((draggable) => {
        
        // Drag start
        draggable.addEventListener('dragstart', () => {
            dragged = draggable; 
            dragged.classList.add('selected-to-drag');
        })
        draggable.addEventListener('mousedown', () => {
            draggable.classList.add('selected-to-drag');
        })
        draggable.addEventListener('mouseup', () => {
            draggable.classList.remove('selected-to-drag');
        })

        // Drag over
        draggable.addEventListener('dragover', e => {
            e.preventDefault();
        })
        
        // Drag drop
        draggable.addEventListener('drop', () => {
            let tempIndex;

            dragged.classList.remove('selected-to-drag');
            
            tempIndex = dragged.dataset.index;

            dragged.dataset.index = draggable.dataset.index;

            if (dragged.dataset.index - tempIndex < 0) {
                for (let i = 0; i < draggables.length; i++) {
                    if (draggables[i] !== dragged) {
                            draggables[i].dataset.index++
                    }
                }
            }  else {
                dragged.dataset.index++;
            }  

            reorganizeCategories(document.querySelectorAll('.selected-entry'));
        })

        // Drag enter
        draggable.addEventListener('dragenter', () => draggable.classList.toggle('drag-over'))

        // Drag leave
        draggable.addEventListener('dragleave', () => draggable.classList.toggle('drag-over'))
    })

    // Remove entry
    collectedEntriesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-selected-entry')) {
            console.log(e.target.parentElement);
            e.target.parentElement.remove();
            // e.target.parentElement.outerHTML='';
        }
    })
}

function reorganizeCategories(draggables) {
      
    draggables = Array.from(draggables);
    
    draggables.sort((a,b) => a.dataset.index - b.dataset.index)

    draggables.forEach((draggable, index) => {
        draggable.dataset.index = index;
        draggable.classList.remove('drag-over');
        draggable.classList.remove('selected-to-drag');
    })
        
    collectedEntriesContainer.innerHTML = '';

    draggables.forEach((entry) => {
        console.log(entry);
        // only add entries that haven't been deleted
        collectedEntriesContainer.innerHTML += entry.outerHTML;
    })

    dragEvents();
}

function rawSearchDoc(doc, searchTerm) {
    let caseCheck;

    let regMatch = 0,
    exactMatch = 0;

    if(doc.search(searchTerm.toLowerCase()) === -1 && doc.search(searchTerm.toUpperCase()) === -1 && doc.search(searchTerm) === -1){
        window.alert('term not found in document');
    } else {

        // counts the number of exact matches and regular matches
        for(let i = 0; i < doc.length; i++) {
            if (doc.substring(i, searchTerm.length + i) === searchTerm) {
                exactMatch++;              
            } 

            if (doc.substring(i, searchTerm.length + i).toLowerCase() === searchTerm.toLowerCase()) {
                regMatch++;
            }
        }

        displaySearchStats(exactMatch, regMatch, searchTerm);

        let termHighlight = `<span style="color: red; font-weight: bold">${searchTerm}</span>`;
        
        if (caseSensitivity.checked) {
            caseCheck = "g";
        } else {
            caseCheck = "gi";
        }

        let regex = RegExp(searchTerm, caseCheck);
        doc = doc.replace(regex, termHighlight);

        documentContent.innerHTML = doc;
    };
}

function displaySearchStats(exactMatch, regMatch, searchTerm) {
    searchedWord.innerHTML = `'${searchTerm}'`;

    searchStats.innerHTML = `
    <div><strong>Match:</strong>${regMatch}</div>
        <div><strong>Exact Match:</strong>${exactMatch}</div>
    `;
}