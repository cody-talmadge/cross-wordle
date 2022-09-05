//Import the list of all words from the words.js file.  The first 2506 words are
//the 'common' words that can be solutions.  The rest are valid for guesses, but
//will not be the solution
import { WORDS } from './words.js';

//Set the list of 'common' words that can be solutions
const GAME_WORDS = WORDS.slice(0,2506);
//Set the list of all valid words that someone can use to guess
const VALID_WORDS = WORDS;

//Return a random word from the game words list
let random_word = function() {
    return GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
}

//Set up guess remaining counts for both words
const NUMBER_OF_GUESSES = 7;
let horizontalGuessesRemaining = NUMBER_OF_GUESSES;
let verticalGuessesRemaining = NUMBER_OF_GUESSES;

//Set horizontal word
let horizontalWord = random_word();

//Set the vertical word by trying random words until they have an overlapping letter
//Store the coordinate of the overlapping letter so we can set up the board correctly
//overlapCoordinates[0] = x coordinate of overlapping letter
//overlapCoordinates[1] = y coordnate of overlapping letter
let verticalWord = undefined;
let overlapCoordinates = [undefined,undefined];
while (verticalWord === undefined) {
    let verticalWordAttempt = random_word();
    horizontalWord.split('').forEach(letter => {
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
        if (i != overlapCoordinates[1] && j != overlapCoordinates[0]) {
            box.classList.add("hidden-letter-box");
        } else {
            //If letters appear, we want the box to be visible
            box.classList.add("visible-letter-box");
            //i (row number) = overlapCoordinates[1] (y component of cross spot)
            //means this is the row the horizontal word is on.  We'll use this 
            //to add green letters once the user guesses them correctly
            if (i == overlapCoordinates[1]) box.classList.add("horizontal-cross-letter-box");
            //j (column number) = overlapCoordinates[0] (x component of cross spot)
            //means this is the column the vertical word is on.  We'll use this 
            //to add green letters once the user guesses them correctly
            if (j == overlapCoordinates[0]) box.classList.add("vertical-cross-letter-box");
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

let guessesRemaining = NUMBER_OF_GUESSES;
let nextLetter = 0;
let currentGuess = [];

let horizontalWin = false;
let verticalWin = false;

const LETTER_LIST = "abcdefghijklmnopqrstuvwxyz";
let colored_keys = [];
LETTER_LIST.split('').forEach((currLet) => {
    colored_keys[currLet] = {left: 'lightgrey', right:'lightgrey'};
});

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
        // animateCSS(leftBox, "pulse")
        leftBox.textContent = pressedKey;
        leftBox.classList.add("filled-box");
    }

    if (!verticalWin) {
        let rightRow = document.getElementsByClassName("right-letter-row")[nextLetter];
        let rightBox = rightRow.children[NUMBER_OF_GUESSES - guessesRemaining];
        // animateCSS(rightBox, "pulse")
        rightBox.textContent = pressedKey;
        rightBox.classList.add("filled-box");
    }
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

function deleteLetter () {
    let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let rightRow = document.getElementsByClassName("right-letter-row")[nextLetter - 1];
    let leftBox = leftRow.children[nextLetter - 1];
    let rightBox = rightRow.children[NUMBER_OF_GUESSES - guessesRemaining];
    leftBox.textContent = "";
    rightBox.textContent = "";
    leftBox.classList.remove("filled-box");
    rightBox.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;
}

function checkGuess () {
    let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
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
        let rightRow = document.getElementsByClassName("right-letter-row")[i];
        let rightBox = rightRow.children[NUMBER_OF_GUESSES - guessesRemaining];
        let letter = currentGuess[i];
        
        let leftLetterPosition = leftGuess.indexOf(currentGuess[i]);
        let rightLetterPosition = rightGuess.indexOf(currentGuess[i]);
        // is letter in the correct guess
        if (!horizontalWin) {
            if (leftLetterPosition === -1) {
                leftLetterColor = 'darkgrey'
                colored_keys[currentGuess[i]].left = 'darkgrey';
                let delay = 250 * i
                setTimeout((i, thisLetter) => {
                    let thisKey = document.getElementsByClassName('button-' + thisLetter)[0];
                    thisKey.style.background = `linear-gradient(90deg, ${colored_keys[thisLetter].left} 50%, ${colored_keys[thisLetter].right} 50%)`;
                }, delay, i, currentGuess[i])
            } else {
                // now, letter is definitely in word
                // if letter index and right guess index are the same
                // letter is in the right position
                if (currentGuess[i] === leftGuess[i]) {
                    // shade green 
                    leftLetterColor = 'forestgreen';
                    let delay = 250 * i
                    let thisLetter = currentGuess[i]
                    colored_keys[thisLetter].left = 'forestgreen';
                    setTimeout((i, thisLetter) => {
                        console.log(i)
                        let crossSpot = document.getElementsByClassName('horizontal-cross-letter-box')[i];
                        console.log(thisLetter);
                        crossSpot.textContent = thisLetter;
                        crossSpot.style.backgroundColor = 'forestgreen';
                        // animateCSS(crossSpot, 'flipInX');
                        let thisKey = document.getElementsByClassName('button-' + thisLetter)[0];
                        thisKey.style.background = `linear-gradient(90deg, ${colored_keys[thisLetter].left} 50%, ${colored_keys[thisLetter].right} 50%)`;
                    }, delay, i, thisLetter)

                } else {
                    // shade box yellow
                    leftLetterColor = 'yellow';
                    if (colored_keys[currentGuess[i]].left == 'lightgrey') colored_keys[currentGuess[i]].left = 'yellow';
                    let delay = 250 * i
                    setTimeout((i, thisLetter) => {
                        let thisKey = document.getElementsByClassName('button-' + thisLetter)[0];
                        thisKey.style.background = `linear-gradient(90deg, ${colored_keys[thisLetter].left} 50%, ${colored_keys[thisLetter].right} 50%)`;
                    }, delay, i, currentGuess[i])
                }
    
                leftGuess[leftLetterPosition] = "#";
            }
        }

        if (!verticalWin) {
            if (rightLetterPosition === -1) {
                rightLetterColor = 'darkgrey';
                colored_keys[currentGuess[i]].right = 'darkgrey';
                let delay = 250 * i
                setTimeout((i, thisLetter) => {
                    let thisKey = document.getElementsByClassName('button-' + thisLetter)[0];
                    thisKey.style.background = `linear-gradient(90deg, ${colored_keys[thisLetter].left} 50%, ${colored_keys[thisLetter].right} 50%)`;
                }, delay, i, currentGuess[i])
            } else {
                // now, letter is definitely in word
                // if letter index and right guess index are the same
                // letter is in the right position 
                if (currentGuess[i] === rightGuess[i]) {
                    // shade green 
                    rightLetterColor = 'forestgreen';
                    let delay = 250 * i;
                    let thisLetter = currentGuess[i];
                    colored_keys[thisLetter].right = 'forestgreen';
                    setTimeout((i, thisLetter) => {
                        console.log(i)
                        let crossSpot = document.getElementsByClassName('vertical-cross-letter-box')[i];
                        console.log(thisLetter);
                        crossSpot.textContent = thisLetter;
                        crossSpot.style.backgroundColor = 'forestgreen';
                        // animateCSS(crossSpot, 'flipInX');
                        let thisKey = document.getElementsByClassName('button-' + thisLetter)[0];
                        thisKey.style.background = `linear-gradient(90deg, ${colored_keys[thisLetter].left} 50%, ${colored_keys[thisLetter].right} 50%)`;
                    }, delay, i, thisLetter)
                } else {
                    // shade box yellow
                    rightLetterColor = 'yellow';
                    if (colored_keys[currentGuess[i]].right == 'lightgrey') colored_keys[currentGuess[i]].right = 'yellow';
                    let delay = 250 * i
                    setTimeout((i, thisLetter) => {
                        let thisKey = document.getElementsByClassName('button-' + thisLetter)[0];
                        thisKey.style.background = `linear-gradient(90deg, ${colored_keys[thisLetter].left} 50%, ${colored_keys[thisLetter].right} 50%)`;
                    }, delay, i, currentGuess[i])
                }
    
                rightGuess[rightLetterPosition] = "#";
            }
        }
        

        let delay = 250 * i
        setTimeout(()=> {
            //shade box
            // animateCSS(leftBox, 'flipInX')
            // animateCSS(rightBox, 'flipInX')
            leftBox.style.backgroundColor = leftLetterColor;
            rightBox.style.backgroundColor = rightLetterColor;
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