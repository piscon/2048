class Game2048 {
    constructor(boardSize = 4) {
        this.boardSize = boardSize;
        this.board = [];
        this.score = 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');
        this.setupBoard();
        this.addEventListeners();
        this.spawnTile();
        this.spawnTile();
    }

    setupBoard() {
        this.gameBoard.innerHTML = '';
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('tile');
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gameBoard.appendChild(cell);
            }
        }
    }

    spawnTile() {
        const emptyCells = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length === 0) return false;

        const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.board[row][col] = value;
        this.updateBoard();
        return true;
    }

    updateBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = this.gameBoard.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const value = this.board[i][j];

                cell.textContent = value !== 0 ? value : '';
                cell.className = 'tile';
                if (value !== 0) {
                    cell.classList.add(`tile-${value}`);
                    cell.style.animation = 'appear 0.2s ease-in-out';
                }
            }
        }
        this.scoreDisplay.textContent = this.score;
    }

    move(direction) {
        let moved = false;

        const rotateBoard = () => {
            const newBoard = [];
            for (let i = 0; i < this.boardSize; i++) {
                const newRow = [];
                for (let j = 0; j < this.boardSize; j++) {
                    newRow.push(this.board[this.boardSize - 1 - j][i]);
                }
                newBoard.push(newRow);
            }
            this.board = newBoard;
        };

        const slide = () => {
            for (let i = 0; i < this.boardSize; i++) {
                // First, remove zeros and get the numbers
                let row = this.board[i].filter(val => val);

                // Merge only once per pair
                for (let j = 0; j < row.length - 1; j++) {
                    if (row[j] === row[j + 1]) {
                        row[j] *= 2;
                        this.score += row[j];
                        row.splice(j + 1, 1);
                        moved = true;
                    }
                }

                // Fill the rest with zeros
                while (row.length < this.boardSize) {
                    row.push(0);
                }

                if (JSON.stringify(this.board[i]) !== JSON.stringify(row)) {
                    moved = true;
                }
                this.board[i] = row;
            }
        };

        const reverseBoard = () => {
            for (let i = 0; i < this.boardSize; i++) {
                this.board[i].reverse();
            }
        };

        const transpose = () => {
            const newBoard = [];
            for (let i = 0; i < this.boardSize; i++) {
                const newRow = [];
                for (let j = 0; j < this.boardSize; j++) {
                    newRow.push(this.board[j][i]);
                }
                newBoard.push(newRow);
            }
            this.board = newBoard;
        };

        switch(direction) {
            case 'ArrowLeft':
                slide();
                break;
            case 'ArrowRight':
                reverseBoard();
                slide();
                reverseBoard();
                break;
            case 'ArrowUp':
                transpose();
                slide();
                transpose();
                break;
            case 'ArrowDown':
                transpose();
                reverseBoard();
                slide();
                reverseBoard();
                transpose();
                break;
        }

        if (moved) {
            this.spawnTile();
            this.updateBoard();
            this.checkGameStatus();
        }
    }

    checkGameStatus() {
        // Check for 2048 win condition
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 2048) {
                    alert('🎉恭喜你，挑战成功！');
                    return;
                }
            }
        }

        // Check if game is over
        let gameOver = true;
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    gameOver = false;
                    break;
                }

                // Check adjacent cells for possible merges
                if (j < this.boardSize - 1 && this.board[i][j] === this.board[i][j+1]) {
                    gameOver = false;
                    break;
                }
                if (i < this.boardSize - 1 && this.board[i][j] === this.board[i+1][j]) {
                    gameOver = false;
                    break;
                }
            }
            if (!gameOver) break;
        }

        if (gameOver) {
            alert('😭挑战失败，你的最终得分是' + this.score);
        }
    }

    addEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.move(e.key);
            }
        });

        // Touch/Swipe support
        let touchStartX = 0;
        let touchStartY = 0;

        this.gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gameBoard.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            const ratioX = Math.abs(diffX / diffY);
            const ratioY = Math.abs(diffY / diffX);

            if (Math.abs(diffX) > 50 && ratioX > 1) {
                this.move(diffX > 0 ? 'ArrowRight' : 'ArrowLeft');
            } else if (Math.abs(diffY) > 50 && ratioY > 1) {
                this.move(diffY > 0 ? 'ArrowDown' : 'ArrowUp');
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
