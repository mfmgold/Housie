let version = "2.0.5";

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

if (getCookie("tktgenerated") == "Yes") {
    window.alert("A ticket has already generated!, close browser to reset.");
    document.getElementById("footer").innerHTML = "Sorry...";
    window.close();
} else { //go ahead and display the ticket.

    document.cookie = "tktgenerated=Yes";

    Number.prototype.pad = function(size) {
        var s = String(this);
        while (s.length < (size || 2)) {
            s = "0" + s;
        }
        return s;
    }


    let current = new Date();
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let cDate = days[current.getDay()] + " " + current.getDate().pad(2) + '-' + (current.getMonth() + 1).pad(2) + '-' + current.getFullYear();
    let cTime = current.getHours().pad(2) + ":" + current.getMinutes().pad(2) + ":" + current.getSeconds().pad(2);
    let dateTime = cDate + ' ' + cTime;
    let tktnum = String.fromCharCode(getRndInteger(65, 90)) + String.fromCharCode(getRndInteger(65, 90)) + String.fromCharCode(getRndInteger(65, 90)) + String.fromCharCode(getRndInteger(65, 90))

    document.getElementById("footer").innerHTML = "Ticket #" + tktnum + " generated on: " + dateTime + ", (c) Murtuza Masalawala - ver:" + version;

    //set the seed using ticketnum
    new Math.seedrandom(tktnum);

    // setting canvas size. 
    var ticket = getTicket();
    var checked = initialiseArrays(28);
    var linedRow = initialiseArrays(3);
    var lineColors = ["#46015E", "#F54901", "#C66BAE"];
    var lineNames = ['First', 'Second', 'Third'];
    var x, y, z;
    var startX, startY;

    var colorMark = '#ffff00'; //yellow
    var colorErase = '#fff9a6'; //'#ff6347' light yellow
    var colorBlank = '#ffffff'; //white
    var colorText = '#000000'; //black
    var colorGrid = '#19b7f1';
    var canvas;
    var ctx;
    var padx = pady = 10;

    var cellw, cellh;

    function initialiseArrays(size) {
        var arr = [];
        for (i = 0; i < size; i++) {
            arr[i] = false;
        }
        return arr;
    }

    Resize();

    function Resize() {

        canvas = document.getElementById('myCanvas');
        ctx = canvas.getContext('2d');

        var screenWidth = document.documentElement.clientWidth - 10;
        var screenHeight = document.documentElement.clientHeight - 60;

        ctx.clearRect(0, 0, screenWidth, screenHeight);

        if (screenHeight > 360) {
            screenHeight = 360;
        }
        ctx.canvas.width = screenWidth;
        ctx.canvas.height = screenHeight;
        ctx.lineWidth = 3;
        ctx.strokeStyle = colorGrid;

        cellw = (screenWidth - 2 * padx) / 9;
        cellh = (screenHeight - 2 * pady) / 3;
        var idx = 0;
        var num;
        for (j = 0; j < 9; j++) {
            for (i = 0; i < 3; i++) {
                x = j * cellw + padx;
                y = i * cellh + pady;
                ctx.lineWidth = 3;
                ctx.strokeStyle = colorGrid;
                ctx.rect(x, y, cellw, cellh);
                ctx.stroke();
                if (checked[idx]) {
                    ctx.fillStyle = colorMark;
                    ctx.fillRect(x, y, cellw, cellh);
                }
                ctx.font = "40px Arial";
                num = ticket[idx];
                if (num == 0) num = '';
                ctx.fillStyle = colorText;
                z = (cellw - ctx.measureText(num).width) / 2;
                ctx.fillText(num, x + z, y + cellh - 15);
                idx++;
            }
        }
        // draw lines
        ctx.stroke();
        for (i = 0; i < 3; i++) {
            if (linedRow[i]) drawLine(i);
        }

    }

    canvas.onclick = function(event) {
        // get canvas size and position
        var boundingRect = canvas.getBoundingClientRect(); // turn this on for Desktop
        // translate mouse event coordinates to canvas coordinates
        x = (event.clientX - boundingRect.left) * (canvas.width / boundingRect.width); // turn this on for Desktop
        y = (event.clientY - boundingRect.top) * (canvas.height / boundingRect.height); // turn this on for Desktop
        markCell();
    }

    function checkPointinCanvas(x, y) {
        return (x >= 0 && x < cellw * 9 && y >= 0 && y <= cellh * 3);
    }


    function markCell() {
        var x1, y1;
        var idx;
        var num;

        if (checkPointinCanvas(x, y)) {
            j = Math.trunc((x - padx) / cellw);
            i = Math.trunc((y - pady) / cellh);
            x1 = j * cellw + padx;
            y1 = i * cellh + pady;
            idx = j * 3 + i;
            num = ticket[idx];
            let data = ctx.getImageData(x1 + 4, y1 + 4, 1, 1).data;
            let cellColor = "#" + ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1);

            if (num != 0) {
                if (checked[idx]) {
                    if (cellColor == colorMark) ctx.fillStyle = colorErase // set color to indicate erase belfroe blanking it '
                    else ctx.fillStyle = colorBlank;
                } else {
                    ctx.fillStyle = colorMark;
                }

                if (ctx.fillStyle != colorErase) checked[idx] = !checked[idx];

                ctx.fillRect(x1 + 2, y1 + 2, cellw - 4, cellh - 4);
                ctx.fillStyle = colorText;
                z = (cellw - ctx.measureText(num).width) / 2;
                ctx.fillText(num, x1 + z, y1 + cellh - 15);

                if (checkLineComplete(i)) {
                    // mark the completed line and speak. 
                    linedRow[i] = true;
                    drawLine(i);
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(lineNames[i] + 'line is Complete!'));
                    if (checkHousie()) window.speechSynthesis.speak(new SpeechSynthesisUtterance('Congratulations, Its a Full Housie!'));
                }
                if (!checked[idx] && linedRow[i]) {
                    linedRow[i] = false;
                    Resize();
                }
            }
        }
    }

    function checkHousie() {
        var flag = true;
        for (let row = 0; row < 3; row++) {
            if (!linedRow[row]) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    function getTicket() {
        var tkt = [];
        var zero3 = [];
        var text = '';
        var i, j;
        var min, max, idx;
        var limitRow = [0, 0, 0];
        var limitCol, cnt;
        // Using a one dimensional array where index 0-2 is column 1 and so on.
        // Get 3 random unique integers for each column
        // first column is 1-10, 2nd is 11-20 and so on.
        for (j = 0; j < 9; j++) {
            min = j * 10 + 1;
            max = 10 * (j + 1);
            for (i = j * 3; i < j * 3 + 3; i++) {
                tkt[i] = getRndInteger(min, max);
                if (i == j * 3 + 1) {
                    while (tkt[i] == tkt[i - 1]) {
                        tkt[i] = getRndInteger(min, max);
                    }
                }
                if (i == j * 3 + 2) {
                    while (tkt[i] == tkt[i - 1] || tkt[i] == tkt[i - 2]) {
                        tkt[i] = getRndInteger(min, max);
                    }
                }
            }
        }

        // sort the array as each column should have numbers in ascending order. 
        tkt.sort(function(a, b) {
            return a - b
        });

        // as now we have 27 random unique numbers but we need only 15 numbers
        // on the ticket, so setting one random cell in each column to 0.
        for (j = 0; j < 4; j++) {
            idx = getRndInteger(j * 3, j * 3 + 2);
            tkt[idx] = 0;
            limitRow[idx % 3]++;
        }
        for (j = 4; j < 9; j++) {
            do {
                idx = getRndInteger(j * 3, j * 3 + 2);
            } while (limitRow[idx % 3] >= 4);
            tkt[idx] = 0;
            limitRow[idx % 3]++;
        }
        // scan each cell whether it is zero, if not check whether the row has already 4 zeros, and ensure that the column has atleast one
        // number before setting the cell to zero. 
        cnt = 0;
        for (j = 0; j < 9; j++) {
            if (cnt == 3) {
                break
            }
            limitCol = 1;
            for (i = 0; i < 3; i++) {
                if (cnt == 3 || limitCol == 2) {
                    break
                }
                if (tkt[j * 3 + i] != 0 && limitCol < 2 && limitRow[i] < 4) {
                    tkt[j * 3 + i] = 0;
                    limitRow[i]++;
                    limitCol++;
                    cnt++;
                }
            }
        }
        return tkt;
    }


    function drawLine(row) {
        var lx1, ly1, lx2;
        lx1 = padx;
        ly1 = (row * cellh) + (cellh / 2) + pady;
        lx2 = ctx.canvas.width - padx;

        var startX = lx1;
        var startY = ly1;
        var zigzagSpacing = 10;

        ctx.lineWidth = 4;

        ctx.strokeStyle = lineColors[row];
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // draw ten lines
        n = 0;
        do {
            var x = startX + ((n + 1) * zigzagSpacing);
            var y;

            if (n % 2 == 0) { // if n is even...
                y = startY + 10;
            } else { // if n is odd...
                y = startY;
            }
            ctx.lineTo(x, y);
            n++;
        } while (x <= lx2 - zigzagSpacing);
        ctx.stroke();

    }

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function checkLineComplete(row) {
        var flag = true;
        var idx;

        for (j = 0; j < 9; j++) {
            idx = j * 3 + row;
            if (!checked[idx] && ticket[idx] != 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    window.addEventListener('load', function() {

            var touchsurface = document.getElementById('myCanvas'),

                dist,
                threshold = cellw * 2, //required min distance traveled to be considered swipe
                allowedTime = 750, // maximum time allowed to travel that distance
                elapsedTime,
                startTime;


            function handleswipe(isrightswipe) {

                if (isrightswipe) {
                    //Use has made a right swipe! ' + startX + ", " + startY);
                    x = startX;
                    y = startY;

                    if (checkPointinCanvas(x, y)) {
                        var row = Math.trunc((y - pady) / cellh);

                        if (checkLineComplete(row)) {
                            linedRow[row] = true;
                            drawLine(row);
                        }
                    }

                } else {
                    x = startX;
                    y = startY;
                    markCell();
                }
            }

            touchsurface.addEventListener('touchstart', function(e) {
                touchsurface.innerHTML = '';
                var touchobj = e.changedTouches[0];
                dist = 0;
                startX = touchobj.pageX;
                startY = touchobj.pageY;
                startTime = new Date().getTime(); // record time when finger first makes contact with surface
                e.preventDefault();
            }, false)

            touchsurface.addEventListener('touchmove', function(e) {
                e.preventDefault(); // prevent scrolling when inside DIV
            }, false)

            touchsurface.addEventListener('touchend', function(e) {
                var touchobj = e.changedTouches[0];
                dist = touchobj.pageX - startX; // get total dist traveled by finger while in contact with surface
                elapsedTime = new Date().getTime() - startTime; // get time elapsed
                // check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
                var swiperightBol = (elapsedTime <= allowedTime && dist >= threshold && Math.abs(touchobj.pageY - startY) <= 100);
                handleswipe(swiperightBol);
                e.preventDefault();
            }, false)

        }, false) // end window.onload


} // if no other tab is open continue.