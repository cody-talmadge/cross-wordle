//Import the list of all words from the words.js file.  The first 500 words are
//the curaetd 'common' words that can be solutions.  The rest are valid for guesses,
//but will not be the solution
import { WORDS } from "./words.js";

//Set the number of guesses
const NUMBER_OF_GUESSES = 7;

//Set RANDOM to true for random words, false for daily words
const RANDOM = false;

//Set the list of 'common' words that can be solutions
const GAME_WORDS = WORDS.slice(0,499);

//Set the list of all valid words that someone can use to guess
const VALID_WORDS = WORDS;

//Return a random word from the game words list
let random_word = function() {
    return GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
}

//Set the animation delay length (per letter in ms)
const DELAY_LENGTH = 250;

//Start place in word list
const START_GAME_WORDS_INDEX = 0;

//Prime numbers to pseudo-randomize the selection
const GAME_WORDS_DAILY_INCREMENT = 103;
const SECOND_WORD_INCREMENT = 223;

//Set the horizontal word
const dayInMs = 1000 * 60 * 60 * 24;
const START_DATE_MS = new Date('11/24/2022').getTime();
const START_DATE = START_DATE_MS / dayInMs;
const CURR_DATE_MS = new Date().getTime();
const CURR_DATE = CURR_DATE_MS / dayInMs;
const HORIZONTAL_WORD_INDEX = Math.floor(CURR_DATE - START_DATE) * GAME_WORDS_DAILY_INCREMENT + START_GAME_WORDS_INDEX;
let horizontalWord;
if (RANDOM) {
    horizontalWord = random_word();
} else {
    horizontalWord = GAME_WORDS[HORIZONTAL_WORD_INDEX % 500];
}

//Create the vertical word infrastructure
let verticalWordIndex = 0;
const VERTICAL_WORD_GENERATOR = function() {
    verticalWordIndex++;
    return GAME_WORDS[(HORIZONTAL_WORD_INDEX + verticalWordIndex * SECOND_WORD_INCREMENT) % 500];
}

//Set the vertical word by trying random words until they have an overlapping letter
//Store the coordinate of the overlapping letter so we can set up the board correctly
//overlapCoordinates[0] = x coordinate of overlapping letter
//overlapCoordinates[1] = y coordnate of overlapping letter
let verticalWord = undefined;
let overlapCoordinates = [undefined,undefined];
while (verticalWord === undefined) {
    let verticalWordAttempt;
    if (RANDOM) {
        verticalWordAttempt = random_word();
    } else {
        verticalWordAttempt = VERTICAL_WORD_GENERATOR();
    }
    horizontalWord.split("").forEach(letter => {
        if (verticalWordAttempt.includes(letter)) {
            verticalWord = verticalWordAttempt;
            overlapCoordinates[0] = horizontalWord.indexOf(letter);
            overlapCoordinates[1] = verticalWord.indexOf(letter);
        }
    });
}

//Log the words for debugging purposes
console.log("First Word: ", horizontalWord);
console.log("Second Word: ", verticalWord);
console.log("------------------");

//Set up the crossword display
let crossWord = document.getElementById("cross-word");
//Create each row of the crossword
for (let i = 0; i < 5; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";
    //Create each column under that row
    for (let j = 0; j < 5; j++) {
        let box = document.createElement("div");
        box.classList.add("letter-box");
        //If no letters appear, we want to create a (hidden) box for spacing
        if (i !== overlapCoordinates[1] && j !== overlapCoordinates[0]) {
            box.classList.add("hidden-letter-box");
        } else {
            //If letters appear, we want the box to be visible
            box.classList.add("visible-letter-box");
            //i (row number) = overlapCoordinates[1] (y component of cross spot)
            //means this is the row the horizontal word is on.  We'll use this 
            //to add green letters once the user guesses them correctly
            if (i === overlapCoordinates[1]) box.classList.add("horizontal-cross-letter-box");
            //j (column number) = overlapCoordinates[0] (x component of cross spot)
            //means this is the column the vertical word is on.  We'll use this 
            //to add green letters once the user guesses them correctly
            if (j === overlapCoordinates[0]) box.classList.add("vertical-cross-letter-box");
        }
        row.appendChild(box);
    }
    crossWord.appendChild(row);
}
//Add spacing between the crossword display and the guessing boards
let rowBreak = document.createElement("div");
rowBreak.classList.add("row-break");
crossWord.appendChild(rowBreak);

//Set up the guessing boards (where the player sees their letter guesses)

//Left game board = board for the horizontal word
//Guesses display horizontally
//Height = number of guesses
//Width = 5 (number of letters in words)
let leftBoard = document.getElementById("left-game-board");
for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let leftRow = document.createElement("div");
    leftRow.classList.add("letter-row", "left-letter-row");

    for (let j = 0; j < 5; j++) {
        let leftBox = document.createElement("div");
        leftBox.classList.add("letter-box", "visible-letter-box");
        leftRow.appendChild(leftBox);
    }

    leftBoard.appendChild(leftRow);
}

//Right game board = board for the vertical word
//Guesses display vertically
//Height = number of guesses
//Width = 5 (number of letters in words)
let rightBoard = document.getElementById("right-game-board");
for (let i = 0; i < 5; i++) {
    let rightRow = document.createElement("div");
    rightRow.classList.add("letter-row", "right-letter-row");

    for (let j = 0; j < NUMBER_OF_GUESSES; j++) {
        let rightBox = document.createElement("div");
        rightBox.classList.add("letter-box", "visible-letter-box");
        rightRow.appendChild(rightBox)
    }

    rightBoard.appendChild(rightRow);
}

//Set up keyboard and letter infrastructure
const LETTER_LIST = "abcdefghijklmnopqrstuvwxyz";
//Colored keys will remember which keys have been colored (needed because keys
//have a left and right coloring)
let colored_keys = [];
LETTER_LIST.split("").forEach((currLet) => {
    colored_keys[currLet] = {left: "lightgrey", right:"lightgrey"};
});

//Set up guessing infrastructure
let guesses = [];
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let currentGameResult = 0;
let horizontalWin = false;
let verticalWin = false;

//Pull in the game results from localstorage if they exist.  Otherwise set up new game results
let gameResults;
if (localStorage.getItem("gameResults")) {
    gameResults = JSON.parse(localStorage.getItem("gameResults"));
} else {
    gameResults = {"-1": "0", "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0};
    localStorage.setItem("gameResults", JSON.stringify(gameResults));
}

//If the user has already started on today's word, load their previous game
if (JSON.parse(localStorage.getItem("horizontalWord")) == horizontalWord
    && JSON.parse(localStorage.getItem("verticalWord")) == verticalWord
    && localStorage.getItem("guesses")
    && localStorage.getItem("currentGameResult")) {
        currentGameResult = JSON.parse(localStorage.getItem("currentGameResult"));
        let previousGuesses = JSON.parse(localStorage.getItem("guesses"));
        previousGuesses.forEach(guess => {
            guess.forEach(letter => insertLetter(letter));
            checkGuess(0);
        });
} else {
    //User has either never been to the page, or the last time they played was before today
    localStorage.setItem("horizontalWord", JSON.stringify(horizontalWord));
    localStorage.setItem("verticalWord", JSON.stringify(verticalWord));
    localStorage.setItem("guesses", JSON.stringify(guesses));
    localStorage.setItem("currentGameResult", JSON.stringify(currentGameResult))
}

//Handle any key presses
document.addEventListener("keyup", (k) => {
    let keyPress = String(k.key);
    //If guessesRemaining = 0, the game is over
    if (guessesRemaining === 0) {
    //If the key is a backspace (and there are letters remaining), delete the last letter
    } else if (keyPress === "Backspace" && currentGuess.length !== 0) {
        deleteLetter();
    //If the key is enter (and the user has completed the word), check the current guess
    } else if (keyPress === "Enter" && currentGuess.length === 5) {
        checkGuess(DELAY_LENGTH);
    //If the key is a valid letter (and the user hasn't completed the word), insert it
    } else if (LETTER_LIST.includes(keyPress.toLowerCase()) && currentGuess.length !== 5) {
        insertLetter(keyPress);
    }
});

//The user pressed a valid letter (and hasn't completed the word).  Insert the letter
function insertLetter (keyPress) {
    //Convert all letters and words to lower case for matching
    keyPress = keyPress.toLowerCase();

    //Ignore the left board if the user has already guessed the horizontal word correctly
    if (!horizontalWin) {
        //Enter the letter in the correct space
        let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
        let leftBox = leftRow.children[currentGuess.length];
        leftBox.textContent = keyPress;
    } 

    //Ignore the right board if the user has already guessed the vertical word correctly
    if (!verticalWin) {
        //Enter the letter in the correct space
        let rightRow = document.getElementsByClassName("right-letter-row")[currentGuess.length];
        let rightBox = rightRow.children[NUMBER_OF_GUESSES - guessesRemaining];
        rightBox.textContent = keyPress;
    }

    //Add the letter to the currentGuess array
    currentGuess.push(keyPress);
}

//The user pressed backspace (and this wasn't the last letter).  Delete the last letter
function deleteLetter () {
    //Remove letter from  the left guess board
    let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let leftBox = leftRow.children[currentGuess.length - 1];
    leftBox.textContent = "";

    //Remove letter from the right guess board
    let rightRow = document.getElementsByClassName("right-letter-row")[currentGuess.length - 1];
    let rightBox = rightRow.children[NUMBER_OF_GUESSES - guessesRemaining];
    rightBox.textContent = "";

    //Remove letter from the currentGuess array
    currentGuess.pop();
}

//The user pressed the enter key (and has completed the word).  Check the current guess
function checkGuess (DELAY_LENGTH) {
    //Set the current row representing the horizontal guess
    let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];

    //Alert if the string version of the current guess is not in the valid words list
    if (!VALID_WORDS.includes(currentGuess.join(""))) {
        alert("Not a valid word");
        return;
    }

    guesses.push(currentGuess);
    localStorage.setItem("guesses", JSON.stringify(guesses));

    let currentVerticalGuessSuccess = [];
    let currentHorizontalGuessSuccess = [];

    //Check the horizontal and vertical word letter-by-letter
    for (let i = 0; i < 5; i++) {
        //Set up the delay to be DELAY_LENGTH behind the last letter
        let delay = DELAY_LENGTH * i;

        let guessLetter = currentGuess[i];

        //Set up the horizontal word checking
        let leftBox = leftRow.children[i];
        let leftLetterPosition = horizontalWord.indexOf(guessLetter);

        //If the user has not guessed the horizontal word correctly yet
        if (!horizontalWin) {
            //If the letter is not in the word
            if (leftLetterPosition === -1) {
                colored_keys[guessLetter].left = 'darkgrey';

                //After the animation delay, set the keyboard and guess board letter to dark grey
                setTimeout((i, guessLetter) => {
                    let thisKey = document.getElementsByClassName('button-' + guessLetter)[0];
                    thisKey.style.background = `linear-gradient(90deg, ${colored_keys[guessLetter].left} 50%, ${colored_keys[guessLetter].right} 50%)`;
                    
                    leftBox.style.backgroundColor = 'darkgrey';
                }, delay, i, guessLetter, leftBox)
            } else {
                //The letter is in the word

                //The letter is in the right position
                if (guessLetter === horizontalWord[i]) {
                    colored_keys[guessLetter].left = '#4CBB17';

                    //After the animation delay, set the keyboard, guess board, and cross-word board to forest green
                    setTimeout((i, guessLetter) => {
                        let crossWordBox = document.getElementsByClassName('horizontal-cross-letter-box')[i];
                        crossWordBox.textContent = guessLetter;
                        crossWordBox.style.backgroundColor = '#4CBB17';

                        let thisKey = document.getElementsByClassName('button-' + guessLetter)[0];
                        thisKey.style.background = `linear-gradient(90deg, ${colored_keys[guessLetter].left} 50%, ${colored_keys[guessLetter].right} 50%)`;
                        
                        leftBox.style.backgroundColor = '#4CBB17';
                    }, delay, i, guessLetter, leftBox)

                //The letter is in the wrong position
                } else {
                    //If we've already shaded it green, don't overwrite that
                    if (colored_keys[guessLetter].left === 'lightgrey') colored_keys[guessLetter].left = 'yellow';

                    // let exactMatches = horizontalWord.map(() => )
                    // let partialMatches = 

                    //After the animation delay, set the keyboard and guess board to yellow
                    setTimeout((i, guessLetter) => {
                        let thisKey = document.getElementsByClassName('button-' + guessLetter)[0];
                        thisKey.style.background = `linear-gradient(90deg, ${colored_keys[guessLetter].left} 50%, ${colored_keys[guessLetter].right} 50%)`;

                        leftBox.style.backgroundColor = 'yellow';
                    }, delay, i, guessLetter, leftBox)
                }
            }
        }

        //Set up the vertical word checking
        let rightRow = document.getElementsByClassName("right-letter-row")[i];
        let rightBox = rightRow.children[NUMBER_OF_GUESSES - guessesRemaining];
        let rightLetterPosition = verticalWord.indexOf(guessLetter);

        //If the user has not guessed the vertical word correctly yet
        if (!verticalWin) {
            //If the letter is not in the word
            if (rightLetterPosition === -1) {
                colored_keys[guessLetter].right = 'darkgrey';

                //After the animation delay, set the keyboard and guess board letter to dark grey
                setTimeout((i, guessLetter) => {
                    let thisKey = document.getElementsByClassName('button-' + guessLetter)[0];
                    thisKey.style.background = `linear-gradient(90deg, ${colored_keys[guessLetter].left} 50%, ${colored_keys[guessLetter].right} 50%)`;
                    
                    rightBox.style.backgroundColor = 'darkgrey';
                }, delay, i, guessLetter, rightBox)
            } else {
                //The letter is in the word
                
                //The letter is in the right position
                if (guessLetter === verticalWord[i]) {
                    colored_keys[guessLetter].right = '#4CBB17';

                    //After the animation delay, set the keyboard, guess board, and cross-word board to forest green
                    setTimeout((i, guessLetter) => {
                        let crossSpot = document.getElementsByClassName('vertical-cross-letter-box')[i];
                        crossSpot.textContent = guessLetter;
                        crossSpot.style.backgroundColor = '#4CBB17';
                        
                        let thisKey = document.getElementsByClassName('button-' + guessLetter)[0];
                        thisKey.style.background = `linear-gradient(90deg, ${colored_keys[guessLetter].left} 50%, ${colored_keys[guessLetter].right} 50%)`;

                        rightBox.style.backgroundColor = '#4CBB17';
                    }, delay, i, guessLetter, rightBox)
                
                //The letter is in the wrong position
                } else {
                    //If we've already shaded it green, don't overwrite that
                    if (colored_keys[guessLetter].right == 'lightgrey') colored_keys[guessLetter].right = 'yellow';
                    
                    //After the animation delay, set the keyboard and guess board to yellow
                    setTimeout((i, guessLetter) => {
                        let thisKey = document.getElementsByClassName('button-' + guessLetter)[0];
                        thisKey.style.background = `linear-gradient(90deg, ${colored_keys[guessLetter].left} 50%, ${colored_keys[guessLetter].right} 50%)`;

                        rightBox.style.backgroundColor = 'yellow';
                    }, delay, i, guessLetter, rightBox)
                }
    
            }
        }
    }

    //Check for a horizontal word win
    if (currentGuess.join("") === horizontalWord) {
        horizontalWin = true;
    }

    //Check for a vertical word win
    if (currentGuess.join("") === verticalWord) {
        verticalWin = true;
    }

    //If the user has guessed both words correctly
    if (horizontalWin && verticalWin) {
        setTimeout(()=> {
            if (currentGameResult == 0) {
                console.log(guessesRemaining);
                currentGameResult = NUMBER_OF_GUESSES - guessesRemaining + 1;
                console.log(currentGameResult);
                localStorage.setItem("currentGameResult", JSON.stringify(currentGameResult));
                updateGameResults();
                alert("You guessed both words correctly!");
                displayGameResults();
            } else {
                displayGameResults();
            }
            guessesRemaining = 0;
        }, DELAY_LENGTH * 5)
    //The user hasn't won yet
    } else {
        guessesRemaining--;
        currentGuess = [];

        //Game over
        if (guessesRemaining === 0) {
            if (currentGameResult == 0) {
                setTimeout(() => {
                    currentGameResult = -1;
                    localStorage.setItem("currentGameResult", JSON.stringify(currentGameResult));
                    updateGameResults();
                    alert(`You've run out of guesses, game over!  The words were: "${horizontalWord}" and "${verticalWord}"`);
                    displayGameResults();
                }, DELAY_LENGTH * 5);
            } else {
                displayGameResults();
            }
        }
    }
}

function updateGameResults() {
    gameResults[currentGameResult]++;
    localStorage.setItem("gameResults", JSON.stringify(gameResults));
}

function displayGameResults() {
    let maxGameWins = 0;
    let totalGameWins = 0;
    for (let i = 2; i <= 7; i++) {
        if (Number(gameResults[i]) > maxGameWins) {
            maxGameWins = Number(gameResults[i]);
        }
        totalGameWins += Number(gameResults[i]);
    }
    let totalGamePlays = totalGameWins + Number(gameResults[-1]);
    let winPercent = Math.floor((100 * totalGameWins) / totalGamePlays);
    let winInfo = document.getElementById("win-info");
    winInfo.innerText = `${totalGamePlays} Played - ${winPercent}% Won`;
    let resultBars = document.getElementsByClassName("results-bar");
    for (let i = 2; i <= 7; i++) {
        if (i == currentGameResult) {
            resultBars[i - 2].classList.add("results-bar-selected");
        }
        if (maxGameWins > 0) {
            let resultsBarWidth = (gameResults[i] / maxGameWins) * 85 + 5;
            resultBars[i - 2].style.width = `${resultsBarWidth}%`;
        }
        resultBars[i - 2].innerText = gameResults[i];
    }
    let resultsElement = document.getElementById("results");
    resultsElement.style.display = "block";
}

//Send presses on the onscreen keyboard through as regular keyboard presses
document.getElementById("keyboard").addEventListener("click", (key) => {
    key = key.target;
    //Only check for keyboard button elements    
    if (!key.classList.contains("keyboard-button")) {
        return;
    }
    key = key.textContent;
    if (key === "Del") {
        key = "Backspace";
    }
    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}));
});

//Allow the user to close the results box
document.getElementById("close-results").addEventListener("click", (event) => {
    let resultsElement = document.getElementById("results");
    resultsElement.style.display = "none";
});