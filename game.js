// ---- Games ----
const games = [
    {
        solution: [
            [2, 1, 1, 1, 2],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [2, 1, 1, 1, 2],
            [2, 2, 1, 2, 2]
        ],
        rowClues: ["3", "5", "5", "3", "1"],
        colClues: ["2", "4", "5", "4", "2"]
    },
    {
        solution: [
            [2, 2, 1, 2, 2],
            [1, 2, 1, 2, 1],
            [2, 1, 1, 1, 2],
            [1, 2, 1, 2, 1],
            [2, 2, 1, 2, 2]
        ],
        rowClues: ["1", "1 1 1", "3", "1 1 1", "1"],
        colClues: ["1 1", "1", "5", "1", "1 1"]
    },
    {
        solution: [
            [1, 2, 2, 2, 1, 1],
            [1, 1, 2, 1, 1, 1],
            [2, 1, 1, 1, 2, 1],
            [1, 2, 1, 2, 1, 1],
            [2, 1, 1, 1, 2, 1],
            [2, 1, 1, 1, 2, 1]
        ],
        rowClues: ["1 1", "2 2", "3", "1 1 1", "3", "3"],
        colClues: ["2 1", "2 2", "1 2", "2 2", "2 1", "2"]
    },
    {
        solution: [
            [2, 2, 1, 2, 2],
            [2, 2, 1, 2, 2],
            [1, 1, 1, 1, 1],
            [2, 2, 1, 2, 2],
            [2, 2, 1, 2, 2]
        ],
        rowClues: ["1", "1", "5", "1", "1"],
        colClues: ["1", "1", "5", "1", "1"]
    },
    {
        solution: [
            [2, 1, 1, 2, 2],
            [1, 1, 1, 2, 2],
            [1, 1, 1, 2, 2],
            [1, 1, 1, 2, 2],
            [2, 1, 1, 2, 2]
        ],
        rowClues: ["2", "3", "3", "3", "2"],
        colClues: ["4", "5", "5", "", ""]
    }
];


let gameIndex = 0;
let lives = 3;
let state = [];


function updateLives() {
    for (let i = 0; i < lives; i++) {
        const el = document.getElementById(`live-${i + 1}`);
        el.classList.remove('hidden');
    }
    for (let i = lives; i < 3; i++) {
        const el = document.getElementById(`live-${i + 1}`);
        el.classList.add('hidden');
    }
}
// ---- Grid ----
function loadGame(index) {
    gameIndex = index;
    state = Array.from({ length: games[index].solution.length }, () => Array(games[index].solution[0].length).fill(0));

    lives = 3;
    updateLives();
    solution = games[index].solution;
    rowClues = games[index].rowClues;
    colClues = games[index].colClues;
    buildGrid();
}

function buildGrid() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    const rows = solution.length, cols = solution[0].length;
    state = Array.from({ length: rows }, () => Array(cols).fill(0));
    board.style.gridTemplateColumns = `repeat(${cols + 1},40px)`;
    board.style.gridTemplateRows = `repeat(${rows + 1},40px)`;

    for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
            const div = document.createElement('div');
            if (r === -1 && c === -1) { div.className = 'clue'; }
            else if (r === -1) { div.className = 'clue'; div.textContent = colClues[c]; }
            else if (c === -1) { div.className = 'clue'; div.textContent = rowClues[r]; }
            else {
                div.className = 'cell';
                div.dataset.row = r;
                div.dataset.col = c;

                div.onclick = e => handleClick(r, c, div, e);
                div.oncontextmenu = e => {
                    e.preventDefault();
                    handleRightClick(r, c, div);
                };
            }
            board.appendChild(div);
        }
    }
}


function lockCell(r, c, el) {
    el.classList.add('locked');
}

function checkFullRow(r) {
    const row = state[r];
    console.log("row:", row)
    const solutionRow = solution[r];
    console.log("solutionRow:", solutionRow)
    for (let c = 0; c < row.length; c++) {
        if (solutionRow[c] == 1 && row[c] !== solutionRow[c]) {
            return false;
        }
    }
    return true;
}


function completeRowWithX(r) {
    const row = state[r];
    const solutionRow = solution[r];
    for (let c = 0; c < row.length; c++) {
        if (row[c] === 0) {
            let el_cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            state[r][c] = 2;
            el_cell.classList.add('marked');
            el_cell.textContent = '✖';
            lockCell(r, c, el_cell);
        }
    }
}

function checkFullCol(c) {
    const col = state.map(row => row[c]);
    const solutionCol = solution.map(row => row[c]);
    for (let r = 0; r < col.length; r++) {
        if (solutionCol[r] == 1 && col[r] !== solutionCol[r]) {
            return false;
        }
    }
    return true;
}

function completeColWithX(c) {
    const col = state.map(row => row[c]);
    const solutionCol = solution.map(row => row[c]);
    for (let r = 0; r < col.length; r++) {
        if (col[r] === 0) {
            let el_cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            state[r][c] = 2;
            el_cell.classList.add('marked');
            el_cell.textContent = '✖';
            lockCell(r, c, el_cell);
        }
    }
}

// ---- Validation ----
function validateCell(r, c, el) {
    el.classList.remove('wrong');

    const expected = solution[r][c];
    const actual = state[r][c];

    if (actual === expected) {
        return;
    }

    // wrong
    el.classList.add('wrong');

    state[r][c] = expected;

    el.classList.remove('filled', 'marked');
    el.textContent = '';

    if (expected === 1) {
        el.classList.add('filled');
    } else {
        el.classList.add('marked');
        el.textContent = '✖';
    }

    lives--;
    updateLives();
    checkLost();


}


function clearReds() {
    const wrongCells = document.querySelectorAll('.wrong');
    wrongCells.forEach(el => {
        el.classList.remove('wrong');
    });
}

function applyCellAction(r, c, el, newState, { className, text = '' }) {
    if (el.classList.contains('locked')) return;

    clearReds();

    // prevent re-applying same state (optional safety)
    if (state[r][c] === newState) return;

    state[r][c] = newState;

    if (text) el.textContent = text;
    el.classList.add(className);

    validateCell(r, c, el);

    lockCell(r, c, el);

    if (checkFullRow(r)) completeRowWithX(r);
    if (checkFullCol(c)) completeColWithX(c);

}

// ---- Click Handlers ----

function handleClick(r, c, el, e) {
    if (e && e.button !== 0) return; // left click only

    applyCellAction(r, c, el, 1, {
        className: 'filled'
    });
}

function handleRightClick(r, c, el) {
    // X-marked cannot X again (your rule)
    if (state[r][c] === 2) return;

    applyCellAction(r, c, el, 2, {
        className: 'marked',
        text: '✖'
    });
}

// ---- Win Check ----
function checkWin() {
    for (let r = 0; r < solution.length; r++) {
        for (let c = 0; c < solution[0].length; c++) {
            if (solution[r][c] !== state[r][c]) {
                if (solution[r][c] === 0 && state[r][c] === 2) {
                    continue;
                }
                alert('❌ Not quite… recalibrate your answers');
                return;
            }
        }
    }
    alert('✨ Perfect! You solved it 💖');
}

function checkLost() {
    if (lives === 0) {
        alert('❌ You lost! No more lives remaining');
        loadGame(gameIndex);

    }
}


// ---- Init ----
loadGame(gameIndex);