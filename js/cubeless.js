
/**
 * RubiksCube: A wrapper around js/cube.js and js/solve.js
 * Decouples logic from the UI.
 */


// Configuration for Cube appearance (Colors, Outline, etc.)
var CUBE_CONFIG = {
    colors: {
        1: 'rgb(255, 255, 255)',    // U (White)
        2: 'rgb(255, 51, 51)',      // R (Red)
        3: 'rgb(17, 238, 17)',      // F (Green)
        4: 'rgb(255, 255, 0)',      // D (Yellow)
        5: 'rgba(248, 136, 38, 1)', // L (Orange)
        6: 'rgb(17, 119, 221)'      // B (Blue)
    },
    outline: {
        width: 1,
        color: "rgba(0, 0, 0, 0.6)"
    }
};

function RubiksCube() {
    // Initialize library cube
    if (typeof Cube === 'function') {
        this.cube = new Cube();
        // Ensure solver tables are computed if not already
        if (Cube.moveTables && !Cube.moveTables.twist) {
            Cube.initSolver();
        }
    } else {
        console.error("Cube library not found! Please ensure cube.js and solve.js are loaded.");
        // Mock fallback to prevent crashes
        this.cube = {
            asString: function() { return "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"; },
            move: function() {},
            identity: function() {},
            isSolved: function() { return true; },
            solve: function() { return ""; },
            upright: function() { return ""; }
        };
    }

    // Map internal string state to UI integer array (1:U, 2:R, 3:F, 4:D, 5:L, 6:B)
    Object.defineProperty(this, 'cubestate', {
        get: function() {
            var map = { 'U': 1, 'R': 2, 'F': 3, 'D': 4, 'L': 5, 'B': 6 };
            var str = this.cube.asString();
            var arr = [];
            for (var i = 0; i < str.length; i++) {
                arr.push(map[str[i]] || 0);
            }
            return arr;
        }
    });

    this.resetCube = function(){
        this.cube.identity();
    }

    this.solution = function(){
        return this.cube.solve() || "";
    }

    this.isSolved = function(){
        return this.cube.isSolved();
    }

    this.wcaOrient = function() {
        var moves = this.cube.upright();
        if (moves) {
            this.cube.move(moves);
        }
        return moves;
    }

    this.toString = function(){
        return this.cube.asString();
    }

    this.doAlgorithm = function(alg) {
        if (!alg) return;

        // Parse moves from string (e.g. "R U2 R'")
        var myRegexp = /([RUFBLDrufbldxyzEMS])(\d*)('?)/g;
        var match;
        
        while ((match = myRegexp.exec(alg)) !== null) {
            var side = match[1];
            var times = 1;
            
            if (match[2] !== "") {
                times = parseInt(match[2]) % 4;
            }
            if (match[3] === "'") {
                times = (4 - times) % 4;
            }
            
            if (times === 0) continue;

            var suffix = "";
            if (times === 2) suffix = "2";
            if (times === 3) suffix = "'";
            
            this.cube.move(side + suffix);
        }
    }
}

// Application Logic
var cube = new RubiksCube();
var canvas = document.getElementById("cube-canvas");
var ctx = canvas ? canvas.getContext("2d") : null;
// The virtual cube view is 5 stickers wide and 6 stickers high.
var stickerSize = canvas ? canvas.width / 5 : 60; 

// Colors map (moved to CUBE_CONFIG at top)

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
    var colour = CUBE_CONFIG.colors[colorCode] || 'grey';
    
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
    fillWithIndex(0, 3, "l", 3, cubeArray);
    fillWithIndex(1, 3, "f", 1, cubeArray);
    fillWithIndex(2, 3, "f", 2, cubeArray);
    fillWithIndex(3, 3, "f", 3, cubeArray);
    fillWithIndex(4, 3, "r", 1, cubeArray);

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
    
    
    // Draw outlines
    ctx.lineWidth = CUBE_CONFIG.outline.width;
    ctx.strokeStyle = CUBE_CONFIG.outline.color;
    
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
        
        // Find the currently visible controls grid to get accurate height
        var controlsHeight = 0;
        var grids = document.querySelectorAll('.controls-grid');
        for (var i = 0; i < grids.length; i++) {
            if (grids[i].offsetHeight > 0) {
                controlsHeight = grids[i].offsetHeight;
                break;
            }
        }
        var availableHeight = window.innerHeight - headerHeight - controlsHeight - 40; // 40px padding/margin buffer
        var availableWidth = window.innerWidth * 0.70;
        
        // Desired Aspect Ratio: 5 width : 6 height
        // w / h = 5 / 6  => w = 5/6 * h
        
        // 1. Try limiting by width first
        var newWidth = Math.min(availableWidth, 260); 
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
        // Handle touch and click to prevent ghosts
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

    // Layout Switch Button
    var layoutBtn = document.getElementById("layout-btn");
    var layoutMain = document.getElementById("layout-main");
    var layoutExtra = document.getElementById("layout-extra");
    
    // Check if user has a preference stored (optional, but good UX)
    // For now, default to main. 
    
    if (layoutBtn && layoutMain && layoutExtra) {
        layoutBtn.addEventListener('click', function() {
            if (layoutMain.style.display !== "none") {
                // Switch to extra
                layoutMain.style.display = "none";
                layoutExtra.style.display = "grid";
            } else {
                // Switch to main
                layoutMain.style.display = "grid";
                layoutExtra.style.display = "none";
            }
            // Trigger resize to be safe, though grids should be same size
            resizeAndDraw();
        });
    }
});
