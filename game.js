'use strict'

var gBoard

const MINE = '💣'

var gLevel = { LEVEL: 'easy', SIZE: 4, MINES: 2, LIVES: 1 }

var gGame

var gStartTime

var gSecInterval

var gMineLocations = []

var gSevenBoom = false

var gMegaHint = false

var gMegaHintCells = []

function initGame() {
  clearInterval(gSecInterval)
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: gLevel.MINES,
    secsPassed: 0,
    livesCount: gLevel.LIVES,
    moves: [],
  }

  gMineLocations = []

  buildBoard()
  renderBoard(gBoard)
  var timer = document.querySelector('.timer span')
  var restartButton = document.querySelector('.restart-button')
  var markedCount = document.querySelector('.marked-count')
  var lives = document.querySelector('.lives span')
  var megaHintButton = document.querySelector('.mega-hint')
  timer.innerText = gGame.secsPassed
  restartButton.innerText = '🙂'
  markedCount.innerText = gGame.markedCount
  lives.innerText = gGame.livesCount
  megaHintButton.className = 'mega-hint'
}

function buildBoard() {
  gBoard = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    gBoard.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      gBoard[i][j] = {
        color: 'rgb(72, 139, 143)',
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
  var strHTML = `<table class =${gLevel.LEVEL}><tbody>`
  for (var i = 0; i < board.length; i++) {
    strHTML += `<tr>`
    for (var j = 0; j < board[0].length; j++) {
      const className = `cell cell-${i}-${j}`

      strHTML += `<td  onclick= "cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, ${i}, ${j})" class="${className}"></td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'

  var container = document.querySelector('.game-board')
  container.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
  var cell = gBoard[i][j]
  var lives = document.querySelector('.lives span')

  if (!gGame.isOn) {
    gGame.isOn = true

    if (gSevenBoom) putSevenBoomMines(gBoard, i, j)
    else putMines(gBoard, i, j)

    setMinesNegsCount(gBoard)
    startTimer()
  }

  if (gMegaHint) {
    gMegaHintCells.push({ i: i, j: j })
    if (gMegaHintCells.length === 2) getMegaHint(gMegaHintCells)

    return
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
    if (!elCell.className.includes('opened')) elCell.className += ' opened'
    gGame.shownCount += 1
    cell.isShown = true
    if (cell.minesAroundCount === 0) {
      elCell.innerText = ''
      expandFull(i, j)
    } else {
      elCell.innerText = cell.minesAroundCount
    }
  }

  gGame.moves.push({ i: i, j: j })

  checkGameOver()
}

function cellMarked(event, i, j) {
  event.preventDefault()

  var marks = document.querySelector('.marked-count')

  if (!gGame.isOn) return

  var cell = gBoard[i][j]

  if (cell.isShown) return

  if (cell.isMarked) {
    cell.isMarked = false
    cell.isUnMarked = true

    gGame.markedCount += 1
  } else {
    if (gGame.markedCount === 0) return
    cell.isMarked = true
    gGame.markedCount -= 1
  }

  marks.innerText = gGame.markedCount

  event.target.innerText = cell.isMarked ? '🚩' : ''

  gGame.moves.push({ i: i, j: j })

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
      cellHTML.className += ' opened'
      if (currCell.minesAroundCount === 0) {
        cellHTML.innerText = ''
        expandFull(i, j)
      }
    }
  }
}

function putMines(idx1, idx2) {
  for (var y = 0; y < gLevel.MINES; y++) {
    var mineInCell = true
    while (mineInCell) {
      var i = getRandomIntInclusive(0, gLevel.SIZE - 1)
      var j = getRandomIntInclusive(0, gLevel.SIZE - 1)

      if (i === idx1 && j === idx2) continue

      if (!gBoard[i][j].isMine) {
        mineInCell = false
        gBoard[i][j].isMine = true
        gMineLocations.push({ i: i, j: j })
      }
    }
  }
}

function putSevenBoomMines(idx1, idx2) {
  var num = 0
  var mines = gLevel.MINES

  for (var i = 0; i < gLevel.SIZE; i++) {
    if (mines === 0) break
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (mines === 0) break
      if (i === idx1 && j === idx2) {
        num += 1
        continue
      }

      if (
        (num % 7 === 0 || Math.floor(num / 10) === 7 || num % 10 === 7) &&
        !gBoard[i][j].isMine &&
        num !== 0
      ) {
        gBoard[i][j].isMine = true

        gMineLocations.push({ i: i, j: j })

        mines -= 1
      }
      num += 1
    }
  }
}

function loseGame() {
  gGame.isOn = false

  var restartButton = document.querySelector('.restart-button')
  var board = document.querySelector('.game-board table')

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

  var size = +elButton.dataset.size
  var mines = +elButton.dataset.mines
  var level = elButton.dataset.level

  gLevel.SIZE = size
  gLevel.MINES = mines
  gLevel.LEVEL = level

  gLevel.LIVES = size !== 4 ? 3 : 1

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

function getSafeClick() {
  var safeClick = false

  var i
  var j

  while (!safeClick) {
    var i = getRandomIntInclusive(0, gBoard.length - 1)
    var j = getRandomIntInclusive(0, gBoard.length - 1)
    if (!gBoard[i][j].isMine) safeClick = true
  }

  var cellHTML = document.querySelector(`.cell-${i}-${j}`)
  cellHTML.style.backgroundColor = 'blue'

  setTimeout(() => {
    cellHTML.style.removeProperty('background-color')
  }, 3000)
}

function undoClick() {
  if (!gGame.isOn) return
  if (gGame.moves.length < 1) return

  var lastClick = gGame.moves.pop()

  var i = lastClick.i
  var j = lastClick.j

  var marks = document.querySelector('.marked-count')
  var cell = document.querySelector(`.cell-${i}-${j}`)
  var lives = document.querySelector('.lives span')

  if (gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = false
    gGame.markedCount += 1
    marks.innerText = gGame.markedCount
    cell.innerText = ''
  } else if (gBoard[i][j].isUnMarked) {
    gBoard[i][j].isMarked = true
    gGame.markedCount -= 1
    marks.innerText = gGame.markedCount
    cell.innerText = '🚩'
  } else if (gBoard[i][j].isExplode) {
    gBoard[i][j].isExplode = false
    gGame.livesCount += 1
    lives.innerText = gGame.livesCount
    cell.innerText = ''
  } else if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isShown) {
    gBoard[i][j].isShown = false
    cell.className = cell.className.replace('opened', '')
    undoExpand(i, j)
  } else {
    gBoard[i][j].isShown = false
    cell.className = cell.className.replace('opened', '')
    cell.innerText = ''
  }
}

function undoExpand(row, col) {
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j >= gBoard.length) continue
      var currCell = gBoard[i][j]
      if (currCell === gBoard[row][col] || !currCell.isShown) continue
      currCell.isShown = false
      gGame.shownCount -= 1
      var cellHTML = document.querySelector(`.cell-${i}-${j}`)
      if (currCell.minesAroundCount > 0) cellHTML.innerText = ''
      cellHTML.className = cellHTML.className.replace('opened', '')
      if (currCell.minesAroundCount === 0) {
        undoExpand(i, j)
      }
    }
  }
}

function changeLight(elButton) {
  var page = document.querySelector('body')
  var mode = document.querySelector('.light-switch span')

  page.className = page.className === 'light-mode' ? 'dark-mode' : 'light-mode'

  mode.innerText =
    page.className === 'light-mode' ? ' Dark Mode' : ' Light Mode'

  elButton.style.color = page.className === 'light-mode' ? 'black' : 'yellow'
}

function on7Boom() {
  gSevenBoom = true
}

function onMegaHint() {
  gMegaHint = true
}

function getMegaHint(cells) {
  var megaHintButton = document.querySelector('.mega-hint')

  gMegaHint = false
  megaHintButton.className += ' hidden'

  var cell1 = cells[0]
  var cell2 = cells[1]

  for (var i = cell1.i; i <= cell2.i; i++) {
    for (var j = cell1.j; j <= cell2.j; j++) {
      var currCell = document.querySelector(`.cell-${i}-${j}`)
      if (gBoard[i][j].isMine) {
        currCell.innerText = MINE
      }
      if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount > 0) {
        currCell.innerText = gBoard[i][j].minesAroundCount
      }
      currCell.className += ' peaked'
    }
  }

  setTimeout(() => {
    var peakedCells = document.querySelectorAll('.peaked')
    for (var i = 0; i < peakedCells.length; i++) {
      if (!peakedCells[i].className.includes('open'))
        peakedCells[i].innerText = ''
      peakedCells[i].className = peakedCells[i].className.replace('peaked', '')
    }
  }, 2000)
}
