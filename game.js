// ---- Games ----
const games = [
    {
        solution: [
            [0, 1, 1, 1, 0],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0]
        ],
        rowClues: ["3", "5", "5", "3", "1"],
        colClues: ["2", "4", "5", "4", "2"]
    },
    {
        solution: [
            [0, 0, 1, 0, 0],
            [1, 0, 1, 0, 1],
            [0, 1, 1, 1, 0],
            [1, 0, 1, 0, 1],
            [0, 0, 1, 0, 0]
        ],
        rowClues: ["1", "1 1 1", "3", "1 1 1", "1"],
        colClues: ["1 1", "1", "5", "1", "1 1"]
    },
    {
        solution: [
            [1, 0, 0, 0, 1, 1],
            [1, 1, 0, 1, 1, 1],
            [0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 1, 1],
            [0, 1, 1, 1, 0, 1],
            [0, 1, 1, 1, 0, 1]
        ],
        rowClues: ["1 1", "2 2", "3", "1 1 1", "3", "3"],
        colClues: ["2 1", "2 2", "1 2", "2 2", "2 1", "2"]
    },
    {
        solution: [
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [1, 1, 1, 1, 1],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0]
        ],
        rowClues: ["1", "1", "5", "1", "1"],
        colClues: ["1", "1", "5", "1", "1"]
    },
    {
        solution: [
            [0, 1, 1, 0, 0],
            [1, 1, 1, 0, 0],
            [1, 1, 1, 0, 0],
            [1, 1, 1, 0, 0],
            [0, 1, 1, 0, 0]
        ],
        rowClues: ["2", "3", "3", "3", "2"],
        colClues: ["4", "5", "5", "0", "0"]
    }
];

let gameIndex = 0;
let lives = 3;
let solution = [], rowClues = [], colClues = [], state = [];

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

                div.onclick = () => handleClick(r, c, div);
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

// ---- Validation ----
function validateCell(r, c, el) {
    el.classList.remove('wrong', 'locked');

    const expected = solution[r][c];
    const actual = state[r][c];


    if (actual === expected || (actual === 2 && expected === 0)) {
        // correct
        lockCell(r, c, el);
        return;
    } else {

        el.classList.add('wrong');

        if (actual === 1 && expected === 0) {
            // wrong filled cell
            el.classList.remove('filled');
            el.classList.add('marked');
            el.textContent = '✖';


        }
        else if (actual === 2 && expected === 1) {
            // wrong X (cell should have been filled)
            el.classList.remove('marked');
            el.textContent = '';
            el.classList.add('filled');
        }

    }
    state[r][c] = expected;

    lockCell(r, c, el);
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

// ---- Click Handlers ----
function handleClick(r, c, el) {
    clearReds();
    if (el.classList.contains('locked')) return;
    // if (state[r][c] === 2) return; // X-marked
    // state[r][c] = state[r][c] === 1 ? 0 : 1;
    state[r][c] = 1;
    el.classList.toggle('filled');
    validateCell(r, c, el);

}

function handleRightClick(r, c, el) {
    clearReds();
    if (el.classList.contains('locked')) return;
    // if (state[r][c] === 1) return; // filled cannot X
    // state[r][c] = state[r][c] === 2 ? 0 : 2;
    state[r][c] = 2;
    el.textContent = '✖';
    el.classList.toggle('marked');
    validateCell(r, c, el);


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