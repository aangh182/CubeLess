
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
        color: "#000000"
    },
    settings: {
        cancelSolution: true,
        manualScramble: false
    }
};

// Persistence Logic
function loadSettings() {
    try {
        var saved = localStorage.getItem('cubeless_settings');
        if (saved) {
            var parsed = JSON.parse(saved);
            if (parsed.colors) {
                 for (var key in parsed.colors) {
                     CUBE_CONFIG.colors[key] = parsed.colors[key];
                 }
            }
            if (parsed.settings) {
                 for (var key in parsed.settings) {
                     CUBE_CONFIG.settings[key] = parsed.settings[key];
                 }
            }
        }
    } catch (e) {
        console.error("Error loading settings:", e);
    }
}

function saveSettings() {
    try {
        localStorage.setItem('cubeless_settings', JSON.stringify({
            colors: CUBE_CONFIG.colors,
            settings: CUBE_CONFIG.settings
        }));
    } catch (e) {
        console.error("Error saving settings:", e);
    }
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
}

// History log
var moveHistory = [];
var currentScramble = "";
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
    
    // Reset count display immediately
    var countSpan = document.getElementById("solution-count");
    if (countSpan) countSpan.textContent = "";

    if (!list) return;
    list.innerHTML = "";
    
    var html = "";
    
    if (currentScramble) {
        html += '<div class="scramble-text">// ' + currentScramble + '</div>';
    }
    
    // Optimize the display of moves
    var optimizedHistory = optimizeMoves(moveHistory);
    
    if (optimizedHistory.length > 0) {
        html += '<span>' + optimizedHistory.join(" ") + '</span>';
    } else if (!currentScramble) {
        html = "(No moves yet)";
    }

    list.innerHTML = html;

    // Calculate Move Count (Exclude rotations x, y, z)
    var count = optimizedHistory.filter(function(m) {
        return !/^[xyz]/.test(m);
    }).length;

    var countSpan = document.getElementById("solution-count");
    if (countSpan) {
        countSpan.textContent = count > 0 ? " (" + count + ")" : "";
    }
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
            // Only copy the user's solution, not the scramble
            var textToCopy = "";
            var optimizedHistory = optimizeMoves(moveHistory);
            if (optimizedHistory.length > 0) {
                textToCopy = optimizedHistory.join(" ");
            }
            
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(function() {
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

    // Side Menu Logic
    var appTitle = document.querySelector('.app-title');
    var sideMenu = document.getElementById('side-menu');
    var menuOverlay = document.getElementById('menu-overlay');

    function toggleMenu() {
        if (!sideMenu || !menuOverlay) return;
        
        var isOpen = sideMenu.classList.contains('open');
        if (isOpen) {
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('open');
        } else {
            sideMenu.classList.add('open');
            menuOverlay.classList.add('open');
        }
    }

    function closeMenu() {
        if (!sideMenu || !menuOverlay) return;
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
    }

    if (appTitle) {
        appTitle.addEventListener('click', toggleMenu);
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
        aboutModal.style.display = "flex";
    }

    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', function() {
            aboutModal.style.display = "none";
        });
    }

    // Close about modal on outside click (re-using window click listener logic would be messy, specific one here)
    window.addEventListener('click', function(event) {
        if (event.target == aboutModal) {
            aboutModal.style.display = "none";
        }
    });

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
        
        // Sync colors
        document.getElementById('color-u').value = CUBE_CONFIG.colors[1];
        document.getElementById('color-r').value = CUBE_CONFIG.colors[2];
        document.getElementById('color-f').value = CUBE_CONFIG.colors[3];
        document.getElementById('color-d').value = CUBE_CONFIG.colors[4];
        document.getElementById('color-l').value = CUBE_CONFIG.colors[5];
        document.getElementById('color-b').value = CUBE_CONFIG.colors[6];
        
        settingsModal.style.display = "flex";
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', function() {
            settingsModal.style.display = "none";
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

    // Color Pickers Listeners
    var colorMap = {
        'color-u': 1, 'color-r': 2, 'color-f': 3,
        'color-d': 4, 'color-l': 5, 'color-b': 6
    };

    Object.keys(colorMap).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function(e) {
                var colorIndex = colorMap[id];
                CUBE_CONFIG.colors[colorIndex] = e.target.value;
                saveSettings();
                drawCube();
            });
        }
    });

    // Close settings on outside click
    window.addEventListener('click', function(event) {
        if (event.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    });


    // =========================================
    // Manual Scramble Logic
    // =========================================
    var manualModal = document.getElementById("manual-scramble-modal");
    var closeManualBtn = document.getElementById("close-manual-scramble");
    var manualInput = document.getElementById("manual-scramble-input");
    var manualConfirm = document.getElementById("manual-scramble-confirm");

    function openManualScramble() {
        if (!manualModal) return;
        manualInput.value = "";
        manualModal.style.display = "flex";
        setTimeout(function() { manualInput.focus(); }, 100);
    }
    
    if (closeManualBtn) {
        closeManualBtn.addEventListener('click', function() {
            manualModal.style.display = "none";
        });
    }

    // Close manual modal on outside click
    window.addEventListener('click', function(event) {
        if (event.target == manualModal) {
            manualModal.style.display = "none";
        }
    });

    if (manualConfirm) {
        manualConfirm.addEventListener('click', function() {
            var moves = manualInput.value.trim();
            if (moves) {
                cube.doAlgorithm(moves);
                currentScramble = moves;
                moveHistory = []; // Reset user moves for new scramble
                
                manualModal.style.display = "none";
                drawCube();
            }
        });
    }

    // Hook up Scramble Button to check setting
    var scrambleBtn = document.getElementById("scramble-btn");
    // Remove old listener effectively by replacing clone or just use flag inside listener
    // Since we added listener before, let's just add logic inside the previous listener zone?
    // Actually, I can't easily remove the anonymous listener added before. 
    // I should modify the previous scramble button logic in source or overwrite it.
    // The previous code block for scramble listener is:
    /*
        if (scrambleBtn) {
            scrambleBtn.addEventListener('click', scramble);
        }
    */
   // I will REPLACE that block with new logic.
});
