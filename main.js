document.addEventListener('DOMContentLoaded', () => {
    const SIZE = 4;
    let board = [];
    let currentscore = 0;

    const currScoreElement = document.querySelector('.current-score');
    const HighScoreElement = document.querySelector('.High-Score');
    const gameGrid = document.querySelector('.game-grid');
    const gameOverElem = document.querySelector('.game-over');
    const restartBtn = document.querySelector('.restart-game');

    let HighScore = localStorage.getItem('2048-HighScore') || 0;
    HighScoreElement.textContent = HighScore;

    // ==================== ADDED: Звуки ====================
    const sounds = {
        move: new Audio('./sounds/move.mp3'),
        merge: new Audio('./sounds/merge.mp3'),
        win: new Audio('./sounds/win.mp3')
    };
    // Установим низкую громкость
    Object.values(sounds).forEach(s => s.volume = 0.3);

    // Функция для попытки воспроизвести звук (с автозапуском после взаимодействия)
    function playSound(sound) {
        sound.play().catch(e => {}); // игнорим ошибки автозапуска
    }

    // Активируем звуки при первом нажатии клавиши
    document.addEventListener('keydown', function initAudio() {
        playSound(sounds.move); // просто чтобы разблокировать аудиоконтекст
        document.removeEventListener('keydown', initAudio);
    }, { once: true });

    // ==================== ADDED: Конфетти ====================
    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            startVelocity: 25,
            colors: ['#26ccff', '#a25afd', '#ff5e7d', '#ffac46']
        });
    }

    // ==================== ADDED: Темы ====================
    const themes = {
        default: {
            bg: 'rgb(71, 8, 100)',
            cell: 'rgb(85, 0, 40)',
            container: '#3d1a33',
            text: 'white'
        },
        animals: {
            bg: '#2d5e3b',
            cell: '#8b5a2b',
            container: '#5d3a1a',
            text: '#f9e0a0'
        },
        food: {
            bg: '#b33b3b',
            cell: '#f28b42',
            container: '#b35e2e',
            text: '#fff5e0'
        },
        soft: {
            bg: '#5e4b8c',
            cell: '#b48cb3',
            container: '#8a6d8a',
            text: '#fbeaff'
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
        // Сохраняем выбранную тему
        localStorage.setItem('2048-theme', themeName);
    }

    // Загружаем сохранённую тему или ставим default
    const savedTheme = localStorage.getItem('2048-theme') || 'default';
    setTheme(savedTheme);

    // Обработчики кнопок тем
    document.querySelectorAll('.theme-selector button').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });

    // ==================== Основные функции игры ====================

    function updatescore(value) {
        currentscore += value;
        currScoreElement.textContent = currentscore;
        if (currentscore > HighScore) {
            HighScore = currentscore;
            HighScoreElement.textContent = HighScore;
            localStorage.setItem('2048-HighScore', HighScore);
            // ADDED: конфетти и звук при рекорде
            triggerConfetti();
            playSound(sounds.win);
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
                            cell.classList.add('merged-tile');
                        } else {
                            cell.classList.add('new-tile');
                        }
                    }
                } else {
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile', 'new-tile');
                }
            }
        }
    }

    // Очищаем классы анимации
    setInterval(() => {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('merged-tile', 'new-tile');
        });
    }, 300);

    function placeRandom() {
        const available = [];
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === 0) {
                    available.push({ row: i, col: j });
                }
            }
        }

        if (available.length === 0) return false;

        const randomIndex = Math.floor(Math.random() * available.length);
        const chosen = available[randomIndex];

        board[chosen.row][chosen.col] = Math.random() < 0.9 ? 2 : 4;

        const cell = document.querySelector(`[data-row="${chosen.row}"][data-col="${chosen.col}"]`);
        if (cell) {
            cell.textContent = board[chosen.row][chosen.col];
            cell.dataset.value = board[chosen.row][chosen.col];
            cell.classList.add('new-tile');
        }
        return true;
    }

    function move(direction) {
        let hasChanged = false;

        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < SIZE; j++) {
                const column = [];
                for (let i = 0; i < SIZE; i++) {
                    column.push(board[i][j]);
                }

                const newColumn = transform(column, direction === 'ArrowUp');

                for (let i = 0; i < SIZE; i++) {
                    if (board[i][j] !== newColumn[i]) {
                        hasChanged = true;
                    }
                    board[i][j] = newColumn[i];
                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let i = 0; i < SIZE; i++) {
                const row = [...board[i]];
                const newRow = transform(row, direction === 'ArrowLeft');

                if (row.join(',') !== newRow.join(',')) {
                    hasChanged = true;
                }
                board[i] = newRow;
            }
        }

        if (hasChanged) {
            // ADDED: звук хода
            playSound(sounds.move);

            // ADDED: визуальный эффект хода (пульсация всех ячеек)
            for (let i = 0; i < SIZE; i++) {
                for (let j = 0; j < SIZE; j++) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (cell && board[i][j] !== 0) {
                        cell.classList.add('move-tile');
                        setTimeout(() => cell.classList.remove('move-tile'), 150);
                    }
                }
            }

            placeRandom();
            renderBoard();
            checkGameOver();
        }
    }

    function transform(line, moveTowardsStart) {
        let newLine = line.filter(cell => cell !== 0);

        if (!moveTowardsStart) {
            newLine.reverse();
        }

        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                updatescore(newLine[i]);
                newLine.splice(i + 1, 1);
                // ADDED: звук слияния
                playSound(sounds.merge);
            }
        }

        while (newLine.length < SIZE) {
            newLine.push(0);
        }

        if (!moveTowardsStart) {
            newLine.reverse();
        }

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

    document.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            move(event.key);
        }
    });

    if (restartBtn) {
        restartBtn.addEventListener('click', restartgame);
    }

    initializegame();
});