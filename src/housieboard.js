let version = '2.0.2'; // update version here. 

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {
        s = '0' + s;
    }
    return s;
}

let current = new Date();
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let cDate = days[current.getDay()] + " " + current.getDate().pad(2) + '- ' + (current.getMonth() + 1).pad(2) + '- ' + current.getFullYear();
let cTime = current.getHours().pad(2) + ':' + current.getMinutes().pad(2) + ': ' + current.getSeconds().pad(2);
let dateTime = cDate + ' ' + cTime;
let tktnum = String.fromCharCode(getRndInteger(65, 90)) + String.fromCharCode(getRndInteger(65, 90)) + String.fromCharCode(getRndInteger(65, 90)) + String.fromCharCode(getRndInteger(65, 90))
document.getElementById('footer').innerHTML = " Board # " + tktnum + " generated on: " + dateTime + ", (c) Murtuza Masalawala - ver: " + version;

// setting canvas size. 

resize();

var canvas;
var context;
var padx, pady, cellw, cellh;
var checked = [];
for (idx = 0; idx < 90; idx++) {
    checked[idx] = false;
}

function resize() {

    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    var screenWidth = document.documentElement.clientWidth - 10;
    var screenHeight = document.documentElement.clientHeight - 80; // consider size of button and footer. 
    context.canvas.width = screenWidth;
    context.canvas.height = screenHeight;

    document.getElementById('button').style = "height:50px;width:300px;font-size: 24px;background-color: #19B7F1;border: 2px solid #008CBA;position:absolute;left:" + (((document.documentElement.clientWidth / 2 - 150) / document.documentElement.clientWidth) * 100) + "%;top:" + (((screenHeight / document.documentElement.clientHeight) * 100) + 1) + "%";

    document.getElementById('popupbox').style = "visibility:;height:" + screenHeight / 4 + "px;width:" + screenWidth / 4 + "px;font-size: 72px;background-color: yellow;border: 2px solid #008CBA;position:absolute;left:        " + (((document.documentElement.clientWidth / 2 - (screenWidth / 8)) / document.documentElement.clientWidth) * 100) + "%; top:" + (((document.documentElement.clientHeight / 2 - (screenHeight / 8)) / document.documentElement.clientHeight) * 100) + "%";
    document.getElementById('popupbox').innerHTML = 'Hello!';
    $("#popupbox").fadeOut(2000);
    window.speechSynthesis.speak(new SpeechSynthesisUtterance('Hello!'));

    padx = 10;
    pady = 10;
    cellw = (screenWidth - 2 * padx) / 10;
    cellh = (screenHeight - 2 * pady) / 9;
    let fontSize = 40;
    context.lineWidth = 3;
    let idx = 0;
    // draw board with numbers
    for (row = 0; row < 9; row++) {
        for (col = 0; col < 10; col++) {
            idx++;
            let x = col * cellw + padx;
            let y = row * cellh + pady;
            context.rect(x, y, cellw, cellh);
            context.font = fontSize + 'px Arial';
            let z = (cellw - context.measureText(idx).width) / 2;
            context.fillText(idx, x + z, y + cellh - 15);
        }
    }

    context.strokeStyle = '#19B7F1';
    context.stroke();
}

canvas.onclick = function(event) {
    // get canvas size and position
    let boundingRect = canvas.getBoundingClientRect();
    // translate mouse event coordinates to canvas coordinates
    let x = (event.clientX - boundingRect.left) * (canvas.width / boundingRect.width);
    let y = (event.clientY - boundingRect.top) * (canvas.height / boundingRect.height);

    let idx;
    let num;
    // mark selected cell
    if (context.isPointInPath(x, y)) {
        let row = Math.trunc((x - padx) / cellw);
        let col = Math.trunc((y - pady) / cellh);
        let x1 = row * cellw + padx;
        let y1 = col * cellh + pady;
        idx = col * 10 + row + 1;
        if (checked[idx]) {
            context.fillStyle = 'white';
        } else {
            context.fillStyle = 'yellow';
        }
        context.fillRect(x1 + 1, y1 + 1, cellw - 2, cellh - 2);
        context.fillStyle = 'black';
        z = (cellw - context.measureText(idx).width) / 2;
        context.fillText(idx, x1 + z, y1 + cellh - 15);
        checked[idx] = !checked[idx];
        checked[idx] ? ++countMarkedCells : --countMarkedCells; // if cell is unmarked then reduce the count
    }
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playPause() {
    var change = document.getElementById('button');
    if (change.innerHTML == 'PLAY') {
        change.innerHTML = 'PAUSE';
        playNextNumber();
    } else {
        change.innerHTML = 'PLAY';
        pauseNextNumber();
    }
}

var t;
var timer_is_on = false;
var countMarkedCells = 0;
var currentNumber = 0;
var rectX, rectY, rectW, rectH;
var animationFontSize = 8;

function timedNextNumber() {
    // add code here to get next number and animate. 
    // get random number and check whether already marked, continue till unmarked number found.  
    let num = 0;
    do {
        num = getRndInteger(1, 90);
    } while (checked[num]);
    // mark cell;
    let row = Math.trunc(num / 10);
    let col = num % 10 - 1;
    if (col < 0) {
        col = 9;
        row -= 1;
    }

    let x1 = col * cellw + padx;
    let y1 = row * cellh + pady;
    context.fillStyle = 'yellow';
    context.fillRect(x1 + 1, y1 + 1, cellw - 2, cellh - 2);
    context.fillStyle = 'black';
    let z = (cellw - context.measureText(num).width) / 2;
    context.fillText(num, x1 + z, y1 + cellh - 15);
    checked[num] = !checked[num];
    // checked[num] ? ++countMarkedCells : --countMarkedCells; // if cell is unmarked then reduce the count
    ++countMarkedCells;
    // display number in a pop up box 
    document.getElementById('popupbox').innerHTML = num;
    $("#popupbox").fadeIn();
    $("#popupbox").fadeOut(5000); //fade out in 5 seconds
    // speak the number using default browser language
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(num));
    if (countMarkedCells < 90) {
        // if all cells ae not marked cotinue the timer
        t = setTimeout(timedNextNumber, 7000); // 7 seconds
    } else {
        // all cells are marked, game over. 
        document.getElementById('button').disabled = true;
        document.getElementById('button').innerHTML = 'Game Over!';
    }
}

function playNextNumber() {
    if (!timer_is_on) {
        timer_is_on = true;
        timedNextNumber();
    }
}

function pauseNextNumber() {
    clearTimeout(t);
    timer_is_on = false;
}