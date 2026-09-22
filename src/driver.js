import { Player, Computer } from "./player.js";
import { dom, modals } from "./domHandler.js";
import { pubSub } from "./pubsub.js";

class Driver {
  p1 = null;
  p2 = null;
  active = null;

  constructor() {
    // bound methods
    this.newGame_bound = this.newGame.bind(this);
    this.initGame_bound = this.initGame.bind(this);
    this.initP1Ships_bound = this.initP1Ships.bind(this);
    this.initP2Ships_bound = this.initP2Ships.bind(this);
    this.setShipEvents_bound = this.setShipEvents.bind(this);
    this.updateBoard_ShipPlaced_bound = this.updateBoard_ShipPlaced.bind(this);
    this.rotateShip_bound = this.rotateShip.bind(this);
    this.placeShip_bound = this.placeShip.bind(this);
    this.setShips_Randomize_bound = this.setShips_Randomize.bind(this);
    this.receiveAttack_bound = this.receiveAttack.bind(this);
    this.switchActivePlayer_bound = this.switchActivePlayer.bind(this);
    this.initComputerTurn_bound = this.initComputerTurn.bind(this);
    this.endGame_bound = this.endGame.bind(this);

    // pubsubs
    pubSub.on("gotInfo", this.initGame_bound);
    pubSub.on("initComplete", this.initP1Ships_bound);
    pubSub.on("setShipEvents", this.setShipEvents_bound);
    pubSub.on("rotateShip", this.rotateShip_bound);
    pubSub.on("shipPlaced", this.updateBoard_ShipPlaced_bound);
    pubSub.on("allShipsPlaced", this.initP2Ships_bound);
    pubSub.on("shipSelectRequest_Randomize", this.setShips_Randomize_bound);
    pubSub.on("placeShip", this.placeShip_bound);
    pubSub.on("receiveAttack", this.receiveAttack_bound);
    pubSub.on("turnComplete", this.switchActivePlayer_bound);
    pubSub.on("newTurn", this.initComputerTurn_bound);
    pubSub.on("endGame", this.endGame_bound);
    pubSub.on("newGame", this.newGame_bound);
  }

  //TODo: if randomize is active, pubsub for shipPlaced should be turned off, otherwise conflicting pubSubs will go off ane events will be out of order

  newGame() {
    this.clearGameData();
    dom.clearBoard();
    modals.closeAllModals();
    this.clearSubs();
    pubSub.on("turnComplete", this.switchActivePlayer_bound);
    this.getPlayers();
  }

  clearSubs() {
    const keys = Object.keys(pubSub.events);
    for (const key of keys) {
      if (key.charAt(0) === "p") {
        pubSub.events[key] = [];
      }
    }
  }

  getPlayers() {
    modals.getPlayers();
  }

  initPlayers(playerList) {
    if (playerList["p1-type"] === "human") {
      this.p1 = new Player("p1", playerList["p1-name"]);
    } else {
      this.p1 = new Computer("p1");
    }
    if (playerList["p2-type"] === "human") {
      this.p2 = new Player("p2", playerList["p2-name"]);
    } else {
      this.p2 = new Computer("p2");
    }
  }

  setOpponents() {
    if (this.p1.type === "computer") {
      this.p1.setOpponent(this.p2.data);
    }
    if (this.p2.type === "computer") {
      this.p2.setOpponent(this.p1.data);
    }
  }

  initGame(playerList) {
    this.initPlayers(playerList);
    this.setOpponents();
    this.active = this.p1;
    //
    dom.initBoardUI(this.p1, this.p2);
    pubSub.emit("initComplete", this.p1);
  }

  initP1Ships() {
    this.setShips(this.p1);
  }

  initP2Ships(player) {
    if (player.pCode === "p1") {
      this.setShips(this.p2);
    } else {
      dom.initP1(this.active.name);
      // pubSub.emit("newTurn", console.log("New turn"));
      pubSub.emit("setBoardEvents", player);
    }
  }

  setShipEvents(pCode) {
    console.log(pCode);
    if (this.p1.pCode === pCode) {
      dom.setShipSelectEvents(pCode);
      dom.setShipDropEvents(this.p1);
    }
    if (this.p2.pCode === pCode) {
      dom.setShipSelectEvents(pCode);
      dom.setShipDropEvents(this.p2);
    }
  }

  rotateShip(arr) {
    const pCode = arr[0];
    const shipName = arr[1];
    this[pCode].data.changeShipDirection(shipName);
  }

  placeShip(data) {
    console.log(data);
    const shipName = data[0];
    const pCode = data[1];
    const row = data[2];
    const col = data[3];
    this[pCode].data.placeShip(row, col, shipName);
  }

  setShips(player) {
    if (player.type === "player") {
      modals.showShipSelect(player);
    } else {
      console.log("computer's turn to place ships");
      player.data.placeShips_randomize(player.data.ships);
    }
  }

  setShips_Randomize(pCode) {
    if (pCode === "p1") {
      this.p1.data.placeShips_randomize(this.p1.data.ships);
    } else {
      this.p2.data.placeShips_randomize(this.p2.data.ships);
    }
  }

  updateBoard_ShipPlaced(data) {
    console.log(data);
    if (data[1] < 5) {
      // dom.updateBoard_ShipsPlaced(data[0]);
      // do nothing
    } else {
      console.log("All ships placed");
      pubSub.emit("allShipsPlaced", data[0]);
    }
  }

  receiveAttack(data) {
    const pCode = data[0];
    const row = data[1];
    const col = data[2];
    this[pCode].data.receiveAttack(row, col);
  }

  switchActivePlayer() {
    if (this.active.pCode === "p1") {
      this.active = this.p2;
    } else {
      this.active = this.p1;
    }
    dom.switchActiveBoard(this.active.pCode);
    console.log(`${this.active.name} is active`);
    pubSub.emit("newTurn", console.log("New turn"));
  }

  initComputerTurn() {
    if (this.active.type === "computer") {
      dom.disableBoards();
      setTimeout(() => {
        this.active.attackOpponent_bound();
      }, 500);
    }
  }

  clearGameData() {
    this.p1 = null;
    this.p2 = null;
    this.active = null;
  }

  endGame() {
    pubSub.off("turnComplete", this.switchActivePlayer_bound);
    dom.disableBoards();
    dom.declareWinner(this.active.name);
  }
}

export { Driver };

// Order of operations:

// init:
// get player/computer info
// generate boards
// place ships

// game starts:
// player selects a square
// gameboard.recieveAttack is called
// ~cascade of events~
// player turn ends
// players swap

// repeat steps for player 2/computer
// until all boats from 1 party are sunk
