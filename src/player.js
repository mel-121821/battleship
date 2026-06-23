import { Gameboard } from "./gameboard.js";

class Player {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.data = new Gameboard();
  }
}

export { Player };
