import { pubSub } from "./pubsub.js";

// TODO: fix all dependancies on indexed classlists as browsers can change class order.

class DomHandler {
  // heading
  p1_heading = document.querySelector("#p1 .name");
  p2_heading = document.querySelector("#p2 .name");

  // ships
  p1_ships = document.querySelectorAll("#p1 .ship-select img");
  p2_ships = document.querySelectorAll("#p2 .ship-select img");

  // Boards
  allBoards = document.querySelectorAll(".board");
  p1_DOMBoard = document.querySelector("#p1 .board");
  p2_DOMBoard = document.querySelector("#p2 .board");

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

  getShipTarget() {
    return this.shipTarget_Dragging;
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
    const shipSelectNode = document.querySelector(
      `#${player.pCode} .${shipName} img`
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
        squareBtn.setAttribute("row", square.row);
        squareBtn.setAttribute("col", square.col);
        DOMBoard.appendChild(squareBtn);
      });
    });
  }

  setShipDropEvents(player) {
    // cycle through squares
    console.log("setBoardEvents called");
    const squareNodes = document.querySelectorAll(`#${player.pCode} .square`);
    for (let i = 0; i < squareNodes.length; i++) {
      const square = squareNodes[i];
      square.addEventListener("dragover", events.dragover_bound);
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
        square.removeEventListener("dragover", events.dragover_bound);
        square.removeEventListener("dragenter", events.dragenter);
        square.removeEventListener("dragleave", events.dragleave);
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
    this.updatePlayerNames(player1.name, player2.name);
  }

  updatePlayerNames(player1, player2) {
    this.p1_heading.textContent = player1;
    this.p2_heading.textContent = player2;
  }

  updateBoard_ShipsPlaced(arr) {
    const player = arr[0];
    const playerDom = document.querySelector(`#${player.pCode}`);
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
      `#${square.pCode} .row_${square.row}.col_${square.col}`
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
  shipVariations = {
    carrier: 5,
    battleship: 4,
    destroyer: 3,
    submarine: 3,
    ["patrol-boat"]: 2,
  };

  constructor() {
    this.dragover_bound = this.dragover.bind(this);
  }

  getPlayerInfo(e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    modals.closeForm(e);
    pubSub.emit("gotInfo", formData);
  }

  requestRandomize(e) {
    e.preventDefault();
    const pCode = e.target.closest("dialog").parentElement.id;
    pubSub.emit("shipSelectRequest_Randomize", pCode);
    modals.closeForm(e);
  }

  requestPickOwn(e) {
    e.preventDefault();
    const pCode = e.target.closest("dialog").parentElement.id;
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
    const shipName = e.target.closest("div").className;
    e.dataTransfer.setData("text/plain", shipName);
    dom.shipTarget_Dragging = e.target;
    e.target.classList.add("dragging");
    if (shipName === "carrier") {
      e.dataTransfer.setDragImage(e.target, 25, 70);
    } else if (shipName === "battleship") {
      e.dataTransfer.setDragImage(e.target, 20, 60);
    } else if (shipName === "patrol-boat") {
      e.dataTransfer.setDragImage(e.target, 10, 40);
    } else {
      e.dataTransfer.setDragImage(e.target, 15, 50);
    }
  }

  dragend(e) {
    console.log("dragging stopped");
    // this.shipTarget_Dragging = null;
    e.target.classList.remove("dragging");
  }

  rotate(e) {
    const pCode = e.target.closest(".column").id;
    const shipName = e.target.closest("div").className;
    e.target.classList.toggle("y-axis");
    console.log(pCode, shipName, e.target);
    pubSub.emit("rotateShip", [pCode, shipName]);
  }

  dragover(e) {
    e.preventDefault(); // prevent default to allow drop
    const pCode = e.target.closest(".column").id;
    let row = parseInt(e.target.getAttribute("row"));
    let col = parseInt(e.target.getAttribute("col"));
    const activeShip = dom.getShipTarget();
    const activeShipName = activeShip.parentElement.className;
    const shipLength = this.shipVariations[activeShipName];
    for (let i = 0; i < shipLength; i++) {
      let nextSquare;
      if (activeShip.classList.contains("y-axis")) {
        const newRow = row++;
        nextSquare = document.querySelector(
          `#${pCode} .row_${newRow}.col_${col}`
        );
      } else {
        const newCol = col++;
        nextSquare = document.querySelector(
          `#${pCode} .row_${row}.col_${newCol}`
        );
      }
      nextSquare.classList.add("highlighted");
    }
  }

  dragenter(e) {
    e.target.classList.add("dragover"); // highlight dropZone when dragable element enters
  }

  dragleave(e) {
    e.target.classList.remove("dragover"); // reset bg when dragable element leaves it
    const board = e.target.closest(".board");
    for (let i = 0; i < board.childNodes.length; i++) {
      if (board.childNodes[i].classList.contains("highlighted"))
        board.childNodes[i].classList.remove("highlighted");
    }
  }

  drop(e) {
    e.preventDefault(); // prevent default (open as link for some elements)
    const square = e.target;
    const shipName = e.dataTransfer.getData("text/plain");
    const pCode = square.closest(".column").id;
    const row = parseInt(e.target.getAttribute("row"));
    const col = parseInt(e.target.getAttribute("col"));
    pubSub.emit("placeShip", [shipName, pCode, row, col]);
  }

  receiveAttack(e) {
    const pCode = e.target.closest(".column").id;
    const row = parseInt(e.target.getAttribute("row"));
    const col = parseInt(e.target.getAttribute("col"));
    pubSub.emit("receiveAttack", [pCode, row, col]);
  }
}

class Modal {
  playerInfo = document.querySelector("dialog");
  playerInfo_Submit = document.querySelector(".start form");

  endGame = document.querySelector(".end-game");
  endGame_Winner = document.querySelector(".end-game span");
  endGame_Close = document.querySelector(".close");
  endGame_PlayAgain = document.querySelector(".replay");

  p1ShipSelect = document.querySelector("#p1 .ships-dialog");
  p1ShipSelect_span = document.querySelector("#p1 .ships-dialog span");
  p1ShipSelect_PickOwnShips_Btn = document.querySelector(
    "#p1 .ships-dialog .pick"
  );
  p1ShipSelect_Randomize = document.querySelector(
    "#p1 .ships-dialog .randomize"
  );

  p2ShipSelect = document.querySelector("#p2 .ships-dialog");
  p2ShipSelect_span = document.querySelector("#p2 .ships-dialog span");
  p2ShipSelect_PickOwnShips_Btn = document.querySelector(
    "#p2 .ships-dialog .pick"
  );
  p2ShipSelect_Randomize = document.querySelector(
    "#p2 .ships-dialog .randomize"
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
