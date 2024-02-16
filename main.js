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
    console.log(cacheData);
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
    console.log(dialog.children[2].children[1].value);

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
updateTotal() 
{
    let total = 0;
    for(let i = 0; i < cache.length; i++) {
        let sectionTotalSpanID = "section-" + i + "-total-span";

        let sectionTotal = 0;
        for(let key of cache[i].keys()) {
            if(sectionKeywords.has(key)) {
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
refreshPage()
{
    console.log(cache);
    let content = document.getElementById("content");
    let dialogs = document.getElementById("dialogs");
    content.innerHTML = "";
    dialogs.innerHTML = "";

    let sectionHTML = document.getElementById("section-template").innerHTML;
    let entrySpanHTML = document.getElementById("entry-span-template").innerHTML;
    let totalSpanHTML = document.getElementById("total-span-template").innerHTML;
    let addEntryDialogHTML = document.getElementById("add-entry-dialog-template").innerHTML;

    for(let i = 0; i < cache.length; i++) {
        content.innerHTML += sectionHTML;
        let section = content.children[i];
        let sectionID = "section-" + i;
        section.id = sectionID;
        section.children[0].children[0].innerText = cache[i].get("#title");
        section.style = "color:" + cache[i].get("#color") + ";";

        dialogs.innerHTML += addEntryDialogHTML;
        let dialog = dialogs.children[i];
        let dialogID = sectionID + "-add-entry-dialog";
        dialog.id = dialogID;
        

        let j = 0;
        for(let key of cache[i].keys()) {
            if(sectionKeywords.has(key)) {
                continue;
            }
            console.log(cache[i].keys())
            console.log(key);
            let labels = key.split("|");
            let val = cache[i].get(key);
            section.innerHTML += entrySpanHTML;
            let entry = section.children[1 + j];
            entry.children[0].children[0].children[0].innerText = labels[0];
            entry.children[0].children[1].innerText = labels[1];
            if(val !== 0) {
                console.log(entry.children[1].children[0]);
                entry.children[1].children[0].value = val;
            }

            j++;
        }

        section.innerHTML += totalSpanHTML;
        section.children[1+j].id = sectionID + "-total-span"
    }

    for(let i = 0; i < cache.length; i++) {
        let section = content.children[i];
        let sectionID = "section-" + i;
        let dialog = dialogs.children[i];
        let dialogID = sectionID + "-add-entry-dialog"

        dialog.children[2].children[0].addEventListener("click", function() {
            closeDialog(dialogID);
        });
        dialog.children[2].children[1].addEventListener("click", function() {
            addEntry(i, dialogID);
        });

        section.children[0].children[1].addEventListener("click", function() {
            openDialog(dialogID);
        });

        let j = 0;
        for(let key of cache[i].keys()) {
            if(sectionKeywords.has(key)) {
                continue;
            }
            let entry = section.children[1 + j];

            let val = cache[i].get(key);
            if(val !== 0) {
                entry.children[1].children[0].value = val;
            }

            entry.children[1].children[0].addEventListener("keyup", function() {
                cache[i].set(key, forceNumber(entry.children[1].children[0].value));
                updateTotal();
            });

            entry.children[1].children[1].addEventListener("click", function() {
                removeEntry(i, key);
            })

            j++;
        }

    }
}

let sectionKeywords = new Set(["#title", "#operation", "#color"]);

let CACHE_STORAGE_ID = "cache-storage";
let cache = retrieveCache();
refreshPage();
updateTotal();