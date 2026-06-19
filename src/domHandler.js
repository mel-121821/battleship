class DomHandler {
  constructor() {
    this.p1_DOMBoard = document.querySelector(".p1 .board");
    this.p2_DOMBoard = document.querySelector(".p2 .board");
  }

  generateBoard(board, element) {
    console.log(board);
    board.forEach((row) => {
      row.forEach((square, index) => {
        const squareBtn = document.createElement("button");
        squareBtn.classList.add("square");
        squareBtn.dataset.row = board.indexOf(row);
        squareBtn.dataset.col = index;
        element.appendChild(squareBtn);
      });
    });
  }

  initBoardUI(board1, board2) {
    this.generateBoard(board1, this.p1_DOMBoard);
    this.generateBoard(board2, this.p2_DOMBoard);
  }
}

const dom = new DomHandler();

export { dom };
