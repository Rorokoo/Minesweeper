var gBoard

const gCell = {
  minesAroundCount: 0,
  isShown: false,
  isMine: false,
  isMarked: false,
}

const MINE = '💣'

var gLevel = { SIZE: 4, MINES: 2 }

var gGame

var gStartTime

var gSecInterval

var gMineLocations = []

function initGame() {
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
  }

  gMineLocations = []

  buildBoard()
  renderBoard(gBoard)
  var timer = document.querySelector('.timer span')
  timer.innerText = gGame.secsPassed
}

function buildBoard() {
  gBoard = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    gBoard.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      gBoard[i][j] = { ...gCell }
    }
  }

  for (var i = 0; i < gLevel.MINES; i++) {
    putMine(gBoard)
  }

  setMinesNegsCount(gBoard)
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var checkedCell = board[i][j]

      var rowIdx = i
      var colIdx = j
      for (var r = rowIdx - 1; r <= rowIdx + 1; r++) {
        if (r < 0 || r >= board.length) continue

        for (var c = colIdx - 1; c <= colIdx + 1; c++) {
          if (c < 0 || c >= board.length) continue
          var currCell = board[r][c]
          if (currCell.isMine) checkedCell.minesAroundCount += 1
        }
      }
    }
  }
}

function renderBoard(board) {
  var strHTML = '<table><tbody>'
  for (var i = 0; i < board.length; i++) {
    strHTML += `<tr>`
    for (var j = 0; j < board[0].length; j++) {
      const className = `cell cell-${i}-${j}`

      strHTML += `<td  onclick= "cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, ${i}, ${j})" class="${className}"></td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'

  var container = document.querySelector('.board-container')
  container.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
  var cell = gBoard[i][j]

  if (cell.isMine) {
    loseGame()
    return
  }

  if (cell.isMarked) return

  if (!gGame.isOn) {
    gGame.isOn = true
    startTimer()
  }

  cell.isShown = true
  gGame.shownCount += 1

  elCell.innerText = cell.minesAroundCount
  if (cell.minesAroundCount === 0) {
    openNeighbors(i, j)
  }

  checkGameOver()
}

function cellMarked(event, i, j) {
  event.preventDefault()

  if (!gGame.isOn) {
    gGame.isOn = true
    startTimer()
  }

  var cell = gBoard[i][j]

  if (cell.isShown) return

  if (cell.isMarked) {
    cell.isMarked = false
    gGame.markedCount -= 1
  } else {
    cell.isMarked = true
    gGame.markedCount += 1
  }

  event.target.innerText = cell.isMarked ? '🚩' : ''

  checkGameOver()
}

function checkGameOver() {
  var board = document.querySelector('table')

  if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
    gGame.isOn = false
    clearInterval(gSecInterval)
    board.style.pointerEvents = 'none'
    alert('victory!')
  }
}

function expandShown(board, elCell, i, j) {}
// When user clicks a cell with no
// mines around, we need to open
// not only that cell, but also its
// neighbors.
// NOTE: start with a basic
// implementation that only opens
// the non-mine 1st degree  neighbors

// BONUS: if you have the time
// later, try to work more like the
// real algorithm (see description
// at the Bonuses section below)

function putMine(board) {
  var mineInCell = true

  while (mineInCell) {
    var i = getRandomIntInclusive(0, gLevel.SIZE - 1)
    var j = getRandomIntInclusive(0, gLevel.SIZE - 1)

    if (!board[i][j].isMine) {
      mineInCell = false
      board[i][j].isMine = true
      gMineLocations.push({ i: i, j: j })
    }
  }
}

function loseGame() {
  gGame.isOn = false

  var board = document.querySelector('table')

  board.style.pointerEvents = 'none'

  clearInterval(gSecInterval)
  for (var y = 0; y < gMineLocations.length; y++) {
    var i = gMineLocations[y].i
    var j = gMineLocations[y].j
    var cellHTML = document.querySelector(`.cell-${i}-${j}`)
    cellHTML.innerHTML = MINE
  }
}

function startTimer() {
  gStartTime = Date.now()
  gSecInterval = setInterval(updateTimer, 100)
}

function updateTimer() {
  var diff = Date.now() - gStartTime
  var inSeconds = (diff / 1000).toFixed(0)
  gGame.secsPassed = inSeconds
  document.querySelector('.timer span').innerText = gGame.secsPassed
}

function startLevel(elButton) {
  clearInterval(gSecInterval)

  var size = elButton.dataset.size
  var mines = elButton.dataset.mines

  gLevel.SIZE = size
  gLevel.MINES = mines

  initGame()
}

function openNeighbors(row, col) {
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j >= gBoard.length) continue
      var currCell = gBoard[i][j]
      if (currCell === gBoard[row][col] || currCell.isShown) continue
      currCell.isShown = true
      gGame.shownCount += 1
      var cellHTML = document.querySelector(`.cell-${i}-${j}`)
      cellHTML.innerText = currCell.minesAroundCount
    }
  }
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}
