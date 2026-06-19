import { Gameboard } from "./gameboard.js";

class Player {
  constructor(name) {
    this.name = name;
    this.data = new Gameboard();
  }
}

export { Player };
