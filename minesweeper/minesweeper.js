const cellContent = {
    empty: 0,
    bomb: "*",
    flag: "#",
    unflagged: "",
}

const gameStatus = {
    lost: 'lost',
    win: 'win',
    playing: 'playing',
    notStarted: 'not-started'
}

class MineSweeper {
    initialized = false
    mineField = null
    size = null
    minesCount = null
    container = null
    status = gameStatus.notStarted
    revealedCount = 0

    constructor(container, size/*[rows, cols]*/, minesCount) {
        this.container = container
        this.size = { rows: size[0], cols: size[1] };
        this.minesCount = minesCount
        this.mineField = new Array()
        for (let i = 0; i < this.size.cols; i++) {
            this.mineField.push(new Array())
            this.mineField[i] = new Array(this.size.rows).fill(cellContent.empty)
        }
    }

    init(x, y) {
        this.status = gameStatus.playing
        let mineCount = 0
        while (mineCount < this.minesCount) {
            const i = Math.round(Math.random() * (this.size.cols - 1))
            const j = Math.round(Math.random() * (this.size.rows - 1))
            if (this.mineField[i][j] != cellContent.bomb
                && i != x && j != y
            ) {
                this.mineField[i][j] = cellContent.bomb
                this.incrementAround(i, j)
                mineCount++
            }
        }
        this.initialized = true
    }

    incrementAround(x, y) {
        this.repeatAround(x, y, this.incrementOne)
    }

    repeatAround(x, y, callback) {
        if (x > 0) {
            if (y > 0)
                callback.bind(this)(x - 1, y - 1)
            callback.bind(this)(x - 1, y)
            if (y < this.size.rows - 1)
                callback.bind(this)(x - 1, y + 1)
        }
        if (y > 0)
            callback.bind(this)(x, y - 1)
        if (y < this.size.rows - 1)
            callback.bind(this)(x, y + 1)
        if (x < this.size.cols - 1) {
            if (y > 0)
                callback.bind(this)(x + 1, y - 1)
            callback.bind(this)(x + 1, y)
            if (y < this.size.rows - 1)
                callback.bind(this)(x + 1, y + 1)
        }
    }

    incrementOne(x, y) {
        if (this.mineField[x][y] != cellContent.bomb)
            this.mineField[x][y]++
    }

    drawBoard() {
        const board = document.createElement('div')
        board.classList.add('board')
        for (let i = 0; i < this.size.rows; i++) {
            const row = document.createElement('div')
            row.classList.add('row')
            row.classList.add('row-' + i)
            for (let j = 0; j < this.size.cols; j++) {
                const cell = document.createElement('div')
                const cellContent = document.createElement('span')
                cell.appendChild(cellContent)
                cell.classList.add('cell')
                cell.classList.add('cell-' + j)
                cell.position = [j, i]
                cell.game = this;
                cell.revealed = false;
                cell.flagged = false;
                cell.addEventListener('click', this.onCellClick)
                cell.addEventListener('contextmenu', this.onCellRightClick)
                row.appendChild(cell);
            }
            board.appendChild(row);
        }
        this.container.appendChild(board);
    }

    cellClick(cell) {
        let [x, y] = cell.position
        if (!this.initialized) {
            this.init(x, y)
        }
        if (!cell.flagged)
            switch (this.mineField[x][y]) {
                case cellContent.bomb:
                    this.lose()
                    break;
                default:
                    this.reveal(x, y)
                    break;
            }
    }

    cellRightClick(cell) {
        if (!cell.revealed) {
            if (!cell.flagged) {
                cell.flagged = true
                cell.querySelector('span').innerText = cellContent.flag
            } else {
                cell.flagged = false
                cell.querySelector('span').innerText = cellContent.unflagged
            }
        }
    }

    lose() {
        this.status = gameStatus.lost
        this.revealAllBombs()
        alert('Lose!')
        this.removeListeners()
    }

    win() {
        this.status = gameStatus.win
        alert('Win!')
        this.removeListeners()
    }

    removeListeners() {
        this.container.querySelectorAll('.cell').forEach(element => {
            element.removeEventListener('click', this.onCellClick)
            element.removeEventListener('contextmenu', this.onCellRightClick)
        })
    }

    revealAllBombs() {
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.cols; j++) {
                if (this.mineField[j][i] == cellContent.bomb) {
                    this.reveal(j, i)
                }
            }
        }
    }

    reveal(x, y) {
        const cell = this.getCell(x, y);
        if (!cell.revealed && (!cell.flagged || this.status == gameStatus.lost)) {
            this.show(x, y)
            cell.revealed = true
            this.revealedCount++;
            if (this.mineField[x][y] == cellContent.empty) {
                cell.classList.add('empty')
                this.repeatAround(x, y, this.reveal)
            } else if (this.mineField[x][y] == cellContent.bomb) {
                cell.classList.add('bomb')
            } else {
                cell.classList.add('number')
            }

            if (this.status == gameStatus.playing) {
                if (this.size.rows * this.size.cols - this.minesCount == this.revealedCount) {
                    this.win()
                }
            }
        }
    }

    show(x, y) {
        this.getCell(x, y).querySelector('span').innerText = this.mineField[x][y]
    }

    getCell(x, y) {
        return this.container.querySelector(`.board .row-${y} .cell-${x}`)
    }

    repeatAll(callback, condition = () => true) {
    }

    onCellClick(event) {
        event.preventDefault();
        this.game.cellClick(this)
    }

    onCellRightClick(event) {
        event.preventDefault();
        this.game.cellRightClick(this)
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const mainDiv = document.getElementById('main')
    const game = new MineSweeper(mainDiv, [10, 10], 10);
    game.drawBoard();
}, false);