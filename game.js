var gBoard

const gCell = {
  minesAroundCount: 0,
  isShown: false,
  isMine: false,
  isMarked: true,
}

var gLevel = { SIZE: 4, MINES: 2 }

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
}


function initGame() {
  //This is called when page loads

  buildBoard()
  renderBoard(gBoard)

  console.log('gBoard:', gBoard)
}

function buildBoard() {
  // Builds the board
  // Set mines at random locations
  // Call setMinesNegsCount()
  // Return the created board

  gBoard = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    gBoard.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      gBoard[i][j] = { ...gCell }
    }
  }
  ///////
  for (var i = 0; i < gLevel.MINES; i++) {
    putMine(gBoard)
  }
  ////////
  setMinesNegsCount(gBoard)
}

function setMinesNegsCount(board) {
  // Count mines around each cell
  // and set the cell's minesAroundCount.
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

      strHTML += `<td onclick= "cellClicked(this, ${i}, ${j})" class="${className}"></td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'

  var container = document.querySelector('.board-container')
  container.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
  var cell = gBoard[i][j]

  cell.isShown = true

  elCell.innerText = cell.isMine ? '💣' : `${cell.minesAroundCount}`
}
// Called when a cell (td) is
// clicked

function cellMarked(elCell) {}
// Called on right click to mark a
// cell (suspected to be a mine)
// Search the web (and
// implement) how to hide the
// context menu on right click

function checkGameOver() {}
// Game ends when all mines are
// marked, and all the other cells
// are shown

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
    }
  }
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}
