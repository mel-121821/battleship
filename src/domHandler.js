import { pubSub } from "./pubsub.js";

class DomHandler {
  // ships
  p1_ships = document.querySelectorAll(".p1 .ship img");
  p2_ships = document.querySelectorAll(".p2 .ship img");

  // Boards
  allBoards = document.querySelectorAll(".board");
  p1_DOMBoard = document.querySelector(".p1 .board");
  p2_DOMBoard = document.querySelector(".p2 .board");

  shipTarget_Dragging = null;

  constructor() {
    // bound fn()s
    this.removeShipDropEvents_bound = this.removeShipDropEvents.bind(this);
    this.setGameEvents_bound = this.setGameEvents.bind(this);

    // Pubsubs
    pubSub.on("receivedAttack", this.updateBoard_ReceivedAttack);
    pubSub.on("shipPlaced", this.updateBoard_ShipsPlaced);
    pubSub.on("shipPlaced", this.removeShipSelectEvents);
    pubSub.on("setBoardEvents", this.removeShipDropEvents_bound);
    pubSub.on("shipSelectEventsRemoved", this.setGameEvents_bound);

    // pubSub.on("shipsPlaced", this.closeAllModals);
  }

  setShipSelectEvents(pCode) {
    const nodeList = this[`${pCode}_ships`];
    console.log(nodeList);
    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i].setAttribute("draggable", true);
      nodeList[i].addEventListener("dragstart", events.dragstart);
      nodeList[i].addEventListener("dragend", events.dragend);
      nodeList[i].addEventListener("click", events.rotate);
    }
  }

  removeShipSelectEvents(shipData) {
    const player = shipData[0];
    const shipName = shipData[2];
    console.log(`removing events from ${shipName}`);
    const shipSelectNode = document.querySelector(
      `.${player.pCode} .${shipName} img`
    );
    shipSelectNode.classList.remove("dragging");
    shipSelectNode.setAttribute("draggable", false);
    shipSelectNode.classList.remove("dragover");
    shipSelectNode.removeEventListener("dragstart", events.dragstart);
    shipSelectNode.removeEventListener("dragend", events.dragend);
    shipSelectNode.removeEventListener("click", events.rotate);
  }

  generateBoard(player, DOMBoard) {
    // generates an empty board, ships placed later
    const board = player.data.board;
    board.forEach((row) => {
      row.forEach((square) => {
        const squareBtn = document.createElement("button");
        squareBtn.classList.add(
          "square",
          `row_${square.row}`,
          `col_${square.col}`
        );
        DOMBoard.appendChild(squareBtn);
      });
    });
  }

  setShipDropEvents(player) {
    // cycle through squares
    console.log("setBoardEvents called");
    const squareNodes = document.querySelectorAll(`.${player.pCode} .square`);
    for (let i = 0; i < squareNodes.length; i++) {
      const square = squareNodes[i];
      square.addEventListener("dragover", events.dragover);
      square.addEventListener("dragenter", events.dragenter);
      square.addEventListener("dragleave", events.dragleave);
      square.addEventListener("drop", events.drop);
    }
  }

  removeShipDropEvents() {
    for (let i = 0; i < this.allBoards.length; i++) {
      const squareNodes = this.allBoards[i].childNodes;
      for (let i = 0; i < squareNodes.length; i++) {
        const square = squareNodes[i];
        square.removeEventListener("dragover", events.dragover);
        square.removeEventListener("dragenter", events.dragenter);
        square.removeEventListener("dragleave", events.dragleave);

        // the following event is not being removed, likely because the fn was declared in a closure that is not accessble by this function, and it does not work to simply create a reference of it - if has to be the actual fn
        // TODO: find a workarond that uses the actual fn, not a reference of it - may need to find another method to
        square.removeEventListener("drop", events.drop);
      }
    }
    pubSub.emit("shipSelectEventsRemoved");
  }

  setGameEvents() {
    for (let i = 0; i < this.allBoards.length; i++) {
      const squareNodes = this.allBoards[i].childNodes;
      for (let i = 0; i < squareNodes.length; i++) {
        const square = squareNodes[i];
        square.addEventListener("click", events.receiveAttack);
      }
    }
    pubSub.emit("newTurn", console.log("New turn"));
  }

  initBoardUI(player1, player2) {
    this.generateBoard(player1, this.p1_DOMBoard);
    this.generateBoard(player2, this.p2_DOMBoard);
  }

  updateBoard_ShipsPlaced(arr) {
    const player = arr[0];
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
    modals.endGame.showModal();
    modals.endGame_Winner.textContent = playerName;
  }
}

class Events {
  constructor() {}

  getPlayerInfo(e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    modals.closeForm(e);
    pubSub.emit("gotInfo", formData);
  }

  requestRandomize(e) {
    e.preventDefault();
    const pCode = e.target.closest("dialog").classList[0].slice(0, 2);
    pubSub.emit("shipSelectRequest_Randomize", pCode);
    modals.closeForm(e);
  }

  requestPickOwn(e) {
    e.preventDefault();
    const pCode = e.target.closest("dialog").classList[0].slice(0, 2);
    console.log(pCode);
    pubSub.emit("setShipEvents", pCode);
    modals.closeForm(e);
  }

  closeModal(e) {
    e.preventDefault();
    modals.closeForm(e);
  }

  requestNewGame(e) {
    e.preventDefault();
    pubSub.emit("newGame", console.log("New game"));
  }

  dragstart(e) {
    console.log("dragging");
    e.dataTransfer.setData("text/plain", e.target.closest("div").classList[1]);
    dom.shipTarget_Dragging = e.target;
    e.target.classList.add("dragging");
  }

  dragend(e) {
    console.log("dragging stopped");
    // this.shipTarget_Dragging = null;
    e.target.classList.remove("dragging");
  }

  rotate(e) {
    console.log(e.target);
    console.log(e.target.closest(".column").classList[0]);
    const data = [e.target.closest(".column").classList[0]];
    data.push(e.target.closest("div").classList[1]);
    console.log(data);
    pubSub.emit("rotateShip", data);
    data.pop(); // remove after use, as shipName will be re-added on every click
  }

  dragover(e) {
    e.preventDefault(); // prevent default to allow drop
  }

  dragenter(e) {
    console.log(`dragover ${e.target.classList}`);
    e.target.classList.add("dragover"); // highlight dropZone when dragable element enters
  }

  dragleave(e) {
    e.target.classList.remove("dragover"); // reset bg when dragable element leaves it
  }

  drop(e) {
    e.preventDefault(); // prevent default (open as link for some elements)
    const data = [];
    const square = e.target;
    const shipName = e.dataTransfer.getData("text/plain");
    const pCode = square.closest(".column").classList[0];
    const row = square.classList[1].charAt(square.classList[1].length - 1);
    const col = square.classList[2].charAt(square.classList[2].length - 1);
    data.push(shipName, pCode, row, col);
    pubSub.emit("placeShip", data);
  }

  receiveAttack(e) {
    const data = [];
    const square = e.target;
    const pCode = e.target.closest(".column").classList[0];
    const row = square.classList[1].charAt(square.classList[1].length - 1);
    const col = square.classList[2].charAt(square.classList[2].length - 1);
    data.push(pCode, row, col);
    pubSub.emit("receiveAttack", data);
  }
}

class Modal {
  playerInfo = document.querySelector("dialog");
  playerInfo_Submit = document.querySelector(".start form");

  endGame = document.querySelector(".end-game");
  endGame_Winner = document.querySelector(".end-game span");
  endGame_Close = document.querySelector(".close");
  endGame_PlayAgain = document.querySelector(".replay");

  p1ShipSelect = document.querySelector(".p1-ships-dialog");
  p1ShipSelect_span = document.querySelector(".p1-ships-dialog span");
  p1ShipSelect_PickOwnShips_Btn = document.querySelector(
    ".p1-ships-dialog .pick"
  );
  p1ShipSelect_Randomize = document.querySelector(
    ".p1-ships-dialog .randomize"
  );

  p2ShipSelect = document.querySelector(".p2-ships-dialog");
  p2ShipSelect_span = document.querySelector(".p2-ships-dialog span");
  p2ShipSelect_PickOwnShips_Btn = document.querySelector(
    ".p2-ships-dialog .pick"
  );
  p2ShipSelect_Randomize = document.querySelector(
    ".p2-ships-dialog .randomize"
  );

  allModals = document.querySelectorAll("dialog");

  constructor() {
    // Event listeners
    this.playerInfo_Submit.addEventListener("submit", events.getPlayerInfo);
    this.p1ShipSelect_Randomize.addEventListener(
      "click",
      events.requestRandomize
    );
    this.p2ShipSelect_Randomize.addEventListener(
      "click",
      events.requestRandomize
    );
    this.p1ShipSelect_PickOwnShips_Btn.addEventListener(
      "click",
      events.requestPickOwn
    );
    this.p2ShipSelect_PickOwnShips_Btn.addEventListener(
      "click",
      events.requestPickOwn
    );
    this.endGame_Close.addEventListener("click", events.closeModal);
    this.endGame_PlayAgain.addEventListener("click", events.requestNewGame);
  }

  getPlayers() {
    this.playerInfo.showModal();
  }

  showShipSelect(player) {
    if (player.pCode === "p1") {
      this.p1ShipSelect.showModal();
      this.p1ShipSelect_span.textContent = player.name;
    } else {
      this.p2ShipSelect.showModal();
      this.p2ShipSelect_span.textContent = player.name;
    }
  }

  closeForm(e) {
    const parentForm = e.target.closest("form");
    const parentModal = e.target.closest("dialog");
    if (parentForm !== null) {
      parentForm.reset();
    }
    parentModal.close();
  }

  closeAllModals() {
    this.allModals.forEach((modal) => {
      modal.close();
    });
  }
}

const dom = new DomHandler();
const events = new Events();
const modals = new Modal();

export { dom, modals };
