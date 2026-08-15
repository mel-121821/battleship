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
    console.log(this.opponent);
  }

  generateAttackCoords() {
    return [x, y];
  }

  attackOpponent() {
    // const coords = this.generateAttackCoords();
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    console.log(this.opponent);
    this.opponent.receiveAttack(x, y);
  }

  // attackOpponent_Delayed() {
  //   setTimeout(this.attackOpponent, 1000);
  // }

  proximityAttack() {}
}

export { Player, Computer };
