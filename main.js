let creditCardBalance = 0;
let moneyBalance = 0;

let creditCardsValues;
let moneyValues;

function numberWrap(n) {
    if(!isNaN(n-0)) return (n-0);
    else return 0;
}

function floatToUSD(f) {
    f = Math.round(100*f) / 100;
    let usd = "$" + f;
    if(f === ~~f) usd += ".00";
    else if (10*f === ~~(10*f)) usd += "0";

    return usd;
}

function updateTotal(id) {
    let section = document.getElementById(id);
    let total = 0.0;
    for(let i = 1; i < section.children.length - 1; i++) {
        let value = section.children[i].children[1].value;
        total += numberWrap(value);
        if(id === "credit-cards") creditCardsValues[i-1] = numberWrap(value);
        else if(id === "money") moneyValues[i-1] = numberWrap(value);
    }
    document.getElementById(id + "-total").innerText = floatToUSD(total);
    if(id === "credit-cards") {
        creditCardBalance = total;

        localStorage.setItem("credit-cards-values", creditCardsValues);
    }
    else if(id === "money") {
        moneyBalance = total;

        localStorage.setItem("money-values", moneyValues);
    }
    document.getElementById("current-balance").innerText = floatToUSD(moneyBalance - creditCardBalance);
}

function toggleSection(flag, id, label) {
    let section = document.getElementById(id);
    for(let i = 1; i < section.children.length - 1; i++) {
        if(flag)
            section.children[i].style.display = "none";
        else
            section.children[i].style.display = "inline-flex";
    }

    let heading = document.getElementById(id + "-heading");
    if(flag) 
        heading.innerText = label + " ▼";
    else 
        heading.innerText = label + " ▲";
}

let creditCardsToggleFlag = true;
function toggleCreditCards() {
    toggleSection(creditCardsToggleFlag, "credit-cards", "Credit Cards");
    
    creditCardsToggleFlag = !creditCardsToggleFlag;
}

let moneyToggleFlag = true;
function toggleMoney() {
    toggleSection(moneyToggleFlag, "money", "Money");

    moneyToggleFlag = !moneyToggleFlag;
}

function addEntryRow(name, bank, onkeyup, parent) {
    let html = "<span>\
                    <div>\
                        <h3>" + name + "</h3>\
                        <p>" + bank + "</p>\
                    </div>\
                    <input type='number' step='0.01' onkeyup='" + onkeyup + "'>\
                </span>";

    document.getElementById(parent).innerHTML += html;
}

function addTotalRow(id, parent) {
    let html = "<span>\
                    <div>\
                        <h3>Total</h3>\
                    </div>\
                    <p id='" + id + "'>$0.00</p>\
                </span>";
    
    document.getElementById(parent).innerHTML += html;
}

function addMoneyRow(name, bank) {
    addEntryRow(name, bank, 'updateTotal("money")', "money");
}

function addCreditCardsRow(name, bank) {
    addEntryRow(name, bank, 'updateTotal("credit-cards")', "credit-cards");
}

addMoneyRow("Checking", "Manhattan Bank");
addMoneyRow("Checking", "Cash App");
addMoneyRow("Cash", "& etc.");
addTotalRow("money-total", "money");

addCreditCardsRow("Blue Cash Preferred", "American Express");
addCreditCardsRow("Hilton Honors", "American Express");
addCreditCardsRow("Bread Cashback", "Bread Financial");
addCreditCardsRow("Walmart Rewards", "Capital One");
addCreditCardsRow("Amazon Prime", "Chase");
addCreditCardsRow("Costco Anywhere", "Citi");
addCreditCardsRow("Custom Cash", "Citi");
addCreditCardsRow("Student Cash Back", "Discover");
addCreditCardsRow("Kroger Rewards", "U.S. Bank");
addCreditCardsRow("Apple Card", "Apple");
addTotalRow("credit-cards-total", "credit-cards");

moneyValues = localStorage.getItem("money-values");
if(moneyValues === null) moneyValues = new Array(3).fill(0);
else moneyValues = moneyValues.split(",");

creditCardsValues = localStorage.getItem("credit-cards-values");
if(creditCardsValues === null) creditCardsValues = new Array(10).fill(0);
else creditCardsValues = creditCardsValues.split(",");

console.log(moneyValues)

let moneySection = document.getElementById("money");
for(let i = 1; i < moneySection.children.length - 1; i++) {
    if(moneyValues[i-1] != 0) moneySection.children[i].children[1].value = moneyValues[i-1];
}

let creditCardsSection = document.getElementById("credit-cards");
for(let i = 1; i < creditCardsSection.children.length - 1; i++) {
    if(creditCardsValues[i-1] != 0) creditCardsSection.children[i].children[1].value = creditCardsValues[i-1];
}

updateTotal("credit-cards");
updateTotal("money");