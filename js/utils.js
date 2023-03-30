'use strict'

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

function findEmptyRandomCell(board) {
    const emptyLocations = []
    for (var i = 0; i < gSelctedLevel.SIZE; i++) {
        for (var j = 0; j < gSelctedLevel.SIZE; j++) {
            const cell = board[i][j]
            if (!cell.isMine && !cell.isShown) {
                const pos = { i, j }
                emptyLocations.push(pos)
            }
        }
    }

    const randIdx = getRandomInt(0, emptyLocations.length)
    return emptyLocations[randIdx]

}

function placeMines(board) {
    for (var i = 0; i < gSelctedLevel.MINES; i++) {
        const randCell = findEmptyRandomCell(board)
        board[randCell.i][randCell.j].isMine = true
    }
}

