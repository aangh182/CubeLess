
/**
 * RubiksCube: A wrapper around js/cube.js and js/solve.js
 * Decouples logic from the UI.
 */


// Configuration for Cube appearance (Colors, Outline, etc.)
var CUBE_CONFIG = {
    colors: {
        1: '#ffffff',    // U (White)
        2: '#ff3333',      // R (Red)
        3: '#11ee11',      // F (Green)
        4: '#ffff00',      // D (Yellow)
        5: '#f88826', // L (Orange)
        6: '#1177dd'      // B (Blue)
    },
    outline: {
        width: 1,
        color: "#080a0b"
    },
    settings: {
        cancelSolution: true,
        manualScramble: false
    }
};

// Keyboard Layouts
var KEYBOARD_LAYOUTS = {
    "advanced": {
        "1": "S'", "5": "M", "6": "M", "0": "S",
        "q": "z'", "w": "B", "e": "L'", "r": "Lw'", "t": "x", "y": "x", "u": "Rw", "i": "R", "o": "B'", "p": "z",
        "a": "y'", "s": "D", "d": "L", "f": "U'", "g": "F'", "h": "F", "j": "U", "k": "R'", "l": "D'", ";": "y",
        "z": "Dw", "x": "M'", "c": "Uw'", "v": "Lw", "b": "x'", "n": "x'", "m": "Rw'", ",": "Uw", ".": "M'", "/": "Dw'"
    }
};
var currentKeyboardLayout = "advanced";

// Persistence Logic
function loadSettings() {
    try {
        var saved = localStorage.getItem('cubeless_settings');
        if (saved) {
            var parsed = JSON.parse(saved);
            if (parsed.settings) {
                 for (var key in parsed.settings) {
                     CUBE_CONFIG.settings[key] = parsed.settings[key];
                 }
            }
        }
    } catch (e) {}
}

function saveSettings() {
    try {
        localStorage.setItem('cubeless_settings', JSON.stringify({
            settings: CUBE_CONFIG.settings
        }));
    } catch (e) {}
}

// Load immediately on startup
loadSettings();

function RubiksCube() {
    // Initialize library cube
    if (typeof Cube === 'function') {
        this.cube = new Cube();
        // Ensure solver tables are computed if not already
        if (Cube.moveTables && !Cube.moveTables.twist) {
            Cube.initSolver();
        }
    } else {
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



function drawPolygon(ctx, color, parts, trans) {
    var scale = trans[0];
    var dx = trans[1];
    var dy = trans[2];
    ctx.fillStyle = color;
    
    // Maintain outline style as requested previously (not present in Sample but necessary for visibility)
    ctx.lineWidth = CUBE_CONFIG.outline.width;
    ctx.strokeStyle = CUBE_CONFIG.outline.color;
    ctx.lineJoin = "round";

    ctx.beginPath();
    var len = parts[0].length;
    for (var i = 0; i < len; i++) {
        var x = (parts[0][i] + dx) * scale;
        var y = (parts[1][i] + dy) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    if (CUBE_CONFIG.outline.width > 0) {
        ctx.stroke();
    }
}

function renderQCube(ctx, width, posit, colors) {
    var size = 3; 
    var gap = Math.sqrt(size / 3) * 0.1; // = 0.1 for size 3
    
    // Logic from Sample/qcubennn.js renderQCube
    for (var i = 0; i < size; i++) {
        var ii = size - 1 - i;
        var piece = [[0, 0, 1, 1], [i, i + 1, i + 1, i]];
        
        // L and R Faces (Strips)
        if (i != 0) {
             // L Face (Face 1) - Col 0 (Left-most column in internal representation)
            drawPolygon(ctx, colors[posit[(1 * size + i) * size + 0]], piece, [width, gap, size + gap * 2]);
             // R Face (Face 4) - Col 0
            drawPolygon(ctx, colors[posit[(4 * size + i) * size + 0]], piece, [width, size + 1 + gap * 3, size + gap * 2]);
        }
        
        // Top Edge details (Connecting L/R to U)
        if (i != size - 1) {
            // L Face Top Detail
            drawPolygon(ctx, colors[posit[(1 * size + 0) * size + ii]], piece, [width, gap + 0, gap + 0]);
            // R Face Top Detail
            drawPolygon(ctx, colors[posit[(4 * size + 0) * size + ii]], piece, [width, gap + size + 1 + gap * 2, gap]);
        }
        
        for (var j = 0; j < size; j++) {
            var pieceInner = [[i, i, i + 1, i + 1], [j, j + 1, j + 1, j]];
            // U (Face 3)
            drawPolygon(ctx, colors[posit[(3 * size + j) * size + i]], pieceInner, [width, 1 + gap * 2, gap]);
            // F (Face 5)
            drawPolygon(ctx, colors[posit[(5 * size + j) * size + i]], pieceInner, [width, 1 + gap * 2, size + gap * 2]);
        }
    }
    
    // Extra polygons for Side Depth (L Face Side and R Face Side depth)
    var piece2 = [[0, 0, 1, 1], [0, 2 + gap, 2 + gap, 0]];
    // L Face Corner Depth
    drawPolygon(ctx, colors[posit[(1 * size + 0) * size + 0]], piece2, [width, gap, gap + size - 1]);
    // R Face Corner Depth
    drawPolygon(ctx, colors[posit[(4 * size + 0) * size + 0]], piece2, [width, size + 1 + gap * 3, gap + size - 1]);
    
    // Verify White corner highlights from sample if size > 5 (omitted as size=3)
}


function drawCube() {
    if (!canvas || !ctx) {
        canvas = document.getElementById("cube-canvas");
        if (canvas) {
            ctx = canvas.getContext("2d");
        } else {
            return;
        }
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var cubeArray = cube.cubestate; // 1..6 array [54]
    
    // posit array as expected by renderQCube
    // 0:D, 1:L, 2:B, 3:U, 4:R, 5:F
    var posit = new Array(54);
    
    // Helper to copy
    function copy(src, dst) { posit[dst] = cubeArray[src]; }
    
    // U (0-8) -> 3 (Standard)
    for(var i=0; i<9; i++) copy(0+i, 27+i);
    
    // R (9-17) -> 4 (Standard)
    for(var i=0; i<9; i++) copy(9+i, 36+i);
    
    // F (18-26) -> 5 (Standard)
    for(var i=0; i<9; i++) copy(18+i, 45+i);
    
    // D (27-35) -> 0 (Standard)
    for(var i=0; i<9; i++) copy(27+i, 0+i);

    // L (36-44) -> 1 (MIRRORED Horizontally for qcube projection)
    // Standard L: 0 1 2 / 3 4 5 / 6 7 8
    // Target L:   2 1 0 / 5 4 3 / 8 7 6
    // Row 0
    copy(36+0, 9+2); copy(36+1, 9+1); copy(36+2, 9+0);
    // Row 1
    copy(36+3, 9+5); copy(36+4, 9+4); copy(36+5, 9+3);
    // Row 2
    copy(36+6, 9+8); copy(36+7, 9+7); copy(36+8, 9+6);
    
    // B (45-53) -> 2 (Standard - not shown in this view but good to have)
    for(var i=0; i<9; i++) copy(45+i, 18+i);


    // Color Palette
    var palette = [
        null, 
        CUBE_CONFIG.colors[1], // 1: U
        CUBE_CONFIG.colors[2], // 2: R
        CUBE_CONFIG.colors[3], // 3: F
        CUBE_CONFIG.colors[4], // 4: D
        CUBE_CONFIG.colors[5], // 5: L
        CUBE_CONFIG.colors[6]  // 6: B
    ];

    // Scaling Logic
    var size = 3;
    var gap = 0.1;
    var wUnits = size + 2 + gap * 4;
    var hUnits = size * 2 + gap * 3;
    
    // Add some padding to units to avoid edge clipping
    var padding = 0.2;
    var scale = Math.min(canvas.width / (wUnits + padding), canvas.height / (hUnits + padding));
    
    var offsetX = (canvas.width - wUnits * scale) / 2;
    var offsetY = (canvas.height - hUnits * scale) / 2;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    renderQCube(ctx, scale, posit, palette);
    ctx.restore();

    var status = document.getElementById("cube-status");
    if (status) {
        status.textContent = cube.isSolved() ? "Cube is solved." : "Cube state updated.";
    }
}

// History log
var moveHistory = [];
var currentScramble = "";
var isRecording = false;
var isShowingInverse = false;

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
    var scrambleSeq = [];
    for (var i = 0; i < 20; i++) {
        var r = Math.floor(Math.random() * moves.length);
        scrambleSeq.push(moves[r]);
    }
    
    var scrambleStr = scrambleSeq.join(" ");
    cube.doAlgorithm(scrambleStr);
    
    // Store scramble separate from user history
    currentScramble = scrambleStr;
    moveHistory = []; // Reset user moves
    drawCube();
}


function optimizeMoves(history) {
    if (history.length === 0) return [];
    
    // Check if optimization is disabled by user setting
    if (!CUBE_CONFIG.settings.cancelSolution) {
        return history;
    }

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
    var copyStatus = document.getElementById("copy-status");
    
    // Reset count display immediately
    var countSpan = document.getElementById("solution-count");
    if (countSpan) countSpan.textContent = "";
    if (copyStatus) copyStatus.textContent = "";

    if (!list) return;
    list.replaceChildren();
    list.classList.remove("copyable", "copied");
    list.setAttribute("aria-disabled", "true");
    list.setAttribute("aria-label", "No moves to copy");
    list.setAttribute("tabindex", "-1");
    
    var optimizedHistory = optimizeMoves(moveHistory);
    var movesToDisplay = optimizedHistory; // Default to normal history

    if (isShowingInverse) {
        // Calculate inverse: reverse order, then invert each move
        var inverted = optimizedHistory.slice().reverse().map(function(move) {
             if (move.endsWith("2")) return move; // R2' is same as R2
             if (move.endsWith("'")) return move.slice(0, -1); // R' -> R
             return move + "'"; // R -> R'
        });
        
        if (inverted.length === 0) {
            // If inverse is empty (maybe no moves), revert to normal view implicitly or show empty
            // But user asked "if no moves, keep original text". 
            // If there are truly no moves, optimizedHistory is also empty.
             movesToDisplay = [];
        } else {
            movesToDisplay = inverted;
        }
    } else {
        // Normal View: Show scramble if exists
        if (currentScramble) {
            var scrambleText = document.createElement("div");
            scrambleText.className = "scramble-text";
            scrambleText.textContent = "// " + currentScramble;
            list.appendChild(scrambleText);
        }
    }
    
    if (movesToDisplay.length > 0) {
        var movesSpan = document.createElement("span");
        movesSpan.textContent = movesToDisplay.join(" ");
        list.appendChild(movesSpan);
    } else if (!currentScramble && !isShowingInverse) {
        list.textContent = "No moves recorded yet.";
    } else if (isShowingInverse && movesToDisplay.length === 0 && optimizedHistory.length > 0) {
         // Should not happen if optimizedHistory > 0, but safe handling
         list.textContent = "There are no inverse moves to show.";
    }

    // Calculate Move Count (Exclude rotations x, y, z)
    var count = movesToDisplay.filter(function(m) {
        return !/^[xyz]/.test(m);
    }).length;

    if (countSpan) {
        countSpan.textContent = " (" + count + ")";
    }

    if (movesToDisplay.length > 0) {
        list.classList.add("copyable");
        list.removeAttribute("aria-disabled");
        list.setAttribute("aria-label", "Copy displayed moves");
        list.setAttribute("tabindex", "0");
    }

    var inverseButton = document.getElementById("inverse-btn");
    if (inverseButton) {
        var inverseLabel = isShowingInverse ? "Show original moves" : "Show inverse moves";
        inverseButton.title = inverseLabel;
        inverseButton.setAttribute("aria-label", inverseLabel);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    var c = document.getElementById("cube-canvas");
    var container = document.querySelector('.cube-container');
    var header = document.querySelector('header');
    var controlGrids = document.querySelectorAll('.controls-grid');
    var resizeFrame = null;
    var activeModal = null;
    var lastFocusedBeforeModal = null;
    var focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function getFocusableElements(root) {
        return Array.prototype.slice.call(root.querySelectorAll(focusableSelector))
            .filter(function(el) {
                return el.offsetParent !== null || el === document.activeElement;
            });
    }

    function openModal(modalElement) {
        if (!modalElement) return;
        var opener = document.activeElement;
        closeMenu();
        if (sideMenu && sideMenu.contains(opener) && appMenuBtn) {
            lastFocusedBeforeModal = appMenuBtn;
        } else {
            lastFocusedBeforeModal = opener;
        }
        activeModal = modalElement;
        modalElement.style.display = "flex";
        modalElement.setAttribute("aria-hidden", "false");

        var focusable = getFocusableElements(modalElement);
        if (focusable.length > 0) {
            focusable[0].focus();
        } else {
            modalElement.setAttribute("tabindex", "-1");
            modalElement.focus();
        }
    }

    function closeModal(modalElement) {
        if (!modalElement) return;
        modalElement.style.display = "none";
        modalElement.setAttribute("aria-hidden", "true");
        if (activeModal === modalElement) {
            activeModal = null;
        }
        if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
            lastFocusedBeforeModal.focus();
        }
    }

    function trapModalFocus(event) {
        if (!activeModal || event.key !== "Tab") return;
        var focusable = getFocusableElements(activeModal);
        if (focusable.length === 0) {
            event.preventDefault();
            return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function handleGlobalKeys(event) {
        if (event.key === "Escape") {
            if (activeModal) {
                closeModal(activeModal);
                return;
            }
            closeMenu();
        }
        trapModalFocus(event);
    }

    document.addEventListener('keydown', handleGlobalKeys);
    window.addEventListener('click', function(event) {
        if (activeModal && event.target === activeModal) {
            closeModal(activeModal);
        }
    });
    
    function resizeAndDraw(forceDraw) {
        if(!c || !container) return;

        var viewport = window.visualViewport ? {
            width: window.visualViewport.width,
            height: window.visualViewport.height
        } : {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        var headerHeight = header ? header.getBoundingClientRect().height : 0;
        
        // Find the currently visible controls grid to get accurate height
        var controlsHeight = 0;
        for (var i = 0; i < controlGrids.length; i++) {
            var gridRect = controlGrids[i].getBoundingClientRect();
            if (gridRect.height > 0) {
                controlsHeight = gridRect.height;
                break;
            }
        }
        var isShortLandscape = viewport.width > viewport.height && viewport.height <= 520;
        var verticalBuffer = isShortLandscape ? 12 : 28;
        var availableHeight = Math.max(96, viewport.height - headerHeight - controlsHeight - verticalBuffer);
        var maxCanvasWidth = viewport.width >= 1024 ? 360 : (viewport.width >= 768 ? 320 : 280);
        var widthRatio = isShortLandscape ? 0.50 : 0.78;
        var availableWidth = Math.max(96, Math.min(viewport.width * widthRatio, maxCanvasWidth));
        
        // Desired Aspect Ratio: 5 width : 6 height
        // w / h = 5 / 6  => w = 5/6 * h
        
        // 1. Try limiting by width first
        var newWidth = availableWidth;
        var newHeight = newWidth * (6/5);
        
        // 2. If height is too big, limit by height
        if (newHeight > availableHeight) {
            newHeight = availableHeight;
            newWidth = newHeight * (5/6);
        }

        var minCanvasHeight = Math.min(isShortLandscape ? 96 : 116, availableHeight);
        if (newHeight < minCanvasHeight) {
            newHeight = minCanvasHeight;
            newWidth = newHeight * (5/6);
        }
        newWidth = Math.max(80, newWidth);
        
        var nextWidth = Math.floor(newWidth);
        var nextHeight = Math.floor(newHeight);
        if (!forceDraw && c.width === nextWidth && c.height === nextHeight) {
            return;
        }

        c.width = nextWidth;
        c.height = nextHeight;
        stickerSize = c.width / 5;
        
        drawCube();
    }

    function scheduleResizeAndDraw() {
        if (resizeFrame !== null) return;
        resizeFrame = requestAnimationFrame(function() {
            resizeFrame = null;
            resizeAndDraw(false);
        });
    }

    // Initial draw
    resizeAndDraw(true);
    
    // Resize listener
    window.addEventListener('resize', function() {
        scheduleResizeAndDraw();
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function() {
            scheduleResizeAndDraw();
        });
    }
    
    // Scramble button
    var scrambleBtn = document.getElementById("scramble-btn");
    if (scrambleBtn) {
        scrambleBtn.addEventListener('click', function() {
            if (CUBE_CONFIG.settings.manualScramble) {
                openManualScramble();
            } else {
                scramble();
            }
        });
    }

    // Solve button
    var solveBtn = document.getElementById("solve-btn");
    if (solveBtn) {
        solveBtn.addEventListener('click', function() {
            cube.resetCube();
            moveHistory = []; // Clear history
            currentScramble = ""; // Clear scramble
            drawCube();
        });
    }

    // Solution button
    var solutionBtn = document.getElementById("solution-btn");
    var modal = document.getElementById("solution-modal");
    var closeBtn = document.getElementById("close-modal");

    if (solutionBtn && modal) {
        solutionBtn.addEventListener('click', function() {
            isShowingInverse = false; // Always start with normal view
            updateHistoryView();
            openModal(modal);
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            closeModal(modal);
        });
    }
    
    // Inverse button logic
    var inverseBtn = document.getElementById("inverse-btn");
    var historyList = document.getElementById("move-history-list");

    if (inverseBtn && historyList) {
        inverseBtn.addEventListener("click", function() {
            // Toggle state
            var wasInverse = isShowingInverse;
            isShowingInverse = !isShowingInverse;
            
            // Check if there is anything to invert
            var optimized = optimizeMoves(moveHistory);
            if (optimized.length === 0) {
                 // No moves, revert state and do nothing (as per previous request "no moves -> keep")
                 isShowingInverse = wasInverse;
                 return;
            }

            updateHistoryView();
        });
    }
    
    // Move Text Copy Logic
    var copyableHistoryList = document.getElementById("move-history-list");
    var copyStatus = document.getElementById("copy-status");
    function setCopyStatus(message) {
        if (copyStatus) {
            copyStatus.textContent = message;
        }
    }

    function copyDisplayedMoves() {
        var list = document.getElementById("move-history-list");
        if (!list) return;

        // Extract text from the span (this contains just the moves, not the scramble div)
        var textToCopy = "";
        var movesSpan = list.querySelector("span");
        if (movesSpan) {
            textToCopy = movesSpan.textContent;
        }

        if (!textToCopy) {
            setCopyStatus("No moves to copy yet.");
            return;
        }

        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            setCopyStatus("Copy is not available in this browser. Select the moves and copy them manually.");
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(function() {
            list.classList.add("copied");
            setCopyStatus("Moves copied.");

            setTimeout(function() {
                list.classList.remove("copied");
                setCopyStatus("");
            }, 1200);
        }).catch(function() {
            setCopyStatus("Copy failed. Select the moves and copy them manually.");
        });
    }

    if (copyableHistoryList) {
        copyableHistoryList.addEventListener("click", copyDisplayedMoves);
        copyableHistoryList.addEventListener("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                copyDisplayedMoves();
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
            scheduleResizeAndDraw();
        });
    }

    // Side Menu Logic
    var appMenuBtn = document.getElementById('app-menu-btn');
    var sideMenu = document.getElementById('side-menu');
    var menuOverlay = document.getElementById('menu-overlay');

    function toggleMenu() {
        if (!sideMenu || !menuOverlay) return;
        
        var isOpen = sideMenu.classList.contains('open');
        if (isOpen) {
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('open');
            sideMenu.setAttribute('aria-hidden', 'true');
            if (appMenuBtn) appMenuBtn.setAttribute('aria-expanded', 'false');
        } else {
            sideMenu.classList.add('open');
            menuOverlay.classList.add('open');
            sideMenu.setAttribute('aria-hidden', 'false');
            if (appMenuBtn) appMenuBtn.setAttribute('aria-expanded', 'true');
            var firstMenuItem = sideMenu.querySelector('.menu-item');
            if (firstMenuItem) firstMenuItem.focus();
        }
    }

    function closeMenu() {
        if (!sideMenu || !menuOverlay) return;
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
        sideMenu.setAttribute('aria-hidden', 'true');
        if (appMenuBtn) appMenuBtn.setAttribute('aria-expanded', 'false');
    }

    if (appMenuBtn) {
        appMenuBtn.addEventListener('click', toggleMenu);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
    
    // Optional: Close menu when items are clicked (for now)
    var menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(function(item) {
        item.addEventListener('click', function() {
            var id = item.id;
            // Delay closing menu for visual feedback
            setTimeout(closeMenu, 150);
            
            if (id === 'menu-settings') {
                openSettings();
            } else if (id === 'menu-about') {
                openAbout();
            }
        });
    });

    // =========================================
    // About Modal Logic
    // =========================================
    var aboutModal = document.getElementById("about-modal");
    var closeAboutBtn = document.getElementById("close-about");

    function openAbout() {
        if (!aboutModal) return;
        openModal(aboutModal);
    }

    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', function() {
            closeModal(aboutModal);
        });
    }

    // Easter Egg: Spin image on click
    var aboutImage = document.querySelector(".about-image");
    if (aboutImage) {
        aboutImage.addEventListener("click", function() {
            aboutImage.classList.toggle("spin-infinite");
        });
    }

    // =========================================
    // Settings Modal Logic
    // =========================================
    var settingsModal = document.getElementById("settings-modal");
    var closeSettingsBtn = document.getElementById("close-settings");

    function openSettings() {
        if (!settingsModal) return;
        
        // Sync UI with current config
        document.getElementById('setting-cancel-solution').checked = CUBE_CONFIG.settings.cancelSolution;
        document.getElementById('setting-manual-scramble').checked = CUBE_CONFIG.settings.manualScramble;
        
        openModal(settingsModal);
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', function() {
            closeModal(settingsModal);
        });
    }

    // Settings Toggle Listeners
    var toggleCancel = document.getElementById('setting-cancel-solution');
    if (toggleCancel) {
        toggleCancel.addEventListener('change', function(e) {
            CUBE_CONFIG.settings.cancelSolution = e.target.checked;
            saveSettings();
        });
    }

    var toggleManual = document.getElementById('setting-manual-scramble');
    if (toggleManual) {
        toggleManual.addEventListener('change', function(e) {
            CUBE_CONFIG.settings.manualScramble = e.target.checked;
            saveSettings();
        });
    }

    // =========================================
    // Manual Scramble Logic
    // =========================================
    var manualModal = document.getElementById("manual-scramble-modal");
    var closeManualBtn = document.getElementById("close-manual-scramble");
    var manualInput = document.getElementById("manual-scramble-input");
    var manualConfirm = document.getElementById("manual-scramble-confirm");
    var manualError = document.getElementById("manual-scramble-error");

    function clearManualScrambleError() {
        if (manualError) {
            manualError.textContent = "";
        }
        if (manualInput) {
            manualInput.removeAttribute("aria-invalid");
        }
    }

    function setManualScrambleError(message) {
        if (manualError) {
            manualError.textContent = message;
        }
        if (manualInput) {
            manualInput.setAttribute("aria-invalid", "true");
            manualInput.focus();
        }
    }

    function parseManualScramble(input) {
        var trimmed = input.trim();
        if (!trimmed) {
            return { error: "Enter at least one move." };
        }

        var tokens = trimmed.split(/\s+/);
        if (tokens.length > 80) {
            return { error: "Use 80 moves or fewer." };
        }

        var validMove = /^[RUFBLDrufbldxyzEMS](2|')?$/;
        for (var i = 0; i < tokens.length; i++) {
            if (!validMove.test(tokens[i])) {
                return { error: "Invalid move: " + tokens[i] };
            }
        }

        return { moves: tokens };
    }

    function openManualScramble() {
        if (!manualModal) return;
        manualInput.value = "";
        clearManualScrambleError();
        openModal(manualModal);
        setTimeout(function() { manualInput.focus(); }, 100);
    }
    
    if (closeManualBtn) {
        closeManualBtn.addEventListener('click', function() {
            closeModal(manualModal);
        });
    }

    if (manualConfirm) {
        manualConfirm.addEventListener('click', function() {
            var result = parseManualScramble(manualInput.value);
            if (result.error) {
                setManualScrambleError(result.error);
                return;
            }

            var moves = result.moves.join(" ");
            try {
                cube.doAlgorithm(moves);
                currentScramble = moves;
                moveHistory = []; // Reset user moves for new scramble
                clearManualScrambleError();
                closeModal(manualModal);
                drawCube();
            } catch (e) {
                setManualScrambleError("That scramble could not be applied.");
            }
        });
    }

    if (manualInput) {
        manualInput.addEventListener('input', clearManualScrambleError);
        manualInput.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                if (manualConfirm) manualConfirm.click();
            }
        });
    }

    // Hook up Scramble Button to check setting
    if (scrambleBtn) {
        // Remove old listener if possible (not easily done without reference), 
        // but since we are replacing the logic or it was defined in HTML originally (no, it was in JS),
        // we can just add a new listener. 
        // Actually, looking at previous lines (lines 500+), the listener IS added.
        // We don't need to do anything here for scramble button as it WAS handled in line 501.
    }

    // Keyboard Support
    document.addEventListener('keydown', function(event) {
        if (activeModal) return;
        // Ignore if typing in an input
        if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
        
        var char = event.key.toLowerCase();
        // Handle special case for punctuation if needed, but standard keys usually work fine
        
        var layout = KEYBOARD_LAYOUTS[currentKeyboardLayout];
        
        if (layout && layout[char]) {
            event.preventDefault(); 
            handleButton(layout[char]);
        }
    });
});
