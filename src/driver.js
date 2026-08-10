import { Player, Computer } from "./player.js";
import { dom } from "./domHandler.js";
import { pubSub } from "./pubsub.js";

class Driver {
  p1 = null;
  p2 = null;
  active = null;

  constructor() {
    // bound methods
    this.switchActivePlayer_bound = this.switchActivePlayer.bind(this);
    this.initGame_bound = this.initGame.bind(this);

    // pubsubs
    pubSub.on("gotInfo", this.initGame_bound);
    pubSub.on("turnComplete", this.switchActivePlayer_bound);
    pubSub.on("endGame");
  }

  getPlayers() {
    dom.showStartModal();
  }

  initPlayers(playerList) {
    if (playerList["p1-type"] === "human") {
      this.p1 = new Player(playerList["p1-name"], "p1");
    } else {
      this.p1 = new Computer("p1");
    }
    if (playerList["p2-type"] === "human") {
      this.p2 = new Player(playerList["p2-name"], "p2");
    } else {
      this.p2 = new Computer("p2");
    }
    console.log(this.p1);
    console.log(this.p2);
  }

  initGame(playerList) {
    // clear all data
    this.initPlayers(playerList);
    this.active = this.p1;
    // update boards
    dom.initBoardUI(this.p1, this.p2);
    this.initSetShips();
    dom.initP1(this.active.name);
    // get players
  }

  initSetShips() {
    this.p1.data.placeShips_randomize(this.p1.data.ships);
    this.p2.data.placeShips_randomize(this.p2.data.ships);

    // TODO: turn this into a pubsub from the gameboard
    // dom.updateBoard_ShipsPlaced(this.p1);
    // dom.updateBoard_ShipsPlaced(this.p2);
  }

  switchActivePlayer() {
    if (this.active.pCode === "p1") {
      this.active = this.p2;
    } else {
      this.active = this.p1;
    }
    dom.switchActiveBoard(this.active.pCode);
    console.log(`${this.active.name} is active`);
  }

  endGame() {
    // call dom.disableBoardEvents()
    // call dom.declareWinner()
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
