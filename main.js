// UTILITY FUNCTIONS
////////////////////

function 
forceNumber(val) 
{
    let n = val - 0;
    // (val - 0) is either a number or NaN

    return isNaN(n) ? 0 : n;
}

function 
numberToUSD(val) 
{
    let cents = Math.round(100*val) + ""; 
    cents = "0".repeat(Math.max(0, 3 - cents.length)) + cents;

    // cents is now number of cents as string
    let usd = "$" + cents.substring(0, cents.length - 2) + "." +
              cents.substring(cents.length - 2);

    return usd;
}

function
USDToNumber(val) 
{
    return forceNumber(val.substring(1));
}

// CACHE MANIPULATION
/////////////////////

function
saveCache() 
{
    let cacheData = [];
    cacheData.push(cache.length);
    for(let map of cache) {
        cacheData.push(map.size);
    }

    for(let map of cache) {
        for(let key of map.keys()) {
            cacheData.push(key, map.get(key));
        }
    }

    localStorage.setItem(CACHE_STORAGE_ID, cacheData);
}

function
retrieveCache() {
    let rawCacheData = localStorage.getItem(CACHE_STORAGE_ID);
    if(rawCacheData === null) return [];

    let cacheData = rawCacheData.split(",");
    let tempCache = [];

    let numberOfSections = forceNumber(cacheData[0]);
    let numberOfEntries = [];
    for(let i = 1; i < 1 + numberOfSections; i++) {
        tempCache.push(new Map());
        numberOfEntries.push(forceNumber(cacheData[i]));
    }

    let i = 1 + numberOfSections;
    for(let n = 0; n < numberOfEntries.length; n++) {
        tempCache[n].set(cacheData[i++], cacheData[i++]);
        tempCache[n].set(cacheData[i++], cacheData[i++] === "true");
        tempCache[n].set(cacheData[i++], cacheData[i++]);
        for(let j = 0; j < numberOfEntries[n] - 3; j++) {
            tempCache[n].set(cacheData[i++], forceNumber(cacheData[i++]));
        }
    }

    return tempCache;
}

// OPENING DIALOGS & ADDING TO PAGE
///////////////////////////////////

function 
openDialog(id) 
{
    document.getElementById(id).showModal();
}

function
closeDialog(id) 
{
    document.getElementById(id).close();
}

function
addSection() 
{
    let dialog = document.getElementById("add-section-dialog");
    let sectionMap = new Map();
    sectionMap.set("#title", dialog.children[0].children[1].value);
    sectionMap.set("#operation", dialog.children[1].children[1].children[0].checked);
    sectionMap.set("#color", dialog.children[2].children[1].value);

    cache.push(sectionMap);
    dialog.close();
    saveCache();
    refreshPage();
}

function
addEntry(i, dialogID) 
{
    let dialog = document.getElementById(dialogID);
    let key = dialog.children[0].children[1].value + "|" + dialog.children[1].children[1].value;
    cache[i].set(key, 0);
    closeDialog(dialogID);
    saveCache();
    refreshPage();
}

function
editEntry(index, dialogID, oldKey) {
    let dialog = document.getElementById(dialogID);
    let newKey = dialog.children[0].children[1].value + "|" + dialog.children[1].children[1].value;
    let newCache = [];
    for(let i = 0; i < cache.length; i++) {
        newCache.push(new Map());
        for(let key of cache[i].keys()) {
            if(i === index && key === oldKey) {
                newCache[i].set(newKey, cache[i].get(oldKey));
            } else {
                newCache[i].set(key, cache[i].get(key));
            }
        }
    }
    cache = newCache;

    closeDialog(dialogID);
    saveCache();
    refreshPage();
}

function 
updateTotal() 
{
    let total = 0;
    for(let i = 0; i < cache.length; i++) {
        let sectionTotalSpanID = "section-" + i + "-total-span";

        let sectionTotal = 0;
        for(let key of cache[i].keys()) {
            if(KEYWORDS.has(key)) {
                continue;
            }

            sectionTotal += cache[i].get(key);
        }

        document.getElementById(sectionTotalSpanID).children[1].innerText = numberToUSD(sectionTotal);
        if(cache[i].get("#operation")) {
            total += sectionTotal;
        } else {
            total -= sectionTotal;
        }

    }
    document.getElementById("current-balance").innerText = numberToUSD(total);
    saveCache();
}

function
removeEntry(i, key)
{
    cache[i].delete(key);
    saveCache();
    refreshPage();
}

function
toggleEntryMenu(menuID) {
    let content = document.getElementById("content");
    for(let i = 0; i < cache.length; i++) {
        let section = content.children[i];
        let sectionID = "section-" + i;

        let j = 0;
        for(let key of cache[i].keys()) {
            if(KEYWORDS.has(key)) {
                continue;
            }

            let entry = section.children[1 + j];
            let menuIDj = sectionID + "-menu-" + j;

            if(menuID === menuIDj) {
                j++;
                continue;
            }

            entry.children[1].children[1].innerText = "⋮";
            entry.children[1].children[0].style.display = "unset";
            document.getElementById(menuIDj).style.display = "none";

            j++;
        }

    }
    let menu = document.getElementById(menuID);
    if(menu.style.display === "none") {
        document.getElementById(menuID).style.display = "unset";
    } else {
        menu.style.display = "none";
    }
}

function
descendant(element, ...path) 
{
    let out = element;

    for(let turn of path) {
        out = out.children[turn];
    }

    return out;
}

function
appendElement(container, templateHTML)
{
    container.innerHTML += templateHTML;
    let element = container.lastElementChild;
    
    return element;
}

function
appendElementWithID(container, templateHTML, id) 
{
    container.innerHTML += templateHTML;
    let element = container.lastElementChild;
    element.id = id;

    return element;
}

function
editSection(i, dialogID) 
{
    let dialog = document.getElementById(dialogID);
    let title = descendant(dialog, 0, 1).value;
    let operation = descendant(dialog, 1, 1, 0).checked;
    let color = descendant(dialog, 2, 1).value;

    cache[i].set("#title", title);
    cache[i].set("#operation", operation);
    cache[i].set("#color", color);

    dialog.close();
    saveCache();
    refreshPage();
}

function
deleteSection(i) 
{
    let newCache = [];
    for(let j = 0; j < cache.length; j++) {
        if(i === j) {
            continue;
        }
        newCache.push(cache[j]);
    }
    cache = newCache;
    saveCache();
    refreshPage();
}

function
closeAllMenus() {
    let content = document.getElementById("content");
    for(let i = 0; i < cache.length; i++) {
        let section = descendant(content, i);
        let sectionMenu = descendant(section, 0, 2);
        let sectionMenuButton = descendant(section, 0, 1);
        sectionMenu.style.transform = "scale(0)";
        sectionMenuButton.innerText = "☰";

        let j = 0;
        for(let key of cache[i].keys()) {
            if(KEYWORDS.has(key)) {
                continue;
            }

            let entrySpan = descendant(section, 1 + j);
            let menu = descendant(entrySpan, 1, 2);
            let menuButton = descendant(entrySpan, 1, 1);
            menu.style.transform = "scale(0)";
            menuButton.innerText = "⋮";

            j++;
        }
    }
}

function openMenu(menuID) {
    let menu = document.getElementById(menuID);
    menu.style.transform = "scale(1)";
    menu.previousElementSibling.innerText = "×";
}

function
refreshPage()
{
    // identify containers
    let contentContainer = document.getElementById("content");
    let editSectionDialogContainer = document.getElementById("edit-section-dialogs");
    let addEntryDialogContainer = document.getElementById("dialogs");
    let editEntryDialogContainer = document.getElementById("edit-dialogs");
    
    // reset page
    contentContainer.innerHTML = "";
    editSectionDialogContainer.innerHTML = "";
    addEntryDialogContainer.innerHTML = "";
    editEntryDialogContainer.innerHTML = "";

    // grab default HTML
    let sectionHTML = document.getElementById("section-template").innerHTML;
    let entrySpanHTML = document.getElementById("entry-span-template").innerHTML;
    let totalSpanHTML = document.getElementById("total-span-template").innerHTML;
    let editSectionDialogHTML = document.getElementById("edit-section-dialog-template").innerHTML;
    let addEntryDialogHTML = document.getElementById("add-entry-dialog-template").innerHTML;
    let editEntryDialogHTML = document.getElementById("edit-entry-dialog-template").innerHTML;

    // LOOP NUMBER ONE: BUILD HTML
    // outer loop: loop over sections
    for(let i = 0; i < cache.length; i++) {

        let sectionID = "section-" + i;
        let section = appendElementWithID(contentContainer, sectionHTML, sectionID);

        // apply section attributes
        let sectionTitle = descendant(section, 0, 0);
        sectionTitle.innerText = cache[i].get("#title");
        section.style = "color:" + cache[i].get("#color") + ";";

        let sectionMenuID = sectionID + "-menu";
        let sectionMenu = descendant(section, 0, 2);
        sectionMenu.id = sectionMenuID;

        appendElementWithID(addEntryDialogContainer, addEntryDialogHTML, 
                            sectionID + "-add-entry-dialog");
        
        let editSectionDialog = appendElementWithID(editSectionDialogContainer, editSectionDialogHTML,
                            sectionID + "-edit-section-dialog");
        let editSectionRadio = descendant(editSectionDialog, 1, 1);
        let editSectionRadioPositiveID = sectionID + "-edit-dialog-radio-positive";
        let editSectionRadioNegativeID = sectionID + "-edit-dialog-radio-negative";

        descendant(editSectionRadio, 0).id = editSectionRadioPositiveID;
        descendant(editSectionRadio, 1).for = editSectionRadioPositiveID;
        descendant(editSectionRadio, 2).id = editSectionRadioNegativeID;
        descendant(editSectionRadio, 3).for = editSectionRadioNegativeID;
        
        // inner loop: loop over entries
        let j = 0; // key number
        for(let key of cache[i].keys()) {

            if(KEYWORDS.has(key)) {
                continue;
                // not an entry
            }

            // split key into name and detail
            let labels = key.split("|");

            // add entry and labels
            let entrySpan = appendElement(section, entrySpanHTML);
            let name = descendant(entrySpan, 0, 0, 0);
            let detail = descendant(entrySpan, 0, 1);
            name.innerText = labels[0];
            detail.innerText = labels[1];

            // give id to menu
            let menu = descendant(entrySpan, 1, 2);
            let menuID = sectionID + "-menu-" + j;
            menu.id = menuID;

            appendElementWithID(editEntryDialogContainer, editEntryDialogHTML, 
                             sectionID + "-edit-" + j);

            j++;
        }

        appendElementWithID(section, totalSpanHTML, sectionID + "-total-span");
    }

    // LOOP NUMBER TWO: ADD EVENT LISTENERS AND DETAILS
    // outer loop: loop over sections
    for(let i = 0; i < cache.length; i++) {
        // get section details
        let section = descendant(contentContainer, i);
        let sectionID = section.id;

        // get add entry details
        let addEntryDialog = descendant(addEntryDialogContainer, i);
        let addEntryDialogID = addEntryDialog.id;

        // menu button in each section
        let sectionMenu = descendant(section, 0, 2);
        let sectionMenuID = sectionMenu.id;
        let sectionMenuButton = descendant(section, 0, 1);
        sectionMenuButton.addEventListener("click", function() {
            let readyToOpen = sectionMenuButton.innerText === "☰";
            closeAllMenus();
            if(readyToOpen) {
                openMenu(sectionMenuID);
            }
        });

        let sectionMenuAddButton = descendant(sectionMenu, 0);
        sectionMenuAddButton.addEventListener("click", function() {
            openDialog(addEntryDialogID);
        });

        let editSectionDialog = descendant(editSectionDialogContainer, i);
        let editSectionDialogID = editSectionDialog.id;

        let sectionMenuEditButton = descendant(sectionMenu, 1);
        sectionMenuEditButton.addEventListener("click", function() {
            openDialog(editSectionDialogID);
            descendant(editSectionDialog, 0, 1).value = cache[i].get("#title");
            if(cache[i].get("#operation")) {
                descendant(editSectionDialog, 1, 1, 0).checked = true;
            } else {
                descendant(editSectionDialog, 1, 1, 2).checked = true;
            }
            descendant(editSectionDialog, 2, 1).value = cache[i].get("#color");
        });

        let editSectionDialogCancelButton = descendant(editSectionDialog, 3, 0);
        let editSectionDialogSaveButton = descendant(editSectionDialog, 3, 1);

        editSectionDialogCancelButton.addEventListener("click", function() {
            closeDialog(editSectionDialogID);
        });

        editSectionDialogSaveButton.addEventListener("click", function() {
            editSection(i, editSectionDialogID);
        });

        let sectionMenuDeleteButton = descendant(sectionMenu, 2);
        sectionMenuDeleteButton.addEventListener("click", function() {
            deleteSection(i);
        });

        // cancel button in dialog
        let addEntryDialogCancelButton = descendant(addEntryDialog, 2, 0);
        addEntryDialogCancelButton.addEventListener("click", function() {
            closeDialog(addEntryDialogID);
        });

        // add entry button in dialog
        let addEntryDialogAddButton = descendant(addEntryDialog, 2, 1);
        addEntryDialogAddButton.addEventListener("click", function() {
            addEntry(i, addEntryDialogID);
        });

        // inner loop: loop over entries
        let j = 0; // key number
        for(let key of cache[i].keys()) {
            if(KEYWORDS.has(key)) {
                continue;
                // not an entry
            }

            let entrySpan = descendant(section, 1 + j); // skips the title row

            // fill text boxes with saved values
            let balance = cache[i].get(key);
            let balanceTextBox = descendant(entrySpan, 1, 0);
            if(balance !== 0) {
                balanceTextBox.value = balance;
            }

            // any time a number is entered or changed
            balanceTextBox.addEventListener("keyup", function() {
                cache[i].set(key, forceNumber(balanceTextBox.value));
                updateTotal();
            });

            let menu = descendant(entrySpan, 1, 2);
            let menuID = menu.id;

            let menuButton = descendant(entrySpan, 1, 1);
            menuButton.addEventListener("click", function() {
                let readyToOpen = menuButton.innerText === "⋮";
                closeAllMenus();
                if(readyToOpen) {
                    openMenu(menuID);
                }
            });

            // inescapable hack
            let editEntryDialogID = sectionID + "-edit-" + j;
            let editEntryDialog = document.getElementById(editEntryDialogID);

            let labels = key.split("|");

            let menuEditButton = descendant(entrySpan, 1, 2, 0);
            menuEditButton.addEventListener("click", function() {
                openDialog(editEntryDialogID);

                // fill with current values
                descendant(editEntryDialog, 0, 1).value = labels[0];
                descendant(editEntryDialog, 1, 1).value = labels[1];
            });

            let menuDeleteButton = descendant(entrySpan, 1, 2, 1);
            menuDeleteButton.addEventListener("click", function() {
                removeEntry(i, key);
            });

            let editEntryDialogCancelButton = descendant(editEntryDialog, 2, 0);
            editEntryDialogCancelButton.addEventListener("click", function() {
                closeDialog(editEntryDialogID);
            });

            let editEntryDialogSaveButton = descendant(editEntryDialog, 2, 1);
            editEntryDialogSaveButton.addEventListener("click", function() {
                editEntry(i, editEntryDialogID, key);
            });

            j++;
        }

    }

    updateTotal();
}

let KEYWORDS = new Set(["#title", "#operation", "#color"]);

let CACHE_STORAGE_ID = "cache-storage";
let cache = retrieveCache();
refreshPage();
