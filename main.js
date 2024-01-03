let creditCardBalance = 0;
let moneyBalance = 0;

function updateCreditCards() {
    let creditCards = document.getElementById("credit-cards");
    let total = 0.0;
    for(let i = 1; i < creditCards.children.length - 1; i++) {
        let cardValue = creditCards.children[i].children[1].value;
        if(typeof (cardValue-0) === "number") total += (cardValue-0);
    }
    total = Math.round(100*total) / 100;
    let totalText = "$" + total;
    if(total == ~~(total)) totalText += ".00";
    else if(10*total == ~~(10*total)) totalText += "0";
    document.getElementById("credit-card-total").innerText = totalText;
    creditCardBalance = total;
    document.getElementById("current-balance").innerText = moneyBalance - creditCardBalance;
}

let creditCardToggleFlag = true;
function toggleCreditCards() {
    let creditCards = document.getElementById("credit-cards");
    for(let i = 1; i < creditCards.children.length - 1; i++) {
        if(creditCardToggleFlag)
            creditCards.children[i].style.display = "none";
        else
            creditCards.children[i].style.display = "inline-flex";
    }

    if(creditCardToggleFlag) 
        document.getElementById("credit-cards-heading").innerText = "Credit Cards ▼";
    else 
        document.getElementById("credit-cards-heading").innerText = "Credit Cards ▲";
    creditCardToggleFlag = !creditCardToggleFlag;
}

function updateMoney() {
    let money = document.getElementById("money");
    let total = 0.0;
    for(let i = 1; i < money.children.length - 1; i++) {
        let cashValue = money.children[i].children[1].value;
        if(typeof (cashValue-0) === "number") total += (cashValue-0);
    }
    total = Math.round(100*total) / 100;
    let totalText = "$" + total;
    if(total == ~~(total)) totalText += ".00";
    else if(10*total == ~~(10*total)) totalText += "0";
    document.getElementById("money-total").innerText = totalText;
    moneyBalance = total;
    document.getElementById("current-balance").innerText = moneyBalance - creditCardBalance;
}

let moneyToggleFlag = true;
function toggleMoney() {
    let money = document.getElementById("money");
    for(let i = 1; i < money.children.length - 1; i++) {
        if(moneyToggleFlag)
            money.children[i].style.display = "none";
        else
            money.children[i].style.display = "inline-flex";
    }

    if(moneyToggleFlag) 
        document.getElementById("money-heading").innerText = "Money ▼";
    else 
        document.getElementById("money-heading").innerText = "Money ▲";
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
    addEntryRow(name, bank, "updateMoney()", "money");
}

function addCreditCardsRow(name, bank) {
    addEntryRow(name, bank, "updateCreditCards()", "credit-cards");
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
addTotalRow("credit-card-total", "credit-cards");
