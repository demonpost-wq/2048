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
        randerBoard();
    }
    
    function randerBoard() {
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
            cell.classList.add('new-tile');
        }
    }

    initializegame(); 
});