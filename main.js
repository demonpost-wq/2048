document.addEventListener('DOMContentLoaded', () => { 
    const game = document.querySelector('.game-grid');
    const SIZE = 4; 
    let board = [];
    let currentscore = 0;   

    const currScoreElement = document.querySelector('.current-score');
    const HighScoreElement = document.querySelector('.High-Score');

    let HighScore = localStorage.getItem('2048-HighScore') || 0; 
    HighScoreElement.textContent = HighScore;

    const gameoOverElem = document.querySelector('.game-over');

    function updatescore(value){ 
        currentscore += value;
        currScoreElement.textContent = currentscore;
        if(currentscore > HighScore){
            HighScore = currentscore;
            HighScoreElement.textContent = HighScore;
            localStorage.setItem('2048-HighScore', HighScore);
        }
    }

    function restartgame(){
        currentscore = 0;
        currScoreElement.textContent = 0; 
        if (gameoOverElem) gameoOverElem.style.display = 'none';
        initializegame();
    }

    function initializegame(){
        board = [...Array(SIZE)].map(() => Array(SIZE).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }
    
    function renderBoard() {
        for(let i = 0; i < SIZE; i++){
            for(let j = 0; j < SIZE; j++){ 
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (!cell) continue;

                const currentValue = board[i][j];

                if (currentValue !== 0 ){
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;
                    
                     
                     if (currentValue !== parseInt(cell.dataset.prevValue) && !cell.classList.contains('new-tile')){
                         cell.classList.add('merged-tile');
                     }
                } else {
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-title', 'new-tile');
                }
            }
        }
    }

    
    setInterval(() => {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('merged-title', 'new-tile');
        });
    }, 300);

    function placeRandom() {
        const available = [];
        for(let i = 0; i < SIZE; i++) {
            for(let j = 0; j < SIZE; j++) {
                if (board[i][j] === 0) {
                    available.push({row: i, col: j});
                }
            }
        }

        if (available.length === 0) return;

        const randomIndex = Math.floor(Math.random() * available.length);
        const chosen = available[randomIndex];
        
        board[chosen.row][chosen.col] = Math.random() < 0.9 ? 2 : 4;
        
        
        const cell = document.querySelector(`[data-row="${chosen.row}"][data-col="${chosen.col}"]`);
        if (cell) {
            cell.textContent = board[chosen.row][chosen.col];
            cell.dataset.value = board[chosen.row][chosen.col];
            cell.classList.add('new- ile');
        }
    }

    function move(direction){
let HasChanged = false;
    if(direction === 'AroowUp' || direction === ArrowDown) {
    for(let j = 0; j < SIZE; j++) {

    const column  = [...Array(SIZE)].map((_, i ) => boardi[i][j]);

    const newColumn = transform(column, diredction === 'ArrowUp')

    for(let i = 0; i < SIZE; i++) {
        if (board[i][j] !== newColumn[i]) {
            HasChanged = true;
        }
        board[i][j] = newColumn[i];
    }
    }

}

else if (direction === 'Aroowleft' || direction === ArrowRight) {
 for (let i = 0; i < SIZE; i++) {
     const row = board[i];
     const newRow =transform(row, direction === 'ArrowLeft')

     if (row.join(',') !== newRow.join(',')) {
         HasChanged = true;
     }
     board[i] = newRow;

     }
}

    }
     if(HasChanged){
        placeRandom();
        renderBoard ();
        checkGameOver();
     }

function transform (line,moveTowardsStart) {
    let newLine = line.filter(cell=> cell!== 0);

 if(!moveTowardsStart){
    newLine.rewerse();
 }

for (let i = 0; i < newLine.length - 1; i++) {
    if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        updatescore(newLine[i]);
        newLine.splice(i + 1, 1);
        
    }
}

while (mewLine.length < SIZE) {
    newLine.push(0);
}
 if(!moveTowardsStart){
    newLine.rewerse();

    }
 return newLine;
}

function checkGameOver () {
for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
        if (board[i][j] === 0) return;
        if (i !== SIZE - 1 && board[i][j] === board[i + 1][j]) return;
        if (j !== SIZE - 1 && board[i][j] === board[i][j + 1]) return;
    }
}
gameoOverElem.style.display = 'flex';

}

document.addEventListener('keydown', event => {
if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)){
    move(event.key);
move(event.key);
}


})
document.querySelector('restart-game').addEventListener('click',restartgame)

initializegame();

});