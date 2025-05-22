let umbrella = '\u2602';
let star = '\u2605';
let smile = '\u263B';
let horse = '\u265E';
let heart = '\u2665';
let eigthNote = '\u266B';
let flag = '\u2691';
let crown = '\u265B';
let person = '\u26F9';
let wingdingArray = [heart, flag, star, smile, horse, person, crown, umbrella, eigthNote]
console.log(...wingdingArray);
var numberArray = []
var answerArray = []
var numberTimer;
var blankSpace;
var numberlistlength = 3;

function increaseLength() {
    numberlistlength ++
}

function numberTimerFunction() {
    numberTimer = setInterval(randomNumber, 1000);
    lengthCount();
}



function randomNumber() {
    // generates random number, displays it, then pushes it to array
    let randomNum = Math.floor((Math.random() * 9))
    var currentSymbol = wingdingArray[randomNum];
    document.getElementById("symbolDisplay").innerHTML = currentSymbol;
    setTimeout(function(){ document.getElementById("symbolDisplay").innerHTML = "&nbsp;"; }, 500);
    numberArray.push(randomNum)
    returnLoop(); 
}


function returnLoop () {
    var text = document.getElementById("rightWrongDisplay");
    text.innerHTML = "&nbsp;"
    if (numberArray.length < numberlistlength) { 
        return;
    } else {
        clearInterval(numberTimer);

    }
}

function arrayCheck(array1, array2) {
    for (i=0; i < array1.length; i++) {
        if (array1[i] === array2[i]) {
            continue
        } else {
            return false;
        }
    } 
    return true;
} 

// changes html element to 'correct' or 'incorrect'
function bigIfTrue() {
    var text = document.getElementById("rightWrongDisplay");
    
    if (answerArray.length === numberlistlength) {
        var numberString = numberArray.toString();
        var answerString = answerArray.toString();

        if (arrayCheck(numberArray, answerArray)) {
            text.innerHTML = "Correct!"
            increaseLength();
            numberArray = [];
            answerArray = [];
        } else {
            text.innerHTML = "Incorrect. The order was " + numberString.split(',').join(', ') + "\n Your answer was " + answerString.split(',').join(', ');
            gameOver();
        }
    }
}

// displays length of number string
function lengthCount() {
    var text = document.getElementById("lengthCount");
    text.innerHTML = "Length: " + JSON.stringify(numberlistlength);
}

// input check!
function inputCheck(num) {
    answerArray.push(num);
    console.log(answerArray);
    if (answerArray.length === numberlistlength) {
        bigIfTrue()
        console.log("big if true has run")
    }
}

function gameOver() {
    var text = document.getElementById("numberDisplay");
    var button = document.getElementById("showNumbers");
    numberArray = []
    answerArray = []

    numberlistlength = 3
    text.innerHTML = "Game Over!"
}


// auto submit & clear input 
/*
var text = document.getElementById("answer");
var answerButton = document.getElementById("answerButton");
var clearButton = document.getElementById("clearButton");
text.onkeyup = function() {
    if (text.value.length == 1) {
        answerButton.click();
        clearButton.click();
        bigIfTrue();
  }
}
*/