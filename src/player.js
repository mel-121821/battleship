import { Gameboard } from "./gameboard.js";

class Player {
  constructor(name, pCode) {
    this.name = name;
    this.pCode = pCode;
    this.data = new Gameboard(pCode);
  }
}

export { Player };
