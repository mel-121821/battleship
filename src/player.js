import { Gameboard } from "./gameboard";

class Player {
  constructor(name) {
    this.name = name;
    this.board = new Gameboard();
  }
}

class Computer {
  constructor() {
    this.name = "Computer";
    this.board = new Gameboard();
  }
}
