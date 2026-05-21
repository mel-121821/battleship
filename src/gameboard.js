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
    return board;
  }

  checkShipPlacement(shipCoords) {
    for (let coords of shipCoords) {
      if (this.board[coords[0]][coords[1]].occupied) {
        return false; // this square is occupied
      } else {
        return true;
      }
    }
  }

  generateShipCoords(coords, dir, type) {
    const shipCoords = [];
    if (dir === "hor") {
      for (let i = 0; i < type; i++) {
        shipCoords.push([coords[0], coords[1]++]);
      }
    } else {
      for (let i = 0; i < type; i++) {
        shipCoords.push([coords[0]++, coords[1]]);
      }
    }
    return shipCoords;
  }

  placeShip(coords, dir, type) {
    const shipCoords = this.generateShipCoords(coords, dir, type);
    // check return val of shipCoords
    if (this.checkShipPlacement(shipCoords)) {
      this.setBoard(shipCoords);
      return new Ship(shipCoords);
    } else {
      // return false; There is already a ship here
    }
  }

  setBoard(shipCoords) {
    for (let coords of shipCoords) {
      this.board[coords[0]][coords[1]].occupied = true;
    }
  }

  recieveAttack(coords) {}
}

class Square {
  constructor(x, y) {
    this.coords = [x, y];
    this.valid = true;
    this.occupied = false;
  }
}

const board = new Gameboard();
// board.placeShip([0, 0], "hor", board.carrier);

export { board };
