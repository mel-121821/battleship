import { Ship } from "./ship";

class Gameboard {
  constructor() {
    // ship types
    this.carrier = 5;
    this.battleship = 4;
    this.destroyer = 3;
    this.submarine = 3;
    this.patrolBoat = 2;

    // board
    this.rows = 10;
    this.cols = 10;
    this.board = this.createBoard();
  }

  createBoard() {
    const board = [];
    for (let i = 0; i < this.rows; i++) {
      board[i] = [];
      for (let j = 0; j < this.cols; j++) {
        board[i].push(new Square(i, j));
      }
    }
  }

  placeShip(coords, dir, type) {
    return new Ship(coords, dir, type);
  }
}

class Square {
  constructor(x, y) {
    this.coords = [x, y];
    this.valid = true;
    this.occupied = false;
  }
}

const board = new Gameboard();

export { board };
