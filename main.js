document.addEventListener('DOMContentLoaded', () => {
    const SIZE = 4;
    let board = [];
    let currentscore = 0;
    let gameActive = false;

    const menuScreen = document.querySelector('.menu-screen');
    const gameScreen = document.querySelector('.game-screen');
    const themeButtons = document.querySelectorAll('.theme-selector button');
    const playButton = document.querySelector('.play-button');
    const continueButton = document.querySelector('.continue-button');
    const menuButtonIcon = document.querySelector('.menu-button-icon');
    const currScoreElement = document.querySelector('.current-score');
    const HighScoreElement = document.querySelector('.High-Score');
    const gameGrid = document.querySelector('.game-grid');
    const gameOverElem = document.querySelector('.game-over');
    const restartBtn = document.querySelector('.restart-game');
    const restartGameBtn = document.querySelector('.restart-game-btn');

    let HighScore = localStorage.getItem('2048-HighScore') || 0;
    HighScoreElement.textContent = HighScore;

    function playSound(type) {
    const sfxVol = (localStorage.getItem('sfxVol') || 50) / 100;
    let fileName = '';

    if (type === 'move') fileName = 'move.mp3';
    else if (type === 'merge') fileName = 'merge.mp3';
    else if (type === 'gameover') fileName = 'gameover.mp3';

    if (fileName) {
        const audio = new Audio(fileName);
        audio.volume = sfxVol;
        audio.play().catch(() => {});
    }
}

    document.addEventListener('keydown', function initAudio() {
        document.removeEventListener('keydown', initAudio);
    }, { once: true });

    function setTheme(themeName) {
        document.body.classList.remove('theme-default', 'theme-animals', 'theme-food', 'theme-soft');
        document.body.classList.add(`theme-${themeName}`);
        localStorage.setItem('2048-theme', themeName);
    }

    const savedTheme = localStorage.getItem('2048-theme') || 'default';
    setTheme(savedTheme);

    const themeToggle = document.querySelector('.themes-toggle');
    const themeMenu = document.querySelector('.theme-selector');
    const skinsToggle = document.querySelector('.skins-toggle');
    const skinsMenu = document.querySelector('.skins-selector');

    function closeAllDropdowns() {
        themeMenu.classList.remove('show');
        skinsMenu.classList.remove('show');
    }

    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = themeMenu.classList.contains('show');
        closeAllDropdowns();
        if (!isOpen) themeMenu.classList.add('show');
    });

    skinsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = skinsMenu.classList.contains('show');
        closeAllDropdowns();
        if (!isOpen) skinsMenu.classList.add('show');
    });

    document.addEventListener('click', () => closeAllDropdowns());

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.theme);
            closeAllDropdowns();
        });
    });

    const skinButtons = document.querySelectorAll('.skins-selector button');
    function setSkin(skinName) {
        document.body.classList.remove('skin-harlamov', 'skin-burmalda', 'skin-vb', 'skin-girl');
        if (skinName && skinName !== 'default') {
            document.body.classList.add(`skin-${skinName}`);
            localStorage.setItem('2048-skin', skinName);
        } else {
            localStorage.removeItem('2048-skin');
        }
    }

    const savedSkin = localStorage.getItem('2048-skin');
    if (savedSkin) setSkin(savedSkin);

    skinButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setSkin(btn.dataset.skin);
            closeAllDropdowns();
        });
    });

    function saveGameState() {
        const state = {
            board: board,
            score: currentscore,
            highScore: HighScore
        };
        localStorage.setItem('2048-saved-game', JSON.stringify(state));
    }

    function loadGameState() {
        const saved = localStorage.getItem('2048-saved-game');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                board = state.board;
                currentscore = state.score;
                if (state.highScore > HighScore) {
                    HighScore = state.highScore;
                    HighScoreElement.textContent = HighScore;
                    localStorage.setItem('2048-HighScore', HighScore);
                }
                currScoreElement.textContent = currentscore;
                renderBoard();
                return true;
            } catch(e) {}
        }
        return false;
    }

    function clearSavedGame() {
        localStorage.removeItem('2048-saved-game');
    }

    function showMenu() {
        if (gameActive) {
            saveGameState();
            gameActive = false;
        }
        menuScreen.style.display = 'block';
        gameScreen.style.display = 'none';
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) bgMusic.pause();
        
        const hasSaved = localStorage.getItem('2048-saved-game') !== null;
        continueButton.style.display = hasSaved ? 'block' : 'none';
    }

    function startGame(resume = false) {
        menuScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        gameActive = true;
        
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) {
            const musicVolInput = document.getElementById('musicVolume');
            bgMusic.volume = (musicVolInput ? musicVolInput.value : 50) / 100;
            bgMusic.play().catch(e => {});
        }
        
        const settingsPanel = document.querySelector('.settings-panel');
        settingsPanel.classList.remove('show');
        
        if (resume) {
            loadGameState();
        } else {
            clearSavedGame();
            restartgame();
        }
    }

    playButton.addEventListener('click', () => startGame(false));
    continueButton.addEventListener('click', () => startGame(true));
    menuButtonIcon.addEventListener('click', showMenu);

    function updatescore(value) {
        currentscore += value;
        currScoreElement.textContent = currentscore;
        if (currentscore > HighScore) {
            HighScore = currentscore;
            HighScoreElement.textContent = HighScore;
            localStorage.setItem('2048-HighScore', HighScore);
            if (typeof confetti === 'function') {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
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
                if (!cell || !board[i]) continue;
                const currentValue = board[i][j];
                const prevValue = cell.dataset.value ? parseInt(cell.dataset.value) : 0;
                if (currentValue !== 0) {
                    cell.textContent = currentValue;
                    cell.dataset.value = currentValue;
                    if (prevValue !== currentValue && !cell.classList.contains('new-tile')) {
                        if (prevValue === 0) {
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
                if (board[i] && board[i][j] === 0) available.push({ row: i, col: j });
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
                for (let i = 0; i < SIZE; i++) {
                    if (board[i]) oldCol.push(board[i][j]);
                }
                const newCol = transform(oldCol, up);
                for (let i = 0; i < SIZE; i++) {
                    if (board[i] && board[i][j] !== newCol[i]) hasChanged = true;
                    if (board[i]) board[i][j] = newCol[i];
                }
                for (let i = 0; i < SIZE; i++) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (!cell) continue;
                    if (oldCol[i] !== 0 && newCol[i] === 0) {
                        cell.classList.add('merge-source');
                    } else if (newCol[i] > oldCol[i] && oldCol[i] !== 0) {
                        cell.classList.add('merge-target');
                    }
                }
            }
        } else {
            const left = (dir === 'arrowleft' || dir === 'a');
            for (let i = 0; i < SIZE; i++) {
                if (!board[i]) continue;
                const oldRow = [...board[i]];
                const newRow = transform(oldRow, left);
                if (oldRow.join(',') !== newRow.join(',')) hasChanged = true;
                board[i] = newRow;
                for (let j = 0; j < SIZE; j++) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (!cell) continue;
                    if (oldRow[j] !== 0 && newRow[j] === 0) {
                        cell.classList.add('merge-source');
                    } else if (newRow[j] > oldRow[j] && oldRow[j] !== 0) {
                        cell.classList.add('merge-target');
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
                playSound('merge');
                newLine.splice(i + 1, 1);
            }
        }

        while (newLine.length < SIZE) newLine.push(0);
        if (!moveTowardsStart) newLine.reverse();
        return newLine;
    }

    function checkGameOver() {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (!board[i]) continue;
                if (board[i][j] === 0) return false;
                if (i < SIZE - 1 && board[i+1] && board[i][j] === board[i + 1][j]) return false;
                if (j < SIZE - 1 && board[i][j] === board[i][j + 1]) return false;
            }
        }
        if (gameOverElem) 
            playSound('gameover');
            gameOverElem.style.display = 'flex';
        return true;
    }

    document.addEventListener('keydown', event => {
        if (gameScreen.style.display === 'none') return;
        const key = event.key.toLowerCase();
        const validKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'ц', 'ф', 'ы', 'в'];
        if (validKeys.includes(key)) {
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
        if (gameOverElem) gameOverElem.style.display = 'none';
        restartgame();
    });

    function toggleSettings() {
        document.querySelector('.settings-panel').classList.toggle('show');
    }

    document.querySelector('.menu-screen .settings-button').addEventListener('click', toggleSettings);

    const musicVolEl = document.getElementById('musicVolume');
    if (musicVolEl) {
        musicVolEl.addEventListener('input', e => {
            const vol = e.target.value / 100;
            localStorage.setItem('musicVol', e.target.value);
            const bgMusic = document.getElementById('bgMusic');
            if (bgMusic) bgMusic.volume = vol;
        });
        musicVolEl.value = localStorage.getItem('musicVol') || 50;
    }

    const sfxVolEl = document.getElementById('sfxVolume');
    if (sfxVolEl) {
        sfxVolEl.addEventListener('input', e => {
            localStorage.setItem('sfxVol', e.target.value);
        });
        sfxVolEl.value = localStorage.getItem('sfxVol') || 50;
    }

    const bgMusicFinal = document.getElementById('bgMusic');
    if (bgMusicFinal) {
        const savedMusicVol = localStorage.getItem('musicVol') || 50;
        bgMusicFinal.volume = savedMusicVol / 100;
    }

    showMenu();
}); 
