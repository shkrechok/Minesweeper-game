function onHintClicked(elHint) {
    // cannot use hint before first click
    if (!gGame.isOn) return
    elHint.style.backgroundColor = 'yellow'
    gHintIsOn = true
    gElHint = elHint
}

// on hint marked cell are also revealed
function revealNegsHint(i, j) {
    for (var x = i - 1; x <= i + 1; x++) {
        if (x < 0 || x >= gSelctedLevel.SIZE) continue
        for (var y = j - 1; y <= j + 1; y++) {
            if (y < 0 || y >= gSelctedLevel.SIZE) continue
            var currCell = gBoard[x][y]
            if (currCell.isShown) continue
            currCell.isRevealed = true
            currCell.isShown = true
            renderBoard(gBoard)
        }
    }
}

function hideNegsHint(i, j) {
    for (var x = i - 1; x <= i + 1; x++) {
        if (x < 0 || x >= gSelctedLevel.SIZE) continue
        for (var y = j - 1; y <= j + 1; y++) {
            if (y < 0 || y >= gSelctedLevel.SIZE) continue
            var currCell = gBoard[x][y]
            if (!currCell.isRevealed) continue
            currCell.isRevealed = false
            currCell.isShown = false
            renderBoard(gBoard)            
        }
    }
}

function handleHint(i, j) {
    revealNegsHint(i, j)
    gHintTimeout = setTimeout(function () {
        hideNegsHint(i, j)
        gHintIsOn = false
        gElHint.remove()
    }, 1000)
}

function renderHints() {
    var strHtml = '<tr>'
    for (var i = 0; i < 3; i++) {
        strHtml += `<td onclick="onHintClicked(this,${i})">${HINT}</td>`
    }
    var elHints = document.querySelector('.hints')
    elHints.innerHTML = strHtml
}