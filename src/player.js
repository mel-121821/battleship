import { Gameboard } from "./gameboard.js";

class Player {
  type = "player";
  constructor(pCode, name) {
    this.name = name;
    this.pCode = pCode;
    this.data = new Gameboard(this);
  }
}

class Computer extends Player {
  type = "computer";
  opponent = null;

  constructor(pCode) {
    super(pCode);
    this.name = "Computer";

    this.attackOpponent_bound = this.attackOpponent.bind(this);
  }

  setOpponent(board) {
    console.log(board);
    this.opponent = board;
  }

  attackOpponent() {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    this.opponent.receiveAttack(x, y);
  }

  proximityAttack() {}
}

export { Player, Computer };
