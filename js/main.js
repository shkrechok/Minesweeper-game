'use strict'
const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const LIFE = '❤️'
const HINT = '💡'
const SMILEY = '😀'
const SMILEY_WIN = '😎'
const SMILEY_LOSS = '😵'


const gLevels = {
    beginner: {
        SIZE: 4,
        MINES: 2,
        NAME: 'beginner'
    },
    medium: {
        SIZE: 8,
        MINES: 12,
        NAME: 'medium'
    },
    expert: {
        SIZE: 12,
        MINES: 32,
        NAME: 'expert'
    }
}


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard
var gSelctedLevel = gLevels['beginner']//.beginner
var gIsFirstClick
var gGameTimerInterval
var gIsWin
var gLives
var gRevealMineInterval
var gHintIsOn
var gHintTimeout
var gElHint


function onInit() {
    gHintIsOn = false
    gLives = 3
    document.querySelector('.lives').innerHTML = 'Lives left: ' + LIFE.repeat(gLives)
    gIsWin = false
    gIsFirstClick = true
    gGame = initGameObj(false, 0, 0, 0)
    if (gGameTimerInterval) clearInterval(gGameTimerInterval)
    document.querySelector('.timer').innerHTML = 'Timer: 0.000'
    document.querySelector('.smiley').innerHTML = SMILEY
    gBoard = buildBoard()
    renderHints()
    renderBoard(gBoard)
    renderLevels()
    // for debugging
    console.table(gBoard)
    console.log(gGame)

}

function onPlayAgainPressed() {
    onInit()
}

function initGameObj(isOn, shownCount, markedCount, secsPassed) {
    return {
        isOn,
        shownCount,
        markedCount,
        secsPassed
    }
}

function renderLevels() {
    var strHTML = ''
    for (var level in gLevels) {
        var checked = gLevels[level].NAME === gSelctedLevel.NAME ? 'checked' : ''
        strHTML += `<label><input type="radio" ${checked} name="level" value="${gLevels[level].NAME}" onclick="handleLevelSelection(this)">${level}</label>`
    }
    var elLevels = document.querySelector('.levels')
    elLevels.innerHTML = strHTML
}

function handleLevelSelection(elLevel) {

    var level = elLevel.value
    if (level === gSelctedLevel.NAME) return
    gSelctedLevel = gLevels[level]
    console.log(gSelctedLevel)
    onInit()
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gSelctedLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gSelctedLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                // for hint reveal
                isRevealed: false
            }
            board[i][j] = cell
        }
    }
    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gSelctedLevel.SIZE; i++) {
        for (var j = 0; j < gSelctedLevel.SIZE; j++) {
            var cell = board[i][j]
            if (cell.isMine) continue
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
            var cellContent = ''
            if (cell.isShown) {
                if (cell.isMine) cellContent = MINE
                else if (cell.minesAroundCount) cellContent = cell.minesAroundCount
            }
            else if (cell.isMarked) cellContent = FLAG

            strHTML += `<td class=" cell cell-${i}-${j} ${cellClass} "  onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,event,${i},${j})" >
            ${cellContent}
            </td>`

        }
        strHTML += '</tr>'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}


function onCellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (!gGame.isOn && !gIsFirstClick) return
    if (gIsFirstClick) handleFirstClick(i, j)
    if (gHintIsOn) handleHint(i, j)
    if (cell.isMarked) return  // cannot click on a marked cell
    if (cell.isMine) {
        if (gHintIsOn) return
        gLives--
        document.querySelector('.lives').innerHTML = 'Lives left: ' + LIFE.repeat(gLives)
        if (gLives === 0) {
            showMines()
            gameOver()
            return
        } else {

            indicateSteppingOnMine(elCell)
            return
        }
    }

    if (cell.isShown) return
    handleNotMineNotShownCell( i, j)
    renderBoard(gBoard)
    checkGameOver()
}

function indicateSteppingOnMine(elCell) {
    elCell.innerHTML = MINE
    gRevealMineInterval = setTimeout(function () {
        elCell.innerHTML = ''
    }, 1000)
}

// first click is never a mine. The mines are placed after the first click. 
function handleFirstClick(i, j) {
    const startTime = Date.now()
    gIsFirstClick = false
    gGame.isOn = true
    var cell = gBoard[i][j]
    cell.isShown = true
    placeMines(gBoard)
    setMinesNegsCount(gBoard)    
    gGameTimerInterval = setInterval(updateTimer, 100, startTime)
    gGame.shownCount++
    console.log('Shown Count: ', gGame.shownCount)
    if (cell.minesAroundCount === 0) revealNegs(i, j)
    renderBoard(gBoard)

}

function updateTimer(startTime) {
    const gTime = Date.now() - startTime
    // presented in seconds with 3 digits after the dot
    gGame.secsPassed = (gTime / 1000).toFixed(3)
    var elTimer = document.querySelector('.timer')
    elTimer.innerHTML = `Timer: ${gGame.secsPassed}`
}


function gameOver() {
    console.log('game over')
    gGame.isOn = false
    clearInterval(gGameTimerInterval)
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = gIsWin ? SMILEY_WIN : SMILEY_LOSS
    console.log('Game counters: ', gGame)

}

function onCellMarked(elCell, event, i, j) {
    event.preventDefault()
    // cannot mark cell before first click
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isShown) return

    elCell.classList.toggle('marked') // instead of rendering the whole board
    if (elCell.classList.contains('marked')) {
        gGame.markedCount++
        cell.isMarked = true
        elCell.innerHTML = FLAG
    } else {
        gGame.markedCount--
        cell.isMarked = false
        elCell.innerHTML = EMPTY
    }
    console.log('Marked Count: ', gGame.markedCount)
    checkGameOver()
}

function checkGameOver() {
    if (gGame.shownCount === gSelctedLevel.SIZE ** 2 - gSelctedLevel.MINES && gGame.markedCount === gSelctedLevel.MINES) {
        gIsWin = true
        gameOver()
    }
}

function handleNotMineNotShownCell(i, j) {
    var cell = gBoard[i][j]
    // version 2 (missed it was a requirement before): marked cell can not be shown. 
    if (!cell.isMarked) {
        cell.isShown = true
        gGame.shownCount++
    }
    // version 1: in case the cell was marked before but there was no mine in it, the cell is not marked anymore but shown
    //  (since clicked or a an expansion of a cell with no mines around). 
    //cell.isShown = true
    //gGame.shownCount++
    // if (cell.isMarked) {
    //     gGame.markedCount--
    //     cell.isMarked = false
    //     console.log('Marked Count: ', gGame.markedCount)
    // }
    console.log('Shown Count: ', gGame.shownCount)
    if (cell.minesAroundCount === 0) revealNegs(i, j)
}

function revealNegs(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gSelctedLevel.SIZE) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gSelctedLevel.SIZE) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = gBoard[i][j]
            if (cell.isMine || cell.isShown) continue
            handleNotMineNotShownCell(i, j)

        }
    }
}

function showMines() {
    for (var i = 0; i < gSelctedLevel.SIZE; i++) {
        for (var j = 0; j < gSelctedLevel.SIZE; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                cell.isShown = true
                console.log('cell', cell)
            }
        }
    }
    renderBoard(gBoard)
}