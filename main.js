let MONEY_SECTION_ID = "money";
let CREDIT_CARDS_SECTION_ID = "credit-cards";

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
    if(cents.length === 1) {
        cents = "00" + cents;
    } else if(cents.length === 2) {
        cents = "0" + cents;
    }
    // cents is now number of cents as string
    let usd = "$" + cents.substring(0, cents.length - 2) + "." +
              cents.substring(cents.length - 2);

    return usd;
}

function
USDToNumber(val) 
{
    // always will be a number
    return val.substring(1) - 0;
}

function 
updateTotal(id) 
{
    let section = document.getElementById(id);
    let entries = section.children;
    let indexOfTotalRow = section.children.length - 1;

    let valueList = [];
    let storageID = id;

    let total = 0.0;
    for(let i = 1; i < indexOfTotalRow; i++) {
        // index 0 is the heading, skip it
        //stop before the total row

        let val = entries[i].children[1].value;
        // children[1] is the input field
        
        total += forceNumber(val);

        valueList.push(forceNumber(val));
    }

    document.getElementById(id + "-total").innerText = numberToUSD(total);
    updateCurrentBalance();

    localStorage.setItem(storageID, valueList);
    
    return total;
}

function
updateCurrentBalance() 
{
    let moneyTotal = USDToNumber(document.getElementById("money-total").innerText);
    let creditCardTotal = USDToNumber(document.getElementById("credit-cards-total").innerText);

    document.getElementById("current-balance").innerText = numberToUSD(moneyTotal - creditCardTotal);
}

function 
toggleSection(id) 
{
    let section = document.getElementById(id);
    let entries = section.children;
    let indexOfTotalRow = section.children.length - 1;

    let flag = entries[1].style.display !== "none";

    for(let i = 1; i < indexOfTotalRow; i++) {
        section.children[i].style.display = flag ? "none" : "inline-flex";
    }

    let heading = document.getElementById(id + "-heading");
    let label = heading.innerText.substring(0, heading.innerText.length - 1);

    heading.innerText = flag ? label + "▼" : label + "▲";
}

function drawEntryRow(name, bank, parentID) {
    let html = "<span class='entry'>\
                    <div>\
                        <h3>" + name + "</h3>\
                        <p>" + bank + "</p>\
                    </div>\
                    <input type='number' step='0.01' onkeyup='updateTotal(\"" + parentID + "\")'>\
                </span>";

    document.getElementById(parentID).innerHTML += html;
}

function drawTotalRow(parentID) {
    let html = "<span class='entry'>\
                    <div>\
                        <h3>Total</h3>\
                    </div>\
                    <p id='" + parentID + "-total'>$0.00</p>\
                </span>";
    
    document.getElementById(parentID).innerHTML += html;
}

function drawMoneyRow(name, bank) {
    drawEntryRow(name, bank, MONEY_SECTION_ID);
}

function drawCreditCardsRow(name, bank) {
    drawEntryRow(name, bank, CREDIT_CARDS_SECTION_ID);
}

// load from storage

function
loadSectionDataFromStorage(id)
{
    let storageID = id;

    let item = localStorage.getItem(storageID);
    if(item === null) return;

    let array = item.split(",");

    let section = document.getElementById(id);
    let entries = section.children;
    let indexOfTotalRow = section.children.length - 1;

    for(let i = 1; i < indexOfTotalRow; i++) {
        let val = array[i-1];
        if(forceNumber(val) !== 0) entries[i].children[1].value = val;
    }
}

function 
loadEntriesFromStorage(id) 
{
    let storageID = id + "-entries";

    let item = localStorage.getItem(storageID);
    if(item === null) return [];

    let array = item.split(",");

    let entries = [];
    for(let i = 0; i < array.length; i += 2) {
        entries.push([array[i], array[i+1]]);
    }

    return entries;
}

function 
addEntry(name, bank, entries, id) 
{
    let storageID = id + "-entries";

    entries.push([name, bank]);
    localStorage.setItem(storageID, entries);
    localStorage.setItem(id, localStorage.getItem(id) + ",0");
    //must add to data
    refresh();
}

let moneyEntries;
let creditCardsEntries;

let moneyEntryDialog = document.getElementById("add-money-entry");
function 
openMoneyEntryDialog() 
{
    moneyEntryDialog.showModal();
}

function
closeMoneyEntryDialog()
{
    moneyEntryDialog.close();
}

function 
addMoneyEntry() 
{
    let name = moneyEntryDialog.children[0].children[1].value;
    let bank = moneyEntryDialog.children[1].children[1].value;
    moneyEntryDialog.close();
    addEntry(name, bank, moneyEntries, MONEY_SECTION_ID);
}

let creditCardsEntryDialog = document.getElementById("add-credit-cards-entry");
function
openCreditCardsEntryDialog() 
{
    creditCardsEntryDialog.showModal();
}

function
closeCreditCardsEntryDialog()
{
    creditCardsEntryDialog.close();
}

function
addCreditCardsEntry() 
{
    let name = creditCardsEntryDialog.children[0].children[1].value;
    let bank = creditCardsEntryDialog.children[1].children[1].value;
    creditCardsEntryDialog.close();
    addEntry(name, bank, creditCardsEntries, CREDIT_CARDS_SECTION_ID);
}

function 
refresh() 
{
    document.getElementById(MONEY_SECTION_ID).innerHTML = baseMoneyHTML;
    document.getElementById(CREDIT_CARDS_SECTION_ID).innerHTML = baseCreditCardsHTML;

    moneyEntries = loadEntriesFromStorage("money");
    creditCardsEntries = loadEntriesFromStorage("credit-cards");

    for(let i = 0; i < moneyEntries.length; i++) {
        drawMoneyRow(moneyEntries[i][0], moneyEntries[i][1]);
    }
    drawTotalRow(MONEY_SECTION_ID);
    for(let i = 0; i < creditCardsEntries.length; i++) {
        drawCreditCardsRow(creditCardsEntries[i][0], creditCardsEntries[i][1]);
    }
    drawTotalRow(CREDIT_CARDS_SECTION_ID);

    loadSectionDataFromStorage(MONEY_SECTION_ID);
    loadSectionDataFromStorage(CREDIT_CARDS_SECTION_ID);
    
    updateTotal(MONEY_SECTION_ID);
    updateTotal(CREDIT_CARDS_SECTION_ID);
}

let baseMoneyHTML = document.getElementById(MONEY_SECTION_ID).innerHTML;
let baseCreditCardsHTML = document.getElementById(CREDIT_CARDS_SECTION_ID).innerHTML;
refresh();