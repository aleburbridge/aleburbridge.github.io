var numberTimer;
var blankSpace;
var numberlistlength = 3;
let answerBox = document.getElementById("answer");
numberArray = []
answerArray = []



function increaseLength() {
    numberlistlength ++
}

function numberTimerFunction() {
    numberTimer = setInterval(randomNumber, 1000);
    lengthCount();
}



function randomNumber() {
    // generates random number, displays it, then pushes it to array
    var currentNumber = Math.floor((Math.random() * 9));
    document.getElementById("numberDisplay").innerHTML = currentNumber;
    setTimeout(function(){ document.getElementById("numberDisplay").innerHTML = "&nbsp;"; }, 500);
    numberArray.push(currentNumber)
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
            text.innerHTML = "Correct! The order was " + numberString.split(',').join(', ');
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
function inputCheck() {
    var x, text;
    x = parseInt(document.getElementById("answer").value);

    answerArray.push(x);
    console.log(answerArray);
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