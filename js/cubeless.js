
// Helper for parsing algs (used in RubiksCube class)
// Note: The original code had regex inside doAlgorithm.

/**
 * RubiksCube class copied from js/RubiksCube.js to decouple from index.html UI logic
 */
function RubiksCube() {
    this.cubestate = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6];

    this.resetCube = function(){
        this.cubestate = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    }
    this.solution = function(){
        if (typeof Cube !== 'undefined') {
            var gcube = Cube.fromString(this.toString());
            return gcube.solve();
        }
        return "";
    }

    this.isSolved = function(){
        for (var i = 0; i<6;i++){
            var colour1 = this.cubestate[9*i];
            for (var j = 0; j<8; j++){
                if (this.cubestate[9*i + j + 1]!=colour1){
                    return false;
                }
            }
        }
        return true;
    }
    this.wcaOrient = function() {
        // u-r--f--d--l--b
        // 4 13 22 31 40 49
        //
        var moves = "";

        if (this.cubestate[13]==1) {//R face
            this.doAlgorithm("z'");
            moves +="z'";
            moves += " ";
        } else if (this.cubestate[22]==1) {//on F face
            this.doAlgorithm("x");
            moves+="x";
            moves += " ";
        } else if (this.cubestate[31]==1) {//on D face
            this.doAlgorithm("x2");
            moves+="x2";
            moves += " ";
        } else if (this.cubestate[40]==1) {//on L face
            this.doAlgorithm("z");
            moves+="z";
            moves += " ";
        } else if (this.cubestate[49]==1) {//on B face
            this.doAlgorithm("x'");
            moves+="x'";
            moves += " ";
        }

        if (this.cubestate[13]==3) {//R face
            this.doAlgorithm("y");
            moves+="y";
            moves += " ";
        } else if (this.cubestate[40]==3) {//on L face
            this.doAlgorithm("y'");
            moves+="y'";
            moves += " ";
        } else if (this.cubestate[49]==3) {//on B face
            this.doAlgorithm("y2");
            moves+="y2";
            moves += " ";
        }

        return moves;
    }
    this.toString = function(){
        var str = "";
        var i;
        var sides = ["U","R","F","D","L","B"]
        for(i=0;i<this.cubestate.length;i++){
            str+=sides[this.cubestate[i]-1];
        }
        return str;

    }

    this.doAlgorithm = function(alg) {
        if (alg == "") return;

        var moveArr = alg.split(/(?=[A-Za-z])/);
        var i;

        for (i = 0;i<moveArr.length;i++) {
            var move = moveArr[i];
            var myRegexp = /([RUFBLDrufbldxyzEMS])(\d*)('?)/g;
            var match = myRegexp.exec(move.trim());


            if (match!=null) {

                var side = match[1];

                var times = 1;
                if (!match[2]=="") {
                    times = match[2] % 4;
                }

                if (match[3]=="'") {
                    times = (4 - times) % 4;
                }

                switch (side) {
                    case "R":
                        this.doR(times);
                        break;
                    case "U":
                        this.doU(times);
                        break;
                    case "F":
                        this.doF(times);
                        break;
                    case "B":
                        this.doB(times);
                        break;
                    case "L":
                        this.doL(times);
                        break;
                    case "D":
                        this.doD(times);
                        break;
                    case "r":
                        this.doRw(times);
                        break;
                    case "u":
                        this.doUw(times);
                        break;
                    case "f":
                        this.doFw(times);
                        break;
                    case "b":
                        this.doBw(times);
                        break;
                    case "l":
                        this.doLw(times);
                        break;
                    case "d":
                        this.doDw(times);
                        break;
                    case "x":
                        this.doX(times);
                        break;
                    case "y":
                        this.doY(times);
                        break;
                    case "z":
                        this.doZ(times);
                        break;
                    case "E":
                        this.doE(times);
                        break;
                    case "M":
                        this.doM(times);
                        break;
                    case "S":
                        this.doS(times);
                        break;

                }
            } else {

                console.log("Invalid alg, or no alg specified:" + alg + "|");

            }

        }

    }

    this.doU = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.cubestate = [cubestate[6], cubestate[3], cubestate[0], cubestate[7], cubestate[4], cubestate[1], cubestate[8], cubestate[5], cubestate[2], cubestate[45], cubestate[46], cubestate[47], cubestate[12], cubestate[13], cubestate[14], cubestate[15], cubestate[16], cubestate[17], cubestate[9], cubestate[10], cubestate[11], cubestate[21], cubestate[22], cubestate[23], cubestate[24], cubestate[25], cubestate[26], cubestate[27], cubestate[28], cubestate[29], cubestate[30], cubestate[31], cubestate[32], cubestate[33], cubestate[34], cubestate[35], cubestate[18], cubestate[19], cubestate[20], cubestate[39], cubestate[40], cubestate[41], cubestate[42], cubestate[43], cubestate[44], cubestate[36], cubestate[37], cubestate[38], cubestate[48], cubestate[49], cubestate[50], cubestate[51], cubestate[52], cubestate[53]];
        }

    }

    this.doR = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;

            this.cubestate = [cubestate[0], cubestate[1], cubestate[20], cubestate[3], cubestate[4], cubestate[23], cubestate[6], cubestate[7], cubestate[26], cubestate[15], cubestate[12], cubestate[9], cubestate[16], cubestate[13], cubestate[10], cubestate[17], cubestate[14], cubestate[11], cubestate[18], cubestate[19], cubestate[29], cubestate[21], cubestate[22], cubestate[32], cubestate[24], cubestate[25], cubestate[35], cubestate[27], cubestate[28], cubestate[51], cubestate[30], cubestate[31], cubestate[48], cubestate[33], cubestate[34], cubestate[45], cubestate[36], cubestate[37], cubestate[38], cubestate[39], cubestate[40], cubestate[41], cubestate[42], cubestate[43], cubestate[44], cubestate[8], cubestate[46], cubestate[47], cubestate[5], cubestate[49], cubestate[50], cubestate[2], cubestate[52], cubestate[53]]
        }

    }

    this.doF = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.cubestate = [cubestate[0], cubestate[1], cubestate[2], cubestate[3], cubestate[4], cubestate[5], cubestate[44], cubestate[41], cubestate[38], cubestate[6], cubestate[10], cubestate[11], cubestate[7], cubestate[13], cubestate[14], cubestate[8], cubestate[16], cubestate[17], cubestate[24], cubestate[21], cubestate[18], cubestate[25], cubestate[22], cubestate[19], cubestate[26], cubestate[23], cubestate[20], cubestate[15], cubestate[12], cubestate[9], cubestate[30], cubestate[31], cubestate[32], cubestate[33], cubestate[34], cubestate[35], cubestate[36], cubestate[37], cubestate[27], cubestate[39], cubestate[40], cubestate[28], cubestate[42], cubestate[43], cubestate[29], cubestate[45], cubestate[46], cubestate[47], cubestate[48], cubestate[49], cubestate[50], cubestate[51], cubestate[52], cubestate[53]];
        }

    }

    this.doD = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.cubestate = [cubestate[0], cubestate[1], cubestate[2], cubestate[3], cubestate[4], cubestate[5], cubestate[6], cubestate[7], cubestate[8], cubestate[9], cubestate[10], cubestate[11], cubestate[12], cubestate[13], cubestate[14], cubestate[24], cubestate[25], cubestate[26], cubestate[18], cubestate[19], cubestate[20], cubestate[21], cubestate[22], cubestate[23], cubestate[42], cubestate[43], cubestate[44], cubestate[33], cubestate[30], cubestate[27], cubestate[34], cubestate[31], cubestate[28], cubestate[35], cubestate[32], cubestate[29], cubestate[36], cubestate[37], cubestate[38], cubestate[39], cubestate[40], cubestate[41], cubestate[51], cubestate[52], cubestate[53], cubestate[45], cubestate[46], cubestate[47], cubestate[48], cubestate[49], cubestate[50], cubestate[15], cubestate[16], cubestate[17]];
        }

    }

    this.doL = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.cubestate = [cubestate[53], cubestate[1], cubestate[2], cubestate[50], cubestate[4], cubestate[5], cubestate[47], cubestate[7], cubestate[8], cubestate[9], cubestate[10], cubestate[11], cubestate[12], cubestate[13], cubestate[14], cubestate[15], cubestate[16], cubestate[17], cubestate[0], cubestate[19], cubestate[20], cubestate[3], cubestate[22], cubestate[23], cubestate[6], cubestate[25], cubestate[26], cubestate[18], cubestate[28], cubestate[29], cubestate[21], cubestate[31], cubestate[32], cubestate[24], cubestate[34], cubestate[35], cubestate[42], cubestate[39], cubestate[36], cubestate[43], cubestate[40], cubestate[37], cubestate[44], cubestate[41], cubestate[38], cubestate[45], cubestate[46], cubestate[33], cubestate[48], cubestate[49], cubestate[30], cubestate[51], cubestate[52], cubestate[27]];
        }

    }

    this.doB = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.cubestate = [cubestate[11], cubestate[14], cubestate[17], cubestate[3], cubestate[4], cubestate[5], cubestate[6], cubestate[7], cubestate[8], cubestate[9], cubestate[10], cubestate[35], cubestate[12], cubestate[13], cubestate[34], cubestate[15], cubestate[16], cubestate[33], cubestate[18], cubestate[19], cubestate[20], cubestate[21], cubestate[22], cubestate[23], cubestate[24], cubestate[25], cubestate[26], cubestate[27], cubestate[28], cubestate[29], cubestate[30], cubestate[31], cubestate[32], cubestate[36], cubestate[39], cubestate[42], cubestate[2], cubestate[37], cubestate[38], cubestate[1], cubestate[40], cubestate[41], cubestate[0], cubestate[43], cubestate[44], cubestate[51], cubestate[48], cubestate[45], cubestate[52], cubestate[49], cubestate[46], cubestate[53], cubestate[50], cubestate[47]];
        }

    }

    this.doE = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.cubestate = [cubestate[0], cubestate[1], cubestate[2], cubestate[3], cubestate[4], cubestate[5], cubestate[6], cubestate[7], cubestate[8], cubestate[9], cubestate[10], cubestate[11], cubestate[21], cubestate[22], cubestate[23], cubestate[15], cubestate[16], cubestate[17], cubestate[18], cubestate[19], cubestate[20], cubestate[39], cubestate[40], cubestate[41], cubestate[24], cubestate[25], cubestate[26], cubestate[27], cubestate[28], cubestate[29], cubestate[30], cubestate[31], cubestate[32], cubestate[33], cubestate[34], cubestate[35], cubestate[36], cubestate[37], cubestate[38], cubestate[48], cubestate[49], cubestate[50], cubestate[42], cubestate[43], cubestate[44], cubestate[45], cubestate[46], cubestate[47], cubestate[12], cubestate[13], cubestate[14], cubestate[51], cubestate[52], cubestate[53]];
        }

    }

    this.doM = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.cubestate = [cubestate[0], cubestate[52], cubestate[2], cubestate[3], cubestate[49], cubestate[5], cubestate[6], cubestate[46], cubestate[8], cubestate[9], cubestate[10], cubestate[11], cubestate[12], cubestate[13], cubestate[14], cubestate[15], cubestate[16], cubestate[17], cubestate[18], cubestate[1], cubestate[20], cubestate[21], cubestate[4], cubestate[23], cubestate[24], cubestate[7], cubestate[26], cubestate[27], cubestate[19], cubestate[29], cubestate[30], cubestate[22], cubestate[32], cubestate[33], cubestate[25], cubestate[35], cubestate[36], cubestate[37], cubestate[38], cubestate[39], cubestate[40], cubestate[41], cubestate[42], cubestate[43], cubestate[44], cubestate[45], cubestate[34], cubestate[47], cubestate[48], cubestate[31], cubestate[50], cubestate[51], cubestate[28], cubestate[53]];
        }

    }

    this.doS = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.cubestate = [cubestate[0], cubestate[1], cubestate[2], cubestate[43], cubestate[40], cubestate[37], cubestate[6], cubestate[7], cubestate[8], cubestate[9], cubestate[3], cubestate[11], cubestate[12], cubestate[4], cubestate[14], cubestate[15], cubestate[5], cubestate[17], cubestate[18], cubestate[19], cubestate[20], cubestate[21], cubestate[22], cubestate[23], cubestate[24], cubestate[25], cubestate[26], cubestate[27], cubestate[28], cubestate[29], cubestate[16], cubestate[13], cubestate[10], cubestate[33], cubestate[34], cubestate[35], cubestate[36], cubestate[30], cubestate[38], cubestate[39], cubestate[31], cubestate[41], cubestate[42], cubestate[32], cubestate[44], cubestate[45], cubestate[46], cubestate[47], cubestate[48], cubestate[49], cubestate[50], cubestate[51], cubestate[52], cubestate[53]];
        }

    }

    this.doX = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.doR(1);
            this.doM(3);
            this.doL(3);
        }
    }

    this.doY = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;

            this.doU(1);
            this.doE(3);
            this.doD(3);
        }
    }

    this.doZ = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;

            this.doF(1);
            this.doS(1);
            this.doB(3);
        }
    }

    this.doUw = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.doE(3);
            this.doU(1);

        }

    }

    this.doRw = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.doM(3);
            this.doR(1);
        }

    }

    this.doFw = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.doS(1);
            this.doF(1);
        }

    }

    this.doDw = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.doE(1);
            this.doD(1);
        }

    }

    this.doLw = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.doM(1);
            this.doL(1);
        }

    }

    this.doBw = function(times) {
        var i;
        for (i = 0; i < times; i++) {
            cubestate = this.cubestate;
            this.doS(3);
            this.doB(1);
        }

    }
}

// Application Logic
var cube = new RubiksCube();
var canvas = document.getElementById("cube-canvas");
var ctx = canvas ? canvas.getContext("2d") : null;
// The virtual cube view is 5 stickers wide and 6 stickers high.
var stickerSize = canvas ? canvas.width / 5 : 60; 

// Colors map (standard wca)
var colors = {
    1: 'white',  // U
    2: 'red',    // R
    3: 'green',  // F
    4: 'yellow', // D
    5: 'orange', // L
    6: 'blue'    // B
};

function fillSticker(x, y, colour) {
    if (!ctx) return;
    ctx.fillStyle = colour;
    // Overlap slightly to prevent sub-pixel gaps showing background
    ctx.fillRect(stickerSize * x, stickerSize * y, stickerSize + 0.5, stickerSize + 0.5);
}

function fillWithIndex(x, y, face, index, cubeArray) {
    // face mapping to offset
    // u=0, r=9, f=18, d=27, l=36, b=45
    // index is 1-based
    var offset = 0;
    switch (face) {
        case "u": offset = 0; break;
        case "r": offset = 9; break;
        case "f": offset = 18; break;
        case "d": offset = 27; break;
        case "l": offset = 36; break;
        case "b": offset = 45; break;
    }
    
    var finalIndex = offset + (index - 1);
    var colorCode = cubeArray[finalIndex];
    var colour = colors[colorCode] || 'grey';
    
    fillSticker(x, y, colour);
}

function drawCube() {
    if (!canvas || !ctx) {
        canvas = document.getElementById("cube-canvas");
        if (canvas) {
            ctx = canvas.getContext("2d");
            stickerSize = canvas.width / 5;
        } else {
            return;
        }
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var cubeArray = cube.cubestate;
    
    // Logic from RubiksCube.js drawCube (3x3 branch)
    // Row 0
    fillWithIndex(0, 0, "l", 1, cubeArray);
    fillWithIndex(1, 0, "u", 1, cubeArray);
    fillWithIndex(2, 0, "u", 2, cubeArray);
    fillWithIndex(3, 0, "u", 3, cubeArray);
    fillWithIndex(4, 0, "r", 3, cubeArray);

    // Row 1
    fillWithIndex(0, 1, "l", 2, cubeArray);
    fillWithIndex(1, 1, "u", 4, cubeArray);
    fillWithIndex(2, 1, "u", 5, cubeArray);
    fillWithIndex(3, 1, "u", 6, cubeArray);
    fillWithIndex(4, 1, "r", 2, cubeArray);

    // Row 2
    fillWithIndex(0, 2, "l", 3, cubeArray);
    fillWithIndex(1, 2, "u", 7, cubeArray);
    fillWithIndex(2, 2, "u", 8, cubeArray);
    fillWithIndex(3, 2, "u", 9, cubeArray);
    fillWithIndex(4, 2, "r", 1, cubeArray);

    // Row 3
    fillWithIndex(0, 3, "l", 3, cubeArray); // Note: original code checks l3 again? 
    // Checking RubiksCube.js line 518: fillWithIndex(0, 3, "l", 3, cubeArray);
    // Yes, it reuses l3 for the corner of the front face view? 
    // Actually visual inspection of 'virtual cube':
    // It seems to be drawing the L strip adjacent to U and F.
    // L face: 1 2 3 (top row), 4 5 6 (middle), 7 8 9 (bottom)
    // Row 0 uses L1. Row 1 uses L2. Row 2 uses L3.
    // Row 3 (start of F face) uses L3 again? That seems to be the mapping in the original file.
    // Let's stick to the original code faithfully.
    
    fillWithIndex(1, 3, "f", 1, cubeArray);
    fillWithIndex(2, 3, "f", 2, cubeArray);
    fillWithIndex(3, 3, "f", 3, cubeArray);
    fillWithIndex(4, 3, "r", 1, cubeArray); // Reuse R1 ??

    // Row 4
    fillWithIndex(0, 4, "l", 6, cubeArray);
    fillWithIndex(1, 4, "f", 4, cubeArray);
    fillWithIndex(2, 4, "f", 5, cubeArray);
    fillWithIndex(3, 4, "f", 6, cubeArray);
    fillWithIndex(4, 4, "r", 4, cubeArray);

    // Row 5
    fillWithIndex(0, 5, "l", 9, cubeArray);
    fillWithIndex(1, 5, "f", 7, cubeArray);
    fillWithIndex(2, 5, "f", 8, cubeArray);
    fillWithIndex(3, 5, "f", 9, cubeArray);
    fillWithIndex(4, 5, "r", 7, cubeArray);
    
    
    // Outline blocks
    // Top block (U face + wings)
    // ctx.strokeRect(-1, -1, 1 + stickerSize * 2, 1 + stickerSize); ??
    // The original code draws complex rectangles.
    // Let's simplify: Draw outline around every sticker.
    // The original code has specific block outlines.
    // Since user wants "exactly like that", I should try to specific block outlines if possible, 
    // but simpler is to outline each sticker first, then maybe thick border around faces.
    
    // Draw outlines
    // Style: Faded but visible
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    
    ctx.beginPath();

    // Vertical Lines: Draw at x=0, 2, 3, 5. Skip 1 and 4 (inner edges of side cols).
    // The grid width is 5 columns wide (0 to 5)
    var vLines = [0, 2, 3, 5];
    vLines.forEach(function(ix) {
        var x = ix * stickerSize;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, stickerSize * 6);
    });

    // Horizontal Lines:
    // Columns are index 0, 1, 2, 3, 4.
    // Middle columns (1, 2, 3) get all horizontal lines y=0..6
    // Side columns (0, 4) get horizontal lines y=0..6 EXCEPT y=3 (merged cell)
    for (var iy = 0; iy <= 6; iy++) {
        var y = iy * stickerSize;
        
        // Col 0 (Left): Draw if not y=3
        if (iy !== 3) {
            ctx.moveTo(0, y);
            ctx.lineTo(stickerSize, y);
        }
        
        // Cols 1, 2, 3 (Middle): Always draw
        ctx.moveTo(stickerSize, y);
        ctx.lineTo(stickerSize * 4, y);
        
        // Col 4 (Right): Draw if not y=3
        if (iy !== 3) {
            ctx.moveTo(stickerSize * 4, y);
            ctx.lineTo(stickerSize * 5, y);
        }
    }
    
    ctx.stroke();
    
    // Border around the whole thing?
    // ctx.strokeRect(0, 0, stickerSize * 5, stickerSize * 6);
}

// History log
var moveHistory = [];
var isRecording = false;

function logMove(move) {
    if (isRecording) {
        moveHistory.push(move);
    }
}

function handleButton(move) {
    cube.doAlgorithm(move);
    logMove(move);
    drawCube();
}

function scramble() {
    // 20 random moves
    var moves = ['U', 'D', 'L', 'R', 'F', 'B', "U'", "D'", "L'", "R'", "F'", "B'", "U2", "D2", "L2", "R2", "F2", "B2"];
    for (var i = 0; i < 20; i++) {
        var r = Math.floor(Math.random() * moves.length);
        var move = moves[r];
        cube.doAlgorithm(move);
        logMove(move);
    }
    drawCube();
}


function optimizeMoves(history) {
    if (history.length === 0) return [];

    // Helper: get rotation amount (X=1, X2=2, X'=3)
    function getAmount(move) {
        if (move.endsWith("2")) return 2;
        if (move.endsWith("'")) return 3;
        return 1;
    }

    // Helper: get base move (R' -> R, R2 -> R, R -> R)
    function getBase(move) {
        if (move.endsWith("2") || move.endsWith("'")) return move.slice(0, -1);
        return move;
    }

    // Helper: reconstruction
    function getMoveString(base, amount) {
        amount = amount % 4;
        if (amount === 0) return null; // Cancels out
        if (amount === 1) return base;
        if (amount === 2) return base + "2";
        if (amount === 3) return base + "'";
        return null; // Should not happen given logic, but safe fallback
    }

    let simplified = [];
    
    for (let move of history) {
        if (simplified.length === 0) {
            simplified.push(move);
            continue;
        }

        let lastMove = simplified[simplified.length - 1];
        let lastBase = getBase(lastMove);
        let currBase = getBase(move);

        if (lastBase === currBase) {
            let newAmount = getAmount(lastMove) + getAmount(move);
            let newMove = getMoveString(lastBase, newAmount);
            
            // Remove the last move from list as we are merging
            simplified.pop();
            
            // If the combined move is valid (not cancelled out), push it back
            if (newMove) {
                simplified.push(newMove);
            }
        } else {
            simplified.push(move);
        }
    }
    
    return simplified;
}

function updateHistoryView() {
    var list = document.getElementById("move-history-list");
    if (!list) return;
    list.innerHTML = "";
    
    if (moveHistory.length === 0) {
        list.textContent = "(No moves yet)";
        return;
    }
    
    // Optimize the display of moves
    var optimizedHistory = optimizeMoves(moveHistory);
    
    if (optimizedHistory.length === 0) {
        list.textContent = "(Moves canceled out)";
        return;
    }

    // Join with spaces
    var text = optimizedHistory.join(" ");
    list.textContent = text;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    var c = document.getElementById("cube-canvas");
    var container = document.querySelector('.cube-container');
    
    function resizeAndDraw() {
        if(!c || !container) return;
        
        // Calculate available space
        var headerHeight = document.querySelector('header').offsetHeight;
        var controlsHeight = document.querySelector('.controls-grid').offsetHeight;
        var availableHeight = window.innerHeight - headerHeight - controlsHeight - 40; // 40px padding/margin buffer
        var availableWidth = window.innerWidth * 0.70;
        
        // Desired Aspect Ratio: 5 width : 6 height
        // w / h = 5 / 6  => w = 5/6 * h
        
        // 1. Try limiting by width first
        var newWidth = Math.min(availableWidth, 260); // Max width 260px
        var newHeight = newWidth * (6/5);
        
        // 2. If height is too big, limit by height
        if (newHeight > availableHeight) {
            newHeight = availableHeight;
            newWidth = newHeight * (5/6);
        }
        
        // Update canvas size
        c.width = Math.floor(newWidth);
        c.height = Math.floor(newHeight);
        stickerSize = c.width / 5;
        
        drawCube();
    }

    // Initial draw
    resizeAndDraw();
    
    // Resize listener
    window.addEventListener('resize', function() {
        resizeAndDraw();
    });
    
    // Scramble button
    var scrambleBtn = document.getElementById("scramble-btn");
    if (scrambleBtn) {
        scrambleBtn.addEventListener('click', scramble);
    }

    // Solve button
    var solveBtn = document.getElementById("solve-btn");
    if (solveBtn) {
        solveBtn.addEventListener('click', function() {
            cube.resetCube();
            moveHistory = []; // Clear history
            drawCube();
        });
    }

    // Solution button
    var solutionBtn = document.getElementById("solution-btn");
    var modal = document.getElementById("solution-modal");
    var closeBtn = document.getElementById("close-modal");

    if (solutionBtn && modal) {
        solutionBtn.addEventListener('click', function() {
            updateHistoryView();
            modal.style.display = "flex";
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });
    }
    
    // Close modal if clicked outside content
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    // Copy button logic
    var copyBtn = document.getElementById("copy-btn");
    var historyList = document.getElementById("move-history-list");
    if (copyBtn && historyList) {
        copyBtn.addEventListener("click", function() {
            var text = historyList.textContent;
            if (text && text !== "(No moves yet)" && text !== "(Moves canceled out)") {
                navigator.clipboard.writeText(text).then(function() {
                    var original = copyBtn.textContent;
                    copyBtn.textContent = "✅";
                    setTimeout(function() {
                        copyBtn.textContent = original;
                    }, 1000);
                });
            }
        });
    }

    // Record button
    var recordBtn = document.getElementById("record-btn");
    if (recordBtn) {
        recordBtn.addEventListener('click', function() {
            isRecording = !isRecording;
            if (isRecording) {
                recordBtn.classList.add("recording");
            } else {
                recordBtn.classList.remove("recording");
            }
        });
    }

    // Grid buttons
    var buttons = document.querySelectorAll(".grid-btn");
    buttons.forEach(function(btn) {
        // Use touchstart for faster response on mobile, fallback to click
        // But preventing default on touchstart prevents ghost clicks usually
        var handled = false;
        
        var action = function(e) {
            if(e.type === 'touchstart') handled = true;
            if(e.type === 'click' && handled) return;
            
            e.preventDefault(); // Prevent double tap zoom etc
            var move = btn.getAttribute("data-move");
            if (move) {
                handleButton(move);
            }
        };

        btn.addEventListener('touchstart', action, {passive: false});
        btn.addEventListener('click', action);
    });
});
