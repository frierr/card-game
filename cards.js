var deck, player, opponent;
var playerTurn = false;
const gameTick = 1000; //in ms
var gameEnded = false;
var onePass = false;

window.onload = function() {
    document.getElementById("actions-draw").style.display = "none";
    document.getElementById("actions-pass").style.display = "none";
    document.getElementById("actions-start").style.display = "block";
    document.getElementById("actions-hint").style.display = "block";
    gameLog("Welcome to the card game!");
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function gameLog(text) {
    document.getElementById("field").textContent = text;
}

function displayHand() {
    //display player's hand
    document.getElementById("player-hand").textContent = "";
    for (var i = 0; i < player.length; i++) {
        document.getElementById("player-hand").appendChild(createCard(player[i][0]));
    }
    //display opponent's hand
    document.getElementById("opponent-hand").textContent = "";
    for (var i = 0; i < opponent.length; i++) {
        document.getElementById("opponent-hand").appendChild(createCard((gameEnded || i == 0 ? opponent[i][0] : "?")));
    }
    //cards left in deck
    if(!gameEnded){
        gameLog("cards in deck: " + deck.length);
    }
}

function createCard(value) {
    var card = document.createElement("div");
    card.className = "card";
    card.textContent = value;
    return card;
}

async function gameStart() {
    gameEnded = false;
    document.getElementById("actions-start").style.display = "none";
    document.getElementById("actions-hint").style.display = "none";
    //make sure the deck is ready
    player = [];
    opponent = [];
    deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    displayHand();
    gameLog("shuffling the deck...");
    shuffle(deck);
    await sleep(gameTick);
    gameLog("tossing a coin...");
    //determine turn order
    playerTurn = (1 == Math.round(Math.random()));
    await sleep(gameTick);
    if (playerTurn) {
        player.push(getTopCard());
        opponent.push(getTopCard());
        gameLog("you are drawing first");
        await sleep(gameTick);
        displayHand();
    } else {
        opponent.push(getTopCard());
        player.push(getTopCard());
        gameLog("opponent is drawing first");
        await sleep(gameTick);
        opponentPlay();
    }
    document.getElementById("actions-draw").style.display = "block";
    document.getElementById("actions-pass").style.display = "block";
}

function getHints() {
    gameLog("draw cards from the deck in turns to get the closest score to 21, but not greater than it");
}

function getTopCard() {
    return deck.splice(Math.floor(Math.random() * (deck.length - 1)), 1);
}

function cardSum(array) {
    var result = 0;
    for (var i = 0; i < array.length; i++) {
        result += array[i][0];
    }
    return result;
}

function checkWinCondition() {
    gameEnded = true;
    //check player's sum
    if(cardSum(player) > 21) {
        //player lost
        if (cardSum(opponent) > 21) {
            //both have lost
            gameLog("both of you have lost");
        } else {
            //opponent won
            gameLog("you lost");
        }
    } else {
        //check opponent's deck
        if (cardSum(opponent) > 21) {
            //both have lost
            gameLog("you won");
        } else {
            //count cards
            if(cardSum(player) == cardSum(opponent)){
                gameLog("both of you have lost");
            } else {
                if(cardSum(player) > cardSum(opponent)){
                    gameLog("you won");
                } else {
                    gameLog("you lost");
                }
            }
        }
    }
    document.getElementById("actions-draw").style.display = "none";
    document.getElementById("actions-pass").style.display = "none";
    document.getElementById("actions-start").style.display = "block";
    document.getElementById("actions-hint").style.display = "block";
    displayHand();
}

function playerDraw() {
    onePass = false;
    if(deck.length > 0) {
        player.push(getTopCard());
    }
    displayHand();
}

function playerPass() {
    if(onePass || deck.length == 0) {
        checkWinCondition();
    } else {
        onePass = true;
        if(playerTurn) {
            playerTurn = false;
            opponentPlay();
        } else {
            playerTurn = true;
        }
    }
}

function opponentPlay() {
    while(deck.length != 0 && cardSum(opponent) < 17) {
        onePass = false;
        opponent.push(getTopCard());
    }
    displayHand();
    playerPass();
}