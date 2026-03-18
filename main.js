document.addEventListener('DOMContentLoaded', () => {
    const SIZE = 4;
    let board = [];
    let currentscore = 0;

    const menuScreen = document.querySelector('.menu-screen');
    const gameScreen = document.querySelector('.game-screen');
    const themeButtons = document.querySelectorAll('.theme-selector button');
    const playButton = document.querySelector('.play-button');
    const menuButton = document.querySelector('.menu-button');
    
    const currScoreElement = document.querySelector('.current-score');
    const HighScoreElement = document.querySelector('.High-Score');
    const gameGrid = document.querySelector('.game-grid');
    const gameOverElem = document.querySelector('.game-over');
    const restartBtn = document.querySelector('.restart-game');
    const restartGameBtn = document.querySelector('.restart-game-btn');

    let HighScore = localStorage.getItem('2048-HighScore') || 0;
    HighScoreElement.textContent = HighScore;

    const themes = {
        default: {
            bg: 'rgb(71, 8, 100)',
            cell: 'rgb(200, 100, 180)',
            container: '#3d1a33',
            text: 'white',
            mergeColor: '#ffb3ff',
            buttonBg: '#4a1a6b',
            buttonHover: '#6a2a8b'
        },
        animals: {
            bg: '#2d5e3b',
            cell: '#8b5a2b',
            container: '#5d3a1a',
            text: '#f9e0a0',
            mergeColor: '#dbb47a',
            buttonBg: '#3d6b4d',
            buttonHover: '#5d8b6d'
        },
        food: {
            bg: '#9f5f5f',
            cell: '#f28b42',
            container: '#b35e2e',
            text: '#fff5e0',
            mergeColor: '#ffb347',
            buttonBg: '#b35e2e',
            buttonHover: '#d37e4e'
        },
        soft: {
            bg: '#5e4b8c',
            cell: '#b48cb3',
            container: '#8a6d8a',
            text: '#fbeaff',
            mergeColor: '#d9b3ff',
            buttonBg: '#5e4b8c',
            buttonHover: '#7e6bac'
        }
    };

    function setTheme(themeName) {
        const t = themes[themeName];
        document.body.style.backgroundColor = t.bg;
        document.querySelector('.game-container').style.backgroundColor = t.container;
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.style.backgroundColor = t.cell;
            cell.style.color = t.text;
        });
        document.documentElement.style.setProperty('--merge-color', t.mergeColor);
        document.documentElement.style.setProperty('--button-bg', t.buttonBg);
        document.documentElement.style.setProperty('--button-hover', t.buttonHover);
        localStorage.setItem('2048-theme', themeName);
    }

    const savedTheme = localStorage.getItem('2048-theme') || 'default';
    setTheme(savedTheme);

    document.querySelector('.themes-toggle').addEventListener('click', () => {
        document.querySelector('.theme-selector').classList.toggle('show');
    });

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.theme);
            document.querySelector('.theme-selector').classList.remove('show');
        });
    });

    function showMenu() {
        menuScreen.style.display = 'block';
        gameScreen.style.display = 'none';
    }

    function startGame() {
        menuScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        restartgame();
    }

    playButton.addEventListener('click', startGame);
    menuButton.addEventListener('click', showMenu);

    function updatescore(value) {
        currentscore += value;
        currScoreElement.textContent = currentscore;
        if (currentscore > HighScore) {
            HighScore = currentscore;
            HighScoreElement.textContent = HighScore;
            localStorage.setItem('2048-HighScore', HighScore);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            playSound('win');
        }
    }

    function restartgame() {
        currentscore = 0;
        currScoreElement.textContent = 0;
        if (gameOverElem) gameOverElem.style.display = 'none';
        initializegame();
    }

    function initializegame() {
        board = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }

    function renderBoard() {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (!cell) continue;

                const currentValue = board[i][j];
                const prevValue = cell.dataset.value ? parseInt(cell.dataset.value) : 0;

                if (currentValue !== 0) {
                    cell.textContent = currentValue;
                    cell.dataset.value = currentValue;

                    if (prevValue !== currentValue && !cell.classList.contains('new-tile')) {
                        if (prevValue !== 0) {
                            // Анимация слияния будет добавлена отдельно в move
                        } else {
                            cell.classList.add('new-tile');
                        }
                    }
                } else {
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('new-tile', 'move-tile', 'merge-target', 'merge-source');
                }
            }
        }
    }

    setInterval(() => {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('new-tile', 'move-tile', 'merge-target', 'merge-source');
        });
    }, 800);

    function placeRandom() {
        const available = [];
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === 0) available.push({ row: i, col: j });
            }
        }
        if (available.length === 0) return false;
        const chosen = available[Math.floor(Math.random() * available.length)];
        board[chosen.row][chosen.col] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }

    function move(direction) {
        let hasChanged = false;
        const dir = direction.toLowerCase();

        if (dir === 'arrowup' || dir === 'arrowdown' || dir === 'w' || dir === 's') {
            const up = (dir === 'arrowup' || dir === 'w');
            for (let j = 0; j < SIZE; j++) {
                const oldCol = [];
                for (let i = 0; i < SIZE; i++) oldCol.push(board[i][j]);
                const newCol = transform(oldCol, up);
                for (let i = 0; i < SIZE; i++) {
                    if (board[i][j] !== newCol[i]) hasChanged = true;
                    board[i][j] = newCol[i];
                }
                for (let i = 0; i < SIZE; i++) {
                    if (oldCol[i] !== 0 && newCol[i] === 0) {
                        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        if (cell) cell.classList.add('merge-source');
                    } else if (newCol[i] > oldCol[i] && oldCol[i] !== 0) {
                        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        if (cell) cell.classList.add('merge-target');
                    }
                }
            }
        } else {
            const left = (dir === 'arrowleft' || dir === 'a');
            for (let i = 0; i < SIZE; i++) {
                const oldRow = [...board[i]];
                const newRow = transform(oldRow, left);
                if (oldRow.join(',') !== newRow.join(',')) hasChanged = true;
                board[i] = newRow;
                for (let j = 0; j < SIZE; j++) {
                    if (oldRow[j] !== 0 && newRow[j] === 0) {
                        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        if (cell) cell.classList.add('merge-source');
                    } else if (newRow[j] > oldRow[j] && oldRow[j] !== 0) {
                        const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        if (cell) cell.classList.add('merge-target');
                    }
                }
            }
        }

        if (hasChanged) {
            playSound('move');
            document.querySelectorAll('.grid-cell').forEach(cell => cell.classList.add('move-tile'));
            placeRandom();
            renderBoard();
            checkGameOver();
        }
    }

    function transform(line, moveTowardsStart) {
        let newLine = line.filter(cell => cell !== 0);
        if (!moveTowardsStart) newLine.reverse();

        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                updatescore(newLine[i]);
                newLine.splice(i + 1, 1);
                playSound('merge');
            }
        }

        while (newLine.length < SIZE) newLine.push(0);
        if (!moveTowardsStart) newLine.reverse();
        return newLine;
    }

    function checkGameOver() {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === 0) return false;
                if (i < SIZE - 1 && board[i][j] === board[i + 1][j]) return false;
                if (j < SIZE - 1 && board[i][j] === board[i][j + 1]) return false;
            }
        }
        gameOverElem.style.display = 'flex';
        return true;
    }

    // Исправленный обработчик клавиш (поддержка русских букв)
    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'ц', 'ф', 'ы', 'в'].includes(key)) {
            event.preventDefault();
            let moveKey = key;
            if (key === 'ц') moveKey = 'w';
            else if (key === 'ф') moveKey = 'a';
            else if (key === 'ы') moveKey = 's';
            else if (key === 'в') moveKey = 'd';
            move(moveKey);
        }
    });

    let mouseStart = null;
    gameGrid.addEventListener('mousedown', e => {
        mouseStart = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    });

    gameGrid.addEventListener('mousemove', e => {
        if (!mouseStart) return;
        const dx = e.clientX - mouseStart.x;
        const dy = e.clientY - mouseStart.y;
        if (Math.abs(dx) > 50 || Math.abs(dy) > 50) {
            if (Math.abs(dx) > Math.abs(dy)) {
                move(dx > 0 ? 'arrowright' : 'arrowleft');
            } else {
                move(dy > 0 ? 'arrowdown' : 'arrowup');
            }
            mouseStart = null;
        }
    });

    gameGrid.addEventListener('mouseup', () => mouseStart = null);
    gameGrid.addEventListener('mouseleave', () => mouseStart = null);

    restartBtn?.addEventListener('click', showMenu);
    restartGameBtn?.addEventListener('click', () => {
        gameOverElem.style.display = 'none';
        restartgame();
    });

    function playSound(type) {
        const vol = parseFloat(document.getElementById('sfxVolume').value) / 100;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = type === 'move' ? 300 : (type === 'merge' ? 600 : 800);
        gainNode.gain.value = vol * 0.2;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }

    document.getElementById('musicVolume').addEventListener('input', e => {
        localStorage.setItem('musicVol', e.target.value);
    });
    document.getElementById('sfxVolume').addEventListener('input', e => {
        localStorage.setItem('sfxVol', e.target.value);
    });

    document.getElementById('musicVolume').value = localStorage.getItem('musicVol') || 50;
    document.getElementById('sfxVolume').value = localStorage.getItem('sfxVol') || 50;

    document.querySelector('.settings-button').addEventListener('click', () => {
        document.querySelector('.settings-panel').classList.toggle('show');
    });

    showMenu();
});