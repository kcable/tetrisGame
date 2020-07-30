const canv = document.getElementById("tetris");
const ctx = canv.getContext("2d");
const scoreElement = document.getElementById("score");
document.addEventListener("keydown", CONTROL);
let gameOver = false;
const ROW = 20;
const COL = 10;
const SQ = 20;
const EMPTY = "BLACK";
const Test = "GREEN";
const PIECES = [
  [Z, "red"],
  [S, "blue"],
  [T, "green"],
  [O, "cyan"],
  [L, "purple"],
  [I, "yellow"],
  [J, "orange"]
];
let score = 0;
let dropStart = Date.now();

function randomPice() {
  let r = (randomN = Math.floor(Math.random() * PIECES.length));

  return new Piece(PIECES[r][0], PIECES[r][1]);
}
let p = randomPice();

function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
  ctx.strokeStyle = "WHITE";
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

let board = [];
for (let r = 0; r < ROW; r++) {
  board[r] = [];
  for (let c = 0; c < COL; c++) {
    board[r][c] = EMPTY;
  }
}

function drawBoard() {
  for (let r = 0; r < ROW; r++) {
    for (let c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}

drawBoard();
function Piece(tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;
  this.tetrominoN = 0; //always star from first variation
  this.activeTetromino = this.tetromino[this.tetrominoN];
  this.x = 3;
  this.y = -2;
}

Piece.prototype.fill = function(color) {
  for (let r = 0; r < this.activeTetromino.length; r++) {
    for (let c = 0; c < this.activeTetromino.length; c++) {
      if (this.activeTetromino[r][c]) {
        //draw only suqares with 1 in them
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};

Piece.prototype.draw = function() {
  this.fill(this.color);
};

Piece.prototype.unDraw = function() {
  this.fill(EMPTY);
};

Piece.prototype.MoveDown = function() {
  if (!this.colission(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    //lock pice and drop a new one
    this.lock();
    p = randomPice();
  }
};

Piece.prototype.MoveRight = function() {
  if (!this.colission(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
};

Piece.prototype.MoveLeft = function() {
  if (!this.colission(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
};

Piece.prototype.Rotate = function() {
  let nextPattern = this.tetromino[
    (this.tetrominoN + 1) % this.tetromino.length
  ];
  let kick = 0;
  if (this.colission(0, 0, nextPattern)) {
    if (this.x > COL / 2) {
      console.log(" right colision");
      kick = -1;
      //this.unDraw();
    } else {
      //left wall
      //this.unDraw();
      kick = 1; // move to the right
    }
    this.unDraw();
    this.x += kick;
    this.tetrominoN = this.tetrominoN % this.tetromino.length;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
  if (!this.colission(0, 0, nextPattern)) {
    this.unDraw();
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
};

Piece.prototype.colission = function(x, y, piece) {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece.length; c++) {
      // if square empty we skip it
      if (!piece[r][c]) {
        continue;
      }
      let newX = this.x + c + x;
      let newY = this.y + r + y;
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true;
      }
      // skip newY < 0 no -1 index ...
      if (newY < 0) {
        continue;
      }

      if (board[newY][newX] != EMPTY) {
        return true;
      }
    }
  }
  return false; // if all conditions are not met return FALSE which means the pice does not colide and it can moove
};

Piece.prototype.lock = function() {
  for (let r = 0; r < this.activeTetromino.length; r++) {
    for (let c = 0; c < this.activeTetromino.length; c++) {
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      if (this.y + r < 0) {
        alert("GAME OVER");
        gameOver = true;
        break;
      }

      board[this.y + r][this.x + c] = this.color;
    }
  }
  for (r = 0; r < ROW; r++) {
    let fullRow = true;
    for (c = 0; c < COL; c++) {
      fullRow = fullRow && board[r][c] != EMPTY;
    }

    if (fullRow) {
      let y;
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) {
          board[y][c] = board[y - 1][c];
        }
      }

      for (c = 0; c < COL; c++) {
        board[y][c] = EMPTY;
      }

      score += 10;
    }
  }

  drawBoard();
  scoreElement.innerText = score;
};

function CONTROL(event) {
  if (event.keyCode == 37) {
    p.MoveLeft();
    dropStart = Date.now();
  } else if (event.keyCode == 38) {
    p.Rotate();
    dropStart = Date.now();
  } else if (event.keyCode == 39) {
    p.MoveRight();
    dropStart = Date.now();
  } else if (event.keyCode == 40) {
    p.MoveDown();
    dropStart = Date.now();
  }
}

function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > 1000) {
    p.MoveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}
p.draw();
drop();
