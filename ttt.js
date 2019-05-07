let canvas = document.getElementById('ttt'),
    ctx = canvas.getContext('2d'),
    
    msg = document.getElementById('message'),
    btn = document.getElementById('rematch'),
    xCt = document.getElementById('xCnt'),
    oCt = document.getElementById('oCnt'),
    drawCt = document.getElementById('drawCnt'),
    
    cellSize = 160, //Denna ändrar helt enkelt storleken på allt.
    
    /* Map skapar koordinater */
    map = [
        0, 0, 0, //rad 1
        0, 0, 0, //rad 2
        0, 0, 0, //rad 3
    ],
        
    //Testar efter vinster
    winPatterns = [
        /*Serie av bits; Detta är ett enkelt sätt att leta efter vinster. 0b skrivs först, följt av e.x 000111000, där 111 betyder att en spelare har fått 3 i rad i den mellersta raden, horisontellt. Genom att följa map arrayen ovan kan man lätt se hur 0 och 1 ska skrivas för att definiera vinst. */
        0b111000000, 0b000111000, 0b000000111, // Alla möjliga vinster på rader (horisontellt)
        0b100100100, 0b010010010, 0b001001001, // Alla möjliga vinster på kolumner (vertikalt)
        0b100010001, 0b001010100, // Alla möjliga vinster horisontellt
    ],
        
    //Först är alla värden 0. När användaren trycker på en ruta, tilldelas rutan värdet 1 om det är X; -1 om det är O.
    BLANK = 0, //En tom ruta har värdet 0.
    X = 1, //X blir tilldelat värdet 1.
    O = -1, //O blir tilldelat värdet -1.

    mouse = {
        x: -1,
        y: -1,
    },
    currentPlayer = X,
    gameOver = false;
    

//Själva canvas width och height 
canvas.width = canvas.height = 3 * cellSize;

//Mouseout "lyssnar" efter eventet att musen rör sig utanför canvas.
canvas.addEventListener('mouseout', function () {
    mouse.x = mouse.y = -1; 
});

canvas.addEventListener('mousemove', function (e) {
    let x = e.pageX - canvas.offsetLeft,
        y = e.pageY - canvas.offsetTop;
    
    mouse.x = x;
    mouse.y = y;
    
    getCellByCoords(x, y);
});

//Användaren klickar. play() dras igång
canvas.addEventListener('click', function (e) {
    play(getCellByCoords(mouse.x, mouse.y));
})

function displayTurn() {
    var turn = ((currentPlayer == X)? 'X': 'O')
    
    //msg.textContent = turn + tur;
    msg.textContent = turn + '\'s tur.'
}

function play(cell) {
    //Om gameOver; avsluta spelet (kan ej fylla i ytterligare rutor)
    if(gameOver) return; 
    
    //Testar så att inte map i index [cell] är tomt
    if (map[cell] != BLANK) {
        msg.textContent = 'Denna ruta är upptagen.';
        return;
    }
    
    map[cell] = currentPlayer;

    let winCheck = checkWin(currentPlayer);
    
    if (winCheck !=0) {
        
        //En vinst!
        gameOver = true;
        let winner = ((currentPlayer == X)? 'X': 'O');
        msg.textContent = winner + ' vann!';
        
        if(winner == ('X')) {
            var currentWins = parseInt(xCt.textContent, 10);
            var winsNow = currentWins + 1;
            xCt.textContent = '' + winsNow;
        } else {
            var currentWins = parseInt(oCt.textContent, 10);
            var winsNow = currentWins + 1;
            oCt.textContent = '' + winsNow;
        }
        return;
        
    } else if(map.indexOf(BLANK) == -1) {
        //Om lika och ingen har vunnit.
        gameOver = true;
        msg.textContent = 'Oavgjort!'
        var currentWins = parseInt(drawCt.textContent, 10);
            var winsNow = currentWins + 1;
            drawCt.textContent = '' + winsNow;
        return;
    }
    
    currentPlayer = currentPlayer * -1
    
    displayTurn();
}

function checkWin(player) {
    //Nu kommer bitmasks användas.
    
    let playerMapBitMask = 0;
    for (let i = 0; i <map.length; i++) {
        //<<= är bitwise left shift. Blandar bitwise med arithemetic operators.
        playerMapBitMask <<= 1;
        if (map[i] == player)
            playerMapBitMask += 1;
    }
    
    for(let i = 0; i < winPatterns.length; i++) {
        if ((playerMapBitMask & winPatterns[i]) == winPatterns[i]) {
            return winPatterns[i]
            }
    }
    return 0;
}

function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    fillBoard();

//Rita 3x3 rutnät.
    function drawBoard () {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5; //Denna ändrar simpelt tjockleken på alla linjer. 
        
        //Vertikal linje 1
        ctx.beginPath();
        ctx.moveTo(cellSize, 0);
        ctx.lineTo(cellSize, canvas.height);
        ctx.stroke();
        
        //Vertikal linje 2
        ctx.beginPath();
        ctx.moveTo(cellSize * 2, 0);
        ctx.lineTo(cellSize * 2, canvas.height);
        ctx.stroke();

        //Horisontell linje 1
        ctx.beginPath();
        ctx.moveTo(0, cellSize);
        ctx.lineTo(canvas.width, cellSize);
        ctx.stroke();

        //Horisontell linje 2
        ctx.beginPath();
        ctx.moveTo(0, cellSize * 2);
        ctx.lineTo(canvas.width, cellSize * 2);
        ctx.stroke();
    }

    function fillBoard () {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 12; //Denna kan simpelt ändra tjockleken på X och O.
        for (let i = 0; i < map.length; i++) {
            let coords = getCellCoords(i); //Funktion skriven nedan. 
            
            ctx.save();
            
            ctx.translate(coords.x + cellSize / 2, coords.y + cellSize / 2);
            if (map[i] == X) { //Om index i map är lika med X; Rita X. 
                drawX();
            } else if (map[i] == O) { //Om index i map är lika med O; Rita O. 
                drawO();
            }
            ctx.restore(); //Återställer den senast sparade canvas state.
        }
    }
    
    //Funktion ritar ett X. Funktionen kommer användas när användaren trycker på en tom ruta, då ska rutan fyllas med denna.
    function drawX () {
        ctx.beginPath(); //Påbörjar ritningen
        
        let n = 3.2 //Ändra storleken på X:et. Kom ihåg att även ändra på drawO ifall ändrat.
        
        ctx.lineCap = "round"; //Gör x:en "runda" (d.v.s rounded edges.) 
        ctx.moveTo(-cellSize / n, -cellSize / n); //upper left
        ctx.lineTo(cellSize / n, cellSize / n); //lower right
        ctx.moveTo(cellSize / n, -cellSize / n); //upper right
        ctx.lineTo(-cellSize / n, cellSize / n); //lower left
        ctx.stroke();
    }
    
    //Funktion ritar ett X. Funktionen kommer användas när användaren trycker på en tom ruta, då ska rutan fyllas med denna.
    function drawO () {
        ctx.beginPath(); //Påbörjar ritningen
        ctx.arc(0, 0, cellSize / 3.2, 0, Math.PI * 2); //Denna rad används för att konstruera själva cirkeln. Math.PI är pi.
        ctx.stroke();
    }

    requestAnimationFrame(draw);
}

function getCellCoords (cell) {
    //cellSize som definierat tidigare
    let x = (cell % 3) * cellSize,
        y = Math.floor(cell / 3) * cellSize; //Avrundar  
    
    //Funktionen returnerar x eller y
    return {
        'x': x,
        'y': y,
    };
}

function getCellByCoords(x, y) {
    
    //Denna return funktion returnerar koordinaterna: 0, 1, 2 för toprow, 3,4,5 midrow, 6,7,8 toprow.
    return (Math.floor(x / cellSize) % 3) + Math.floor(y / cellSize) * 3;
}

function restartGame() {
    msg.textContent = "Lycka till!";
    currentPlayer = 1;
    map = [
        0, 0, 0, //rad 1
        0, 0, 0, //rad 2
        0, 0, 0, //rad 3
    ]
    gameOver = false;
}

draw(); //Tillkallar funktionen.