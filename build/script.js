import { WORDS } from './words.js';

let random_word = function() {
    //Only the first 2305 words are valid solutions
    //The rest of the words are valid guesses, but will never be the solution
    return WORDS[Math.floor(Math.random() * 2305)];
}

const NUMBER_OF_GUESSES = 7;
let horizontalGuessesRemaining = NUMBER_OF_GUESSES;
let verticalGuessesRemaining = NUMBER_OF_GUESSES;

//Set horizontal word
let horizontalWord = random_word();

//Set vertical word by trying words until they have an overlapping letter
//Store the coordinate of the overlapping letter so we can set up the board correctly
let verticalWord = "";
let overlapCoordinates = [0,0];
while (verticalWord == "") {
    let possibleWord = random_word();
    horizontalWord.split('').forEach(letter => {
        if (possibleWord.includes(letter)) {
            overlapCoordinates[0] = horizontalWord.indexOf(letter);
            overlapCoordinates[1] = possibleWord.indexOf(letter);
            verticalWord = possibleWord;
        }
    });
}

//Log the words for debugging purposes
console.log("First Word: ", horizontalWord);
console.log("Second Word:", verticalWord);
console.log("-----")

//Set up the game boards
let leftBoard = document.getElementById("left-game-board");
let rightBoard = document.getElementById("right-game-board");

for (let i = 0; i < 5; i++) {
    let leftRow = document.createElement("div");
    let rightRow = document.createElement("div");
    leftRow.className = "cross-letter-row";
    rightRow.className = "cross-letter-row";

    for (let j = 0; j < 5; j++) {
        let leftBox = document.createElement("div");
        let rightBox = document.createElement("div");
        leftBox.className = "is-letter-box";
        rightBox.className = "is-letter-box";
        if (i == overlapCoordinates[1]) {
            if (j != overlapCoordinates[0]) rightBox.className = "other-letter-box";
        } else if (j == overlapCoordinates[0]) {
            leftBox.className = "other-letter-box";
        } else {
            leftBox.className = "not-letter-box";
            rightBox.className = "not-letter-box";
        }
        leftRow.appendChild(leftBox);
        rightRow.appendChild(rightBox)
    }
    leftBoard.appendChild(leftRow);
    rightBoard.appendChild(rightRow);
}

let leftRowBreak = document.createElement("br");
let rightRowBreak = document.createElement("br");
leftRowBreak.className = "row-break";
rightRowBreak.className = "row-break";
leftBoard.appendChild(leftRowBreak);
rightBoard.appendChild(rightRowBreak);

//Set up the guessing boards

for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let leftRow = document.createElement("div");
    let rightRow = document.createElement("div");
    leftRow.className = "left-letter-row";
    rightRow.className = "right-letter-row";

    for (let j = 0; j < 5; j++) {
        let leftBox = document.createElement("div");
        let rightBox = document.createElement("div");
        leftBox.className = "letter-box";
        rightBox.className = "letter-box";
        leftRow.appendChild(leftBox);
        rightRow.appendChild(rightBox)
    }
    leftBoard.appendChild(leftRow);
    rightBoard.appendChild(rightRow);
}

let guessesRemaining = NUMBER_OF_GUESSES;
let nextLetter = 0;
let currentGuess = [];

let horizontalWin = false;
let verticalWin = false;

document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) {
        return;
    }

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }

    let found = pressedKey.match(/[a-z]/gi);
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
});

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return;
    }
    pressedKey = pressedKey.toLowerCase();

    if (!horizontalWin) {
        let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
        let leftBox = leftRow.children[nextLetter];
        leftBox.textContent = pressedKey;
        leftBox.classList.add("filled-box");
    }

    if (!verticalWin) {
        let rightRow = document.getElementsByClassName("right-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
        let rightBox = rightRow.children[nextLetter];
        rightBox.textContent = pressedKey;
        rightBox.classList.add("filled-box");
    }
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

function deleteLetter () {
    let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let rightRow = document.getElementsByClassName("right-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let leftBox = leftRow.children[nextLetter - 1];
    let rightBox = rightRow.children[nextLetter - 1];
    leftBox.textContent = "";
    rightBox.textContent = "";
    leftBox.classList.remove("filled-box");
    rightBox.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;
}

function checkGuess () {
    let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let rightRow = document.getElementsByClassName("right-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let guessString = '';
    let leftGuess = horizontalWord.split('');
    let rightGuess = verticalWord.split('');

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != 5) {
        alert("Not enough letters!");
        return;
    }

    if (!WORDS.includes(guessString)) {
        alert("Word not in list!");
        return;
    }

    for (let i = 0; i < 5; i++) {
        let leftLetterColor = '';
        let rightLetterColor = '';
        let leftBox = leftRow.children[i];
        let rightBox = rightRow.children[i];
        let letter = currentGuess[i];
        
        let leftLetterPosition = leftGuess.indexOf(currentGuess[i]);
        let rightLetterPosition = rightGuess.indexOf(currentGuess[i]);
        // is letter in the correct guess
        if (!horizontalWin) {
            if (leftLetterPosition === -1) {
                leftLetterColor = 'grey'
            } else {
                // now, letter is definitely in word
                // if letter index and right guess index are the same
                // letter is in the right position 
                if (currentGuess[i] === leftGuess[i]) {
                    // shade green 
                    leftLetterColor = 'green';
                    let delay = 250 * i
                    let thisLetter = currentGuess[i]
                    setTimeout((i, thisLetter) => {
                        console.log(i)
                        let crossSpot = document.getElementsByClassName('is-letter-box')[i];
                        console.log(thisLetter);
                        crossSpot.textContent = thisLetter;
                        crossSpot.style.backgroundColor = 'green';
                    }, delay, i, thisLetter)

                } else {
                    // shade box yellow
                    leftLetterColor = 'yellow';
                }
    
                leftGuess[leftLetterPosition] = "#";
            }
        }

        if (!verticalWin) {
            if (rightLetterPosition === -1) {
                rightLetterColor = 'grey';
            } else {
                // now, letter is definitely in word
                // if letter index and right guess index are the same
                // letter is in the right position 
                if (currentGuess[i] === rightGuess[i]) {
                    // shade green 
                    rightLetterColor = 'green';
                    let delay = 250 * i
                    let thisLetter = currentGuess[i]
                    setTimeout((i, thisLetter) => {
                        console.log(i)
                        let crossSpot = document.getElementsByClassName('is-letter-box')[i];
                        console.log(thisLetter);
                        crossSpot.textContent = thisLetter;
                        crossSpot.style.backgroundColor = 'green';
                    }, delay, i + 5, thisLetter)
                } else {
                    // shade box yellow
                    rightLetterColor = 'yellow';
                }
    
                rightGuess[rightLetterPosition] = "#";
            }
        }
        

        let delay = 250 * i
        setTimeout(()=> {
            //shade box
            leftBox.style.backgroundColor = leftLetterColor;
            rightBox.style.backgroundColor = rightLetterColor;
            // shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    

    if (guessString === horizontalWord) {
        horizontalWin = true;
    }
    if (guessString === verticalWord) {
        verticalWin = true;
    }
    if (horizontalWin && verticalWin) {
        setTimeout(()=> {
            alert("You guessed right! Game over!")
            guessesRemaining = 0
        }, 1250)
        return;
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            alert("You've run out of guesses! Game over!")
            alert(`The right words were: "${verticalWord}" and "${horizontalWord}"`)
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})