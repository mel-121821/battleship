import { Player, Computer } from "./player.js";
import { dom } from "./domHandler.js";
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
    this.setShips_Randomize_bound = this.setShips_Randomize.bind(this);
    this.switchActivePlayer_bound = this.switchActivePlayer.bind(this);
    this.initComputerTurn_bound = this.initComputerTurn.bind(this);
    this.endGame_bound = this.endGame.bind(this);

    // pubsubs
    pubSub.on("gotInfo", this.initGame_bound);
    pubSub.on("initComplete", this.initP1Ships_bound);
    pubSub.on("shipsPlaced", this.initP2Ships_bound);
    pubSub.on("shipSelectRequest_Randomize", this.setShips_Randomize_bound);
    pubSub.on("turnComplete", this.switchActivePlayer_bound);
    pubSub.on("newTurn", this.initComputerTurn_bound);
    pubSub.on("endGame", this.endGame_bound);
    pubSub.on("newGame", this.newGame_bound);
  }

  newGame() {
    this.clearGameData();
    dom.clearBoard();
    dom.closeAllModals();
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
    dom.showStartModal();
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
      pubSub.emit("newTurn", console.log("New turn"));
    }
  }

  setShips(player) {
    if (player.type === "player") {
      dom.showShipSelectModal(player);
    } else {
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
