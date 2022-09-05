//Import the list of all words from the words.js file.  The first 2305 words are
//the 'common' words that can be solutions.  The rest are valid for guesses, but
//will not be the solution
import { WORDS } from "./words.js";

//Set the list of 'common' words that can be solutions
const GAME_WORDS = WORDS.slice(0,2306);

//Set the list of all valid words that someone can use to guess
const VALID_WORDS = WORDS;

//Set the animation delay length (per letter in ms)
const DELAY_LENGTH = 250;

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

//Set up guessing infrastructure
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let horizontalWin = false;
let verticalWin = false;

//Set up keyboard and letter infrastructure
const LETTER_LIST = "abcdefghijklmnopqrstuvwxyz";
//Colored keys will remember which keys have been colored (needed because keys
//have a left and right coloring)
let colored_keys = [];
LETTER_LIST.split("").forEach((currLet) => {
    colored_keys[currLet] = {left: "lightgrey", right:"lightgrey"};
});

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
        checkGuess();
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
function checkGuess () {
    //Set the current row representing the horizontal guess
    let leftRow = document.getElementsByClassName("left-letter-row")[NUMBER_OF_GUESSES - guessesRemaining];

    //Alert if the string version of the current guess is not in the valid words list
    if (!VALID_WORDS.includes(currentGuess.join(""))) {
        alert("Not a valid word");
        return;
    }

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
            alert("You guessed both words correctly!");
            guessesRemaining = 0;
        }, 1250)
    //The user hasn't won yet
    } else {
        guessesRemaining--;
        currentGuess = [];

        //Game over
        if (guessesRemaining === 0) {
            alert(`You've run out of guesses, game over!  The words were: "${verticalWord}" and "${horizontalWord}"`);
        }
    }
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