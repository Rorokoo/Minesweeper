var gBoard

const MINE = '💣'

var gLevel = { SIZE: 4, MINES: 2, LIVES: 1 }

var gGame

var gStartTime

var gSecInterval

var gMineLocations = []

function initGame() {
  clearInterval(gSecInterval)
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: gLevel.MINES,
    secsPassed: 0,
    livesCount: gLevel.LIVES,
  }

  gMineLocations = []

  buildBoard()
  renderBoard(gBoard)
  var timer = document.querySelector('.timer span')
  var restartButton = document.querySelector('.restart-button')
  var markedCount = document.querySelector('.marked-count')
  var lives = document.querySelector('.lives span')
  timer.innerText = gGame.secsPassed
  restartButton.innerText = '🙂'
  markedCount.innerText = gGame.markedCount
  lives.innerText = gGame.livesCount
}

function buildBoard() {
  gBoard = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    gBoard.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      gBoard[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
    }
  }
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
  var lives = document.querySelector('.lives span')

  if (!gGame.isOn) {
    gGame.isOn = true
    putMines(gBoard, i, j)
    setMinesNegsCount(gBoard)
    startTimer()
  }
  if (cell.isMarked) return

  if (cell.isMine) {
    if (cell.isExplode) return
    cell.isExplode = true
    gGame.livesCount -= 1
    lives.innerText = gGame.livesCount
    if (gGame.livesCount === 0) {
      loseGame()
      return
    }
    elCell.innerText = MINE
  } else {
    elCell.innerText = cell.minesAroundCount
    gGame.shownCount += 1
    cell.isShown = true
    if (cell.minesAroundCount === 0) {
      expandFull(i, j)
    }
  }

  checkGameOver()
}

function cellMarked(event, i, j) {
  event.preventDefault()

  var marks = document.querySelector('.marked-count')

  if (!gGame.isOn) {
    gGame.isOn = true
    startTimer()
  }

  var cell = gBoard[i][j]

  if (cell.isShown) return

  if (cell.isMarked) {
    cell.isMarked = false
    gGame.markedCount += 1
  } else {
    if (gGame.markedCount === 0) return
    cell.isMarked = true
    gGame.markedCount -= 1
  }

  marks.innerText = gGame.markedCount

  event.target.innerText = cell.isMarked ? '🚩' : ''

  checkGameOver()
}

function checkGameOver() {
  var board = document.querySelector('table')
  var restartButton = document.querySelector('.restart-button')

  if (
    gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES &&
    gGame.markedCount === 0
  ) {
    gGame.isOn = false
    clearInterval(gSecInterval)

    board.style.pointerEvents = 'none'
    restartButton.innerText = '😎'

    getHighestScore()
  }
}

function expandFull(row, col) {
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
      if (currCell.minesAroundCount === 0) {
        expandFull(i, j)
      }
    }
  }
}

function putMines(board, idx1, idx2) {
  for (var y = 0; y < gLevel.MINES; y++) {
    var mineInCell = true
    while (mineInCell) {
      var i = getRandomIntInclusive(0, gLevel.SIZE - 1)
      var j = getRandomIntInclusive(0, gLevel.SIZE - 1)
      if (i === idx1 && j === idx2) continue
      if (!board[i][j].isMine) {
        mineInCell = false
        board[i][j].isMine = true
        gMineLocations.push({ i: i, j: j })
      }
    }
  }
}

function loseGame() {
  gGame.isOn = false

  var restartButton = document.querySelector('.restart-button')
  var board = document.querySelector('table')

  restartButton.innerText = '🤯'
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
  if (size !== 4) gLevel.LIVES = 3

  initGame()
}
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getHighestScore() {
  var prevScore

  if (gLevel.SIZE === 4) {
    prevScore = localStorage.getItem('EasyBest')

    if (prevScore > gGame.secsPassed) {
      localStorage.setItem('EasyBest', gGame.secsPassed)
    }
  }
  if (gLevel.SIZE === 8) {
    prevScore = localStorage.getItem('MediumBest')
    if (prevScore > gGame.secsPassed) {
      localStorage.setItem('MediumBest', gGame.secsPassed)
    }
  }

  if (gLevel.SIZE === 12) {
    prevScore = localStorage.getItem('HardBest')
    if (prevScore > gGame.secsPassed) {
      localStorage.setItem('HardBest', gGame.secsPassed)
    }
  }
}
