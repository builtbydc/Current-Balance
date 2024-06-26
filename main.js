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

function openSettings() {
    let dialog = document.getElementById("settings-dialog");
    for(let i = 0; i < settings.length - 3; i++) {
        descendant(dialog, i, 1).value = settings[i];
    }
    for(let i = settings.length - 3; i < settings.length; i++) {
        descendant(dialog, i, 1).checked = settings[i];
    }
    dialog.showModal();
}

function
retrieveSettings() 
{
    let settingsData = localStorage.getItem(SETTINGS_STORAGE_ID);
    if(settingsData === null) return ["Budget", "Current Balance", "#ffffff", "#ffffff", "#000000", false, true, true];

    let settingsArray = settingsData.split(",");
    for(let i = settingsArray.length - 3; i < settingsArray.length; i++) {
        settingsArray[i] = settingsArray[i] === "true";
    }

    return settingsArray;
}

function
saveSettings()
{
    let dialog = document.getElementById("settings-dialog");
    for(let i = 0; i < settings.length - 3; i++) {
        settings[i] = descendant(dialog, i, 1).value;
    }
    for(let i = settings.length - 3; i < settings.length; i++) {
        settings[i] = descendant(dialog, i, 1).checked;
    }
    localStorage.setItem(SETTINGS_STORAGE_ID, settings);
    dialog.close();
    refreshPage();
}

// OPENING DIALOGS & ADDING TO PAGE
///////////////////////////////////

function 
openDialog(id) 
{
    closeAllMenus();
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
moveUp(token, i, targetKey) {
    if(token === "entry") {

        let newSectionData = new Map();
        let j = 0; // key number
        let previousKey = "";
        for(let key of cache[i].keys()) {

            if(KEYWORDS.has(key)) {

                newSectionData.set(key, cache[i].get(key));
                continue;
                // not an entry
            }

            if(key === targetKey) {
                if(j === 0) {
                    refreshPage();
                    return;
                }
                let previousKeyValue = cache[i].get(previousKey);
                newSectionData.delete(previousKey);
                newSectionData.set(key, cache[i].get(key));
                newSectionData.set(previousKey, previousKeyValue);

            } else {
                newSectionData.set(key, cache[i].get(key));
            }

            previousKey = key;
            j++;
        }
        cache[i] = newSectionData;
    } else if(token === "section") {
        if(i === 0) {
            refreshPage();
            return;
        }

        let tempSectionData = cache[i-1];
        cache[i-1] = cache[i];
        cache[i] = tempSectionData;
    }

    saveCache();
    refreshPage();
}

function
moveDown(token, i, targetKey) {
    if(token === "entry") {
        let foundFlag = false;
        for(let key of cache[i].keys()) {
            if(KEYWORDS.has(key)) {
                continue;
            }

            if(foundFlag) {
                moveUp("entry", i, key);
                foundFlag = false;
                break;
            }

            if(key === targetKey) {
                foundFlag = true;
            }
        }
        if(foundFlag) {
            refreshPage();
        }
    } else if(token === "section") {
        if(i === cache.length - 1) {
            refreshPage();
            return;
        }
        moveUp("section", i+1);
    }
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

function openConfirmationDialog(token, i, key) {
    closeAllMenus();
    let dialog = document.getElementById("confirmation-dialog");
    let question = descendant(dialog, 0, 0);
    let deleteButton = descendant(dialog, 1, 1);
    
    if(token === "entry") {
        question.innerText = "Are you sure you want to delete the following item: " + key.split("|")[0] + (key.split("|")[1].length > 0 ? " (" + key.split("|")[1] + ")" : "") +"?";
        deleteButton.addEventListener("click", function() {
            dialog.close();
            removeEntry(i, key);
        });

    } else if(token === "section") {
        question.innerText = "Are you sure you want to delete the following section: " + cache[i].get("#title") + "?";
        deleteButton.addEventListener("click", function() {
            dialog.close();
            deleteSection(i);
        });
    }

    dialog.showModal();
    
}

function
closeConfirmationDialog() {
    let dialog = document.getElementById("confirmation-dialog");
    let deleteButton = descendant(dialog, 1, 1);
    deleteButton.replaceWith(deleteButton.cloneNode(true));
    dialog.close();
}

function
refreshPage()
{
    // refresh confirmation delete button
    let confirmationDialog = document.getElementById("confirmation-dialog");
    let confirmationDeleteButton = descendant(confirmationDialog, 1, 1);
    confirmationDeleteButton.replaceWith(confirmationDeleteButton.cloneNode(true));

    // apply page settings
    let titleSection = document.getElementById("title-section");
    descendant(titleSection, 0, 0).innerText = settings[0];
    let bottomSection = document.getElementById("current-balance-section");
    descendant(bottomSection, 0, 0).innerText = settings[1];
    document.querySelector("body").style.background = settings[2];
    titleSection.style.background = settings[3];
    bottomSection.style.background = settings[3];
    titleSection.style.color = settings[4];
    bottomSection.style.color = settings[4];

    if(settings[5]) {
        titleSection.style["border-bottom"] = "2px solid " + settings[4];
        bottomSection.style["border-top"]  = "2px solid " + settings[4];
    } else {
        titleSection.style["border-bottom"] = "none";
        bottomSection.style["border-top"]  = "none";
    }

    if(settings[6]) {
        titleSection.style["box-shadow"] = "0 0 1rem rgba(0, 0, 0, 0.4)";
        bottomSection.style["box-shadow"] = "0 0 1rem rgba(0, 0, 0, 0.4)";
    } else {
        titleSection.style["box-shadow"] = "none";
        bottomSection.style["box-shadow"] = "none";
    }

    if(settings[7]) {
        titleSection.style.borderRadius = "0rem 0rem 1rem 1rem";
        bottomSection.style.borderRadius = "1rem 1rem 0rem 0rem";
    } else {
        titleSection.style.borderRadius = "0";
        bottomSection.style.borderRadius = "0";
    }

    let addSectionButton = document.getElementById("add-section-button");
    addSectionButton.style.border = "2px solid " + settings[4];
    addSectionButton.style.background = settings[3];
    addSectionButton.style.color = settings[4];

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
        section.style.color = cache[i].get("#color");
        section.style["border-bottom"] = "2px solid " + cache[i].get("#color");

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

            // give color to text box
            let balanceTextBox = descendant(entrySpan, 1, 0);
            balanceTextBox.style.border = "2px solid " + cache[i].get("#color");
            balanceTextBox.style.color = cache[i].get("#color");


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
            // deleteSection(i);
            openConfirmationDialog("section", i);
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

        let sectionMenuMoveUpButton = descendant(sectionMenu, 3);
        sectionMenuMoveUpButton.addEventListener("click", function() {
            moveUp("section", i);
        });

        let sectionMenuMoveDownButton = descendant(sectionMenu, 4);
        sectionMenuMoveDownButton.addEventListener("click", function() {
            moveDown("section", i);     
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
                // removeEntry(i, key);
                openConfirmationDialog("entry", i, key);
            });

            let menuMoveUpButton = descendant(entrySpan, 1, 2, 2);
            menuMoveUpButton.addEventListener("click", function() {
                moveUp("entry", i, key);
            });

            let menuMoveDownButton = descendant(entrySpan, 1, 2, 3);
            menuMoveDownButton.addEventListener("click", function() {
                moveDown("entry", i, key);
            })

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

let SETTINGS_STORAGE_ID = "settings-storage";
let settings = retrieveSettings();
if(settings.length !== 8) {
    localStorage.removeItem(SETTINGS_STORAGE_ID);
    settings = retrieveSettings();
}

let KEYWORDS = new Set(["#title", "#operation", "#color"]);
let CACHE_STORAGE_ID = "cache-storage";
let cache = retrieveCache();
refreshPage();

