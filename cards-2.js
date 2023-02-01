var deck = [], player = [], opponent = [], pKnown = [], oKnown = [];
var playerTurn = false;
const gameTick = 500; //in ms
var gameEnded = false, onePass = false, isPeeking = false, isStealing = false, isDropping = false;

window.onload = function() {
    displayButtons("newgame");
    gameLog("Welcome to the card game!");
}

function displayButtons(stage) {
    switch (stage) {
        case "newgame":
            document.getElementById("actions-draw").style.display = "none";
            document.getElementById("actions-pass").style.display = "none";
            document.getElementById("actions-start").style.display = "block";
            document.getElementById("actions-hint").style.display = "block";
            break;
        case "none":
            document.getElementById("actions-draw").style.display = "none";
            document.getElementById("actions-pass").style.display = "none";
            document.getElementById("actions-start").style.display = "none";
            document.getElementById("actions-hint").style.display = "none";
            break;
        case "game":
            document.getElementById("actions-draw").style.display = "block";
            document.getElementById("actions-pass").style.display = "block";
            document.getElementById("actions-start").style.display = "none";
            document.getElementById("actions-hint").style.display = "none";
            break;
        default:
            break;
    }
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
        document.getElementById("player-hand").appendChild(createCard(player[i], true));
    }
    //display opponent's hand
    document.getElementById("opponent-hand").textContent = "";
    for (var i = 0; i < opponent.length; i++) {
        document.getElementById("opponent-hand").appendChild(createCard((opponent[i]), false));
    }
    //cards left in deck
    if(!gameEnded){
        gameLog("cards in deck: " + deck.length);
    }
}

function createCard(value, isPlayer) {
    var card = document.createElement("div");
    card.className = "card";
    var num = value;
    card.onclick = function () {
        cardClicked(num);
    };
    if (!isPlayer && !gameEnded && pKnown.indexOf(value) == -1) {
        value = 105;
    }
    if (value < 100) {
        card.textContent = value;
    } else {
        switch (value) {
            case 101:
                card.innerHTML = '<img src="data:image/png;base64,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">';
                if (isPeeking) {
                    card.style.backgroundColor = "cyan";
                }
                break;
            case 102:
                card.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEeklEQVR4nO2dW4hVVRjHf9Y0Qo4pqaCgIlIPVqCh9aggmnjJVwvKwgdfNEUoDG8QifcLvYsKokK9mZfsQpgYPkqmo5LgKDSK05MKOelZspglDrnXOnufs/dZ66z1/WDBMHtmnf/3fXvtdT3fBkEQBEGImyHAu8BW4HfgDtAP3Ae6gZ+AL4DXfQuN0fEfANcBlbOcBqb5Fh4D44FzBRw/uDwG9gIdvo1oV6YAPQ06//+tYYRvY9qNccDtEpw/OAjSEnLyAvBjic5/WvbkFZA6H9dxpO4TPgUmAy8Dw4CpwLo6rUb3CdIx5xjxXHQ4cJX5GxtdwFFHEH6oJyB1ZjmctzZnHTpARxz1vFaxDW3NZovT/jR9Q166HI+jzyvU3/actThtRQN1rXeMiAQLNyxO03OCoky11HWlgbqS4YHFaXq0U5QuS133KtAdDQ9KDMBwCYDfR9A0S116UU+w8JvFaSspzgbphIvztcVplwoOQ4eb/YJm5hNJMtMxgfqywETsW0sdNeCNim1oa4YAfziWIlbXWYoYCXznCOKJFtrStnzkcKAu54HlwJvG4a8C7wBfAXcd//fIbGkKnpajt9X7YOEZYyvYkBk6qH4hB28BvSU4/+cGJ3ICMAk406Dja+axI1uRJfQJy4CrBZx/Eni72Q8Wng+E3rDZ4XD8WrNVKVSMLQBCi5AAeEZJC5AAJI2SFiABSBolLUACkDRKWoAEIGmUtAAJQNIoaQESgEp5CdgN9Jmyy/wuFFTsLWB3hnGHCAcVewBsxzvWEAYq9gC4ztbM8y2OhAOgyz8BbPuplAOgywXPRz1U6gHQ5XCA+qIh7/GPNYHpSy4Ajzx1yhIAz52ykhbgt1NWqQbgbiDHv1WqAZgN/Ge51huAvmhwGahHPhIAz3fYoYxrWwLS1/bUM7DDpI/sNWVri8/hJx8A36jUW4BvVOD6ojdQBa4vegNV4PqiN1AFri96A1Xg+qI3UAWur2keWgzs9C2MgW+8Z2n7l4josxg5yrcwYIxjoTAabF+Knu5bGAOZUbK06Zc4RMNxi5FLfQtjIG90lrZjRMROi5H7fAsDDli0bSciFluM/Bt40aOuDkcuuEVExEjHxssCj7oWWTT1m0R9UXHKYuwvHjWdsWj6ngj50DHhec+DnvkOPUuIED3huWUx+Jp5c0Wr0Hmg/7Jo6QlkglgJqx13nR6NtIqsLdBmUtu3DZ0m3bvN+HUt0LDJ8flXU0jGN9fkX8tyQK3iIGx0OL9mjskkwTcORyjgYMl9Qledx05yr6UaajLWuhxyraTR0XxHhzv4VVbRdryuVcg8mQt/BRYWPKbSYSZZeVJUdgeyKuuFiQXSR94G9gOfADOA0eau7TQ/zzDXDjqWF7KcP4HEGZPjcaQqKOdSvvOzHhnbHKMjVWKpmUFAcs/8PMwpmNG2aOlOaajZzAjpM+BmiY7vMTNcuesL0GlePX7CsZTtKv1mVVMvrInjm+QV4H2T5/mYeZT0mdMWD83Pl8217WYIGt16viAIgiAIAlHzBPuRjbJbcYZxAAAAAElFTkSuQmCC">';
                if (isStealing) {
                    card.style.backgroundColor = "cyan";
                }
                break;
            case 103:
                card.innerHTML = '<img src="data:image/png;base64,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">';
                if (isDropping) {
                    card.style.backgroundColor = "cyan";
                }
                break;
            case 104:
                card.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEsUlEQVR4nO2cX4hVRRzHP+vmrroriwS2Gihk9qD4kmgkmO1WDz1FIFk+GAS9BeEftkcDRXErfVjDqAclIiL6YwUiUSnRSyi+5EtJJIZroJBmuvhvrwz8LizLPTPn7jlzZu6c3wfm7d6Z3/n+zsyZ+c1vBhRFURRFURRFURRFUVoxF/gIuAFcAUaB3pa/VLxgxG9MK8fUCdUwC/i/hQPUCRXyX4YD1AkVccDiAHVCBfTKmK9OCEgP8K3DCceBOSGNTJ0edUJ41AkRoE6IAHVCik7olTjHuKPSVuUacA44CmwDlhM/jwHbxeZz8gwNDyV32GK0xEYngZ+AZ4iPZ4ETYmOjorI3j2EzefPzFPOGLSI8i4BvKhR9ajHaBnOAKZeBpwjHk8ClQOKbcjGPkfs8G3ETGKJ6hqTtRsCyJ4+hveKEix4NuQ6spjoelzZDiu9978DEzBcD64F3c3T1cWAp/lmSY1g1tr4nw6N5hu4UgnT90pPuWgw7Cwx4tGFA2shq/67YaGydCdGKP5VNwG2LgSc9GTgb+N7S7i3gpbqsgjc55ttHgK4S2+uSOrPauwdsLFB/R7z503nLYfDOEtt629GWWfnW4s2fzkGL0ZPAqyW08Yqjt31YV/ENDzi67q2Ca4RhqSOr/u/anOF0/LDTivnAGctD/AusmEG9K+W/WfWeBvoK2D2WgvhNzFz7guVh/gIG24zvnLfUd75gHGqWZMQlIX6TVY7Q76mcb2y/vN22HmV6BwUdMJGS+E2ec6wRTATVRreM67ZvivkulMHh1MRv8ppFwBHsvO+YVW2hPPrFCRMSVzqQgvhNdrcQ8BB2dlS4rphKmQvGaOgCPp7Wtc2UNYuNsprNEv/TVIXyyWzgB+A3R4BujWNGciKloaFqFsgUNYtHZVctS3yX85QCPAj8HsH+Qi2ZA/xiEd8MSWtDG5kqXcAnjk2VF0IbmTKjjunmG6ENTJnXHeKb7UTFE88Ddyzify4xGiVAGsmvwDxV3g8PA39bxP8TWKji+2FAFlNZ4l+WxVgWi2Uxp3hII5kA1jmilWan7WcNRcxsrn/YEVre7NgXmJrx/JkG49pjZ8E0klbZFrvatKG2bHGkkZhNFxsjlv+azZ6ySPK2lOES0kiOWv5/W7Y9yyC521JW5kgjyZM02ycb+Fn1XJMEgCIkd1tK2Wkkg5LKklXfBcc+Q61uS+nzlEaywtGjzkhSWK1vS/GdRjLk+Ka49pqTT00cqyA592XHrMp8TGuZnLsjovT0kbo5wZVGcqTiAxqTcmiEOgxHL1ryKhsBjyjdKTjkRd8TzIzjHcebfzbwIb17sqKdn0JP6Ja59tPA/pzHVJdUYNfSNo6pbojhmOo8ib9cdVRapFyXXa+qWN1JB7U/8GzIDXnT6nhVwd48MQ+fRpqh4AnCXtbxT0AHjId0wBfAQ4RnEPg6VgeUPQSZ+faP8mGOjWG5TGoytttS5krIwBbYyipXJYH2S+BN4BHiZxmwFfgK+MPj5COahVlq9MS+IEuZHhU/HCp+QFT8gKj4AVHxAxJV5LOOjKn44UjytpROItnbUjqJZG9L6RSSvi2lk9BLQBRFURRFURRFUehg7gPBd/RG6ZrzBgAAAABJRU5ErkJggg==">';
                break;
            default:
                card.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAD6ElEQVR4nO3cX2iXVRzH8fdsbuJQRE1GNElbtuhCIZtpDBRUCLQgBEnEEkFFsJACoxVaVMu/CF7ojXoX6JVKxehCRSxF80KwhGFgug2KaUUtK2eLQ2c38jvn+S1+zznPn88LDoxdPOd7vufh9zznOX9ARERERERERLKpCZgPbAQ+AA4B54FzwEFgG7AOeAZoiB1sUUwH3gbOAveA4SrLn8CXwGagOXYj8mgh8AVwfxRJd5W/gWPAvNiNyoM5wJkaJN1VTgBPxm5kFjUCu0f5M/N/y12gE6iP3eismAl8EyDxD5bTwDRKbi7wY5UJ+xU4CWwFXrJvO48DT9jrvAy8Y58dv1V5zZtAGyW1oMpEmWfCCmDcKK49HlgFfF3F9c0NMJuSMQ3+OSExl4GOGtS1GLiaUFc/8BglMQW44UnGPeBd4KEa1jkW+CjhtfZbO9grvM8SfueXpFj3MmDQU/9hCu5VT+N/sQ/TtD0P/O6JYzkFNQkY8IxWOwLG8gIw5Ijl+1E+8HPjfc9d93qEeN7zxLOFgplgf98rNfYUUBchpjHAJUdMvXZ0XhgbHA0dAp6OGFc78I8jtlcokAuORn4aOzDgc0ds5v+F0Ox5/34udnDAUs94ZCIFsMbRwB6ywQz4+hwxmnFD7u13NG4v2XHYEeMnFMA5R+NWkB2vOWI0X19z76ajcbPIjnZHjNfIuTo7yq3UuPFkx8OOGM3IPfduV2jYD2RLo6MD/qIA9lVomPkskSX1nm9UuWfurj125sm87n2YwQnxyY4OMDFLADMcHfBdiMoFFjk6wLxCSwBvOjrgQIjKBY46OmCtkpO+Js/ymKcC1F96ax3Jvx5poqhUGmyiK3WAWRojKev0zNS1pF152c33fKcq/Pqg2No8i4L/0N2frlbgliP5pmxPuf5Sa09YDn/RriOVFLyYsC70dplWSIe2ybMUcWTbUsilkaUxBtjpSfzIK2eW5qcLo9Eu/PIl36z9WR070KJuAvkqIfmDRV6KHnuC/UpC8gfsPgFJ4c5PSv41u7tSamysXeruS76Z4Zpa64rlP0cSkm9OV9EgK/AC4GFbzPE2kpIWu8HPlXyze15SdNyTfLMoTFL0rGeLUbcdCUuKuh3JvwM8qsyna5bnp2e9kp++7Y7km3ModGhfAD2ODngjROVl1+pIvtmN+Ujs4MpgpedTgwSw09EBu5T9uK+fq9UBcTugTR0Q7+CnC0p+WG8BP9l5XXMMmt5+RERERERERCQlDcAOe+5/nz1cT9OQAe2o8DGuK2QAZddfoQPM/ySQPseB2xJIV4UO+FjZD6fBJrzXFvO3HsIiIiIiIkIe/Aub1KpIQcICpQAAAABJRU5ErkJggg==">';
                break;
        }
    }
    return card;
}

async function gameStart() {
    gameEnded = false;
    displayButtons("none");
    //make sure the deck is ready
    player = [];
    opponent = [];
    deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 101, 102, 103, 104]; //100+ - abilities
    displayHand();
    gameLog("shuffling the deck...");
    shuffle(deck);
    await sleep(gameTick);
    gameLog("tossing a coin...");
    //determine turn order
    playerTurn = (1 == Math.round(Math.random()));
    await sleep(gameTick);
    if (playerTurn) {
        player.push(deck.pop());
        opponent.push(deck.pop());
        pKnown = [opponent[0]];
        oKnown = [player[0]];
        gameLog("you are drawing first");
        await sleep(gameTick);
        displayHand();
    } else {
        opponent.push(deck.pop());
        player.push(deck.pop());
        pKnown = [opponent[0]];
        oKnown = [player[0]];
        gameLog("opponent is drawing first");
        await sleep(gameTick);
        opponentPlay();
    }
    displayButtons("game");
}

function getHints() {
    gameLog("draw cards from the deck in turns to get the closest score to 21, but not greater than it");
}

function cardSum(array) {
    var result = 0;
    for (var i = 0; i < array.length; i++) {
        if(array[i] < 100) {
            result += array[i];
        }
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
        player.push(deck.pop());
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

function playerPeek() {
    if (isPeeking) {
        isPeeking = false;
    } else if (player.indexOf(101) > -1) {
        isPeeking = true;
    } else if (isStealing && player.indexOf(101) == -1) {
        isStealing = false;
        player.push(101);
        opponent = arrayRemove(opponent, 101);
        player = arrayRemove(player, 102);
    }
}

function playerSteal() {
    if (isStealing) {
        isStealing = false;
    } else if (player.indexOf(102) > -1) {
        isStealing = true;
    } else if (isPeeking && player.indexOf(102) == -1 && pKnown.indexOf(102) == -1) {
        pKnown.push(102);
        isPeeking = false;
        player = arrayRemove(player, 101);
    }
}

function playerDrop() {
    if (isDropping) {
        isDropping = false;
    } else if (player.indexOf(103) > -1) {
        isDropping = true;
    } else if (isPeeking && player.indexOf(103) == -1 && pKnown.indexOf(103) == -1) {
        pKnown.push(103);
        isPeeking = false;
        player = arrayRemove(player, 101);
    } else if (isStealing && player.indexOf(103) == -1) {
        isStealing = false;
        player.push(103);
        opponent = arrayRemove(opponent, 103);
        player = arrayRemove(player, 102);
    }
}

function playerShuffle() {
    if (isPeeking && player.indexOf(104) == -1 && pKnown.indexOf(104) == -1) {
        pKnown.push(104);
        isPeeking = false;
        player = arrayRemove(player, 101);
    } else if (isStealing && player.indexOf(104) == -1) {
        isStealing = false;
        player.push(104);
        opponent = arrayRemove(opponent, 104);
        player = arrayRemove(player, 102);
    } else {
        player = arrayRemove(player, 104);
        deck = shuffle(deck);
    }
}

function cardClicked(value) {
    switch (value) {
        case 101:
            playerPeek();
            break;
        case 102:
            playerSteal();
            break;
        case 103:
            playerDrop();
            break;
        case 104:
            playerShuffle();
            break;
        default:
            if (isPeeking && player.indexOf(value) == -1 && pKnown.indexOf(value) == -1) {
                //peeking opponent's card
                pKnown.push(value);
                //remove card from player
                isPeeking = false;
                player = arrayRemove(player, 101);
            } else if (isStealing && player.indexOf(value) == -1) {
                //stealing opponent's card
                isStealing = false;
                player.push(value);
                opponent = arrayRemove(opponent, value);
                player = arrayRemove(player, 102);
            } else if (isDropping && player.indexOf(value) > -1) {
                isDropping = false;
                deck.push(value);
                if (oKnown.indexOf(value) > -1) {
                    oKnown = arrayRemove(oKnown, value);
                }
                player = arrayRemove(player, value);
                player = arrayRemove(player, 103);
            }
            break;
    }
    displayHand();
}

function arrayRemove(array, item) {
    if (array.indexOf(item) > -1) {
        array.splice(array.indexOf(item), 1);
    }
    return array;
}

function opponentPlay() {
    while(deck.length != 0 && opponentDecision()) {
        onePass = false;
        opponent.push(deck.pop());
    }
    displayHand();
    playerPass();
}

function opponentDecision() {
    var result = false;
    var sum = cardSum(opponent);
    if (sum > 21 && opponent.indexOf(103) > -1) {
        //drop a card
        var res = opponent[0];
        for (var i = 1; i < opponent.length; i++) {
            if (opponent[i] >= sum - 21) {
                res = Math.min(res, opponent[i]);
            }
        }
        if (pKnown.indexOf(res) > -1) {
            pKnown = arrayRemove(pKnown, res);
        }
        opponent = arrayRemove(opponent, res);
        opponent = arrayRemove(opponent, 103);
    } else if (sum < 20) {
        var all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        for (var i = 0; i < opponent.length; i++) {
            all = arrayRemove(all, opponent[i]);
        }
        if (opponent.indexOf(101) > -1 && player.length > 1) {
            //can peek one of player's card
            oKnown.push(player[Math.floor(Math.random() * (player.length - 2) + 1)]);
            opponent = arrayRemove(opponent, 101);
        }
        var fit = 0;
        for (var i = 0; i < oKnown.length; i++) {
            if (opponent.indexOf(102) > -1 && oKnown[i] <= 21 - sum) {
                fit = Math.max(fit, oKnown[i]);
            }
            all = arrayRemove(all, oKnown[i]);
        }
        if (fit > 0) {
            //steal a card
            opponent.push(fit);
            opponent = arrayRemove(opponent, 102);
            oKnown = arrayRemove(oKnown, fit);
            player = arrayRemove(player, fit);
            result = false;
        } else {
            for (var i = 0; i < all.length; i++) {
                if (all[i] <= 21 - sum) {
                    fit++;
                }
            }
            //find the probability of drawn card to fit the goal criteria
            result = (fit / all.length > 0.49) || (opponent.indexOf(103) > -1);
        }
    }
    return result;
}