import { pubSub } from "./pubsub.js";

class DomHandler {
  constructor() {
    this.p1_DOMBoard = document.querySelector(".p1 .board");
    this.p2_DOMBoard = document.querySelector(".p2 .board");

    pubSub.on("receivedAttack", this.updateBoard_ReceivedAttack);
  }

  generateBoard(player, DOMBoard) {
    // generates an empty board, ships placed later
    const board = player.data.board;
    board.forEach((row) => {
      row.forEach((square) => {
        const squareBtn = document.createElement("button");
        squareBtn.classList.add("square");
        squareBtn.classList.add(`row_${square.row}`);
        squareBtn.classList.add(`col_${square.col}`);
        DOMBoard.appendChild(squareBtn);
        squareBtn.addEventListener("click", () => {
          player.data.receiveAttack(square.row, square.col);
        });
      });
    });
  }

  initBoardUI(board1, board2) {
    this.generateBoard(board1, this.p1_DOMBoard);
    this.generateBoard(board2, this.p2_DOMBoard);
  }

  updateBoard_ShipsPlaced(player) {
    const playerDom = document.querySelector(`.${player.pCode}`);
    const board = player.data.board;
    board.forEach((row) => {
      row.forEach((square) => {
        if (square.occupyingShipNode !== null) {
          const domSquare = playerDom.querySelector(
            `.row_${square.row}.col_${square.col}`
          );
          domSquare.classList.add("occupied");
        }
      });
    });
  }

  initP1() {
    this.p1_DOMBoard.style.pointerEvents = "none";
    console.log("p1 is active");
  }

  updateBoard_ReceivedAttack(square) {
    console.log(square);
    const attackedSquare = document.querySelector(
      `.${square.pCode} .row_${square.row}.col_${square.col}`
    );
    if (square.occupyingShipNode !== null) {
      attackedSquare.classList.add("hit");
    } else {
      attackedSquare.classList.add("receivedAttack");
    }
    pubSub.emit("turnComplete", square.pCode);
  }

  switchActiveBoard(pCode) {
    if (pCode === "p1") {
      this.p1_DOMBoard.style.pointerEvents = "none";
      this.p2_DOMBoard.style.pointerEvents = "auto";
    } else {
      this.p1_DOMBoard.style.pointerEvents = "auto";
      this.p2_DOMBoard.style.pointerEvents = "none";
    }
  }
}

const dom = new DomHandler();

export { dom };
