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