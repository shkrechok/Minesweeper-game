'use strict'


const gLevel = {
    SIZE: 10,
    MINES: 4
}

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard

function onInit() {
    updateGGame(true, 0, 0, 0)
    gBoard = buildBoard()
    renderBoard(gBoard)
    // for debugging
    console.table(gBoard)
    console.log(gGame)
}

function updateGGame(isOn, shownCount, markedCount, secsPassed) {
    gGame.isOn = isOn
    gGame.shownCount = shownCount
    gGame.markedCount = markedCount
    gGame.secsPassed = secsPassed
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            // if (i === 1 && j === 1) cell.isMine = true
            // if (i === 2 && j === 3) cell.isMine = true
            board[i][j] = cell
        }
    }
    placeMines(board)
    setMinesNegsCount(board)

    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = board[i][j]
            cell.minesAroundCount = countMinesNegs(board, i, j)
        }
    }
}

function countMinesNegs(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j]
            if (cell.isMine) count++
        }
    }
    return count
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var cellClass = ''
            if (cell.isShown) cellClass += ' shown'
            if (cell.isMine) cellClass += ' mine'
            if (cell.isMarked) cellClass += ' marked'

            strHTML += `<td class=" cell cell-${i}-${j} ${cellClass} "  onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,event,${i},${j})" >`
        }
        strHTML += '</tr>'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isMine) {
        showMines()
        gameOver()
        return
    }
    if (cell.isShown) return
    handleNotMineNotShownCell(elCell, i, j)
    // renderBoard(gBoard)
    checkGameOver()
}

function gameOver() {
    console.log('game over')
    gGame.isOn = false

}

function onCellMarked(elCell, event, i, j) {
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    event.preventDefault()
    elCell.classList.toggle('marked')
    if (elCell.classList.contains('marked')) {
        gGame.markedCount++
        cell.isMarked = true
    } else {
        gGame.markedCount--
        cell.isMarked = false
    }
    console.log('Marked Count: ', gGame.markedCount)
    checkGameOver()
}

function checkGameOver() {
    if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        gameOver()
    }
}

function handleNotMineNotShownCell(elCell, i, j) {
    var cell = gBoard[i][j]
    cell.isShown = true
    gGame.shownCount++
    console.log('Shown Count: ', gGame.shownCount)
    elCell.classList.add('shown')
    elCell.innerText = cell.minesAroundCount
    if (cell.minesAroundCount === 0) {
        revealNegs(i, j)
        elCell.innerText = ''
    }

}
function revealNegs(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = gBoard[i][j]
            if (cell.isMine || cell.isShown) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            handleNotMineNotShownCell(elCell, i, j)

        }
    }
}  

function showMines() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                cell.isShown = true
                elCell.classList.add('shown')
            }
        }
    }
}