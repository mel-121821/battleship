import { Ship } from "./ship";

class Gameboard {
  constructor() {
    this.ships = [
      { name: "carrier", len: 5 },
      { name: "battleship", len: 4 },
      { name: "destroyer", len: 3 },
      { name: "submarine", len: 3 },
      { name: "patrolBoat", len: 2 },
    ];

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

  shipPlacement_isValid(shipCoords) {
    let result = true;
    for (let coords of shipCoords) {
      const x = coords[0];
      const y = coords[1];
      if (x > 9 || y > 9 || this.board[x][y].occupyingShipNode !== null) {
        result = false; // this square is occupied or off board
        break;
      }
    }
    return result;
  }

  generateShipCoords(row, col, dir, shipLength) {
    const shipCoords = [];
    if (dir === "x-axis") {
      for (let i = 0; i < shipLength; i++) {
        shipCoords.push([row, col++]);
      }
    } else {
      for (let i = 0; i < shipLength; i++) {
        shipCoords.push([row++, col]);
      }
    }
    return shipCoords;
  }

  placeShip(row, col, dir, shipType) {
    const shipCoords = this.generateShipCoords(row, col, dir, shipType.len);
    if (this.shipPlacement_isValid(shipCoords)) {
      const ship = new Ship(shipCoords, shipType.name);
      this.setBoard(ship);
      return ship;
    } // else do nothing, can't place ship in occupied space or off board
  }

  setBoard(ship) {
    const shipNodes = ship.area; // arr of shipNodes
    for (const node of shipNodes) {
      const occupiedSquare = this.board[node.row][node.col];
      occupiedSquare.occupyingShipNode = node;
    }
  }

  receiveAttack(row, col) {
    const square = this.board[row][col];
    if (square.recievedAttack) {
      // throw error, this square has already been hit
    } else {
      square.recievedAttack = true;
      if (square.occupyingShipNode !== null) {
        square.occupyingShipNode.parent.hit(row, col);
        return square.occupyingShipNode.isHit;
      } else {
        return square.recievedAttack;
      }
    }
  }
}

class Square {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.recievedAttack = false;
    this.occupyingShipNode = null;
  }
}

const board = new Gameboard();
// board.placeShip([0, 0], "x-axis", board.carrier);

export { board };
