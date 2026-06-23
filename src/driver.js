import { Player } from "./player.js";
import { dom } from "./domHandler.js";

class Driver {
  constructor() {
    this.p1 = new Player("Player 1", "p1");
    this.p2 = new Player("Computer", "p2");
    this.active = this.p1;
  }

  initGame() {
    // clear all data
    // update boards
    dom.initBoardUI(this.p1, this.p2);
    // get players
  }

  initSetShips() {
    this.p1.data.placeShips_randomize(this.p1.data.ships);
    this.p2.data.placeShips_randomize(this.p2.data.ships);
    dom.updateBoard_ShipsPlaced(this.p1);
    dom.updateBoard_ShipsPlaced(this.p2);
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
