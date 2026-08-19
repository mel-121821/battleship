import { pubSub } from "./pubsub.js";

class DomHandler {
  // Modals
  startModal = document.querySelector("dialog");
  startModal_Submit = document.querySelector(".start form");
  endGameModal = document.querySelector(".end-game");
  endGameModal_Winner = document.querySelector(".end-game span");
  endGameModal_Close = document.querySelector(".close");
  endGameModal_PlayAgain = document.querySelector(".replay");

  // Boards
  p1_DOMBoard = document.querySelector(".p1 .board");
  p2_DOMBoard = document.querySelector(".p2 .board");

  constructor() {
    // Event listeners
    this.startModal_Submit.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(this.startModal_Submit));
      this.closeModal(e);
      pubSub.emit("gotInfo", formData);
    });

    this.endGameModal_Close.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeModal(e);
    });

    this.endGameModal_PlayAgain.addEventListener("click", (e) => {
      e.preventDefault();
      pubSub.emit("newGame", console.log("New game"));
    });

    // Pubsubs
    pubSub.on("receivedAttack", this.updateBoard_ReceivedAttack);
    pubSub.on("shipsPlaced", this.updateBoard_ShipsPlaced);
  }

  showStartModal() {
    this.startModal.showModal();
  }

  closeModal(e) {
    const parentForm = e.target.closest("form");
    const parentModal = e.target.closest("dialog");
    if (parentForm !== null) {
      parentForm.reset();
    }
    parentModal.close();
  }

  closeEndGameModal() {
    this.endGameModal.close();
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

  initBoardUI(player1, player2) {
    this.generateBoard(player1, this.p1_DOMBoard);
    this.generateBoard(player2, this.p2_DOMBoard);
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

  initP1(activePlayer) {
    this.p1_DOMBoard.style.pointerEvents = "none";
    this.p2_DOMBoard.style.pointerEvents = "auto";
    console.log(`${activePlayer} is active`);
  }

  updateBoard_ReceivedAttack(square) {
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

  disableBoards() {
    this.p1_DOMBoard.style.pointerEvents = "none";
    this.p2_DOMBoard.style.pointerEvents = "none";
  }

  clearBoard() {
    this.p1_DOMBoard.innerHTML = "";
    this.p2_DOMBoard.innerHTML = "";
  }

  declareWinner(playerName) {
    console.log(`${playerName} wins!`);
    this.endGameModal.showModal();
    this.endGameModal_Winner.textContent = playerName;
  }
}

const dom = new DomHandler();

export { dom };
