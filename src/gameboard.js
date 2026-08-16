import { Ship } from "./ship.js";
import { pubSub } from "./pubsub.js";

class Gameboard {
  constructor(parent) {
    this.parent = parent;
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

    // reporting
    this.sunkCounter = 0;
    this.reportSunk_bound = this.reportSunk.bind(this);

    // subs
    pubSub.on(`${this.parent.pCode}shipIsSunk`, this.reportSunk_bound);
  }

  createBoard() {
    const board = [];
    for (let i = 0; i < this.rows; i++) {
      board[i] = [];
      for (let j = 0; j < this.cols; j++) {
        board[i].push(new Square(i, j, this.parent.pCode));
      }
    }
    return board;
  }

  shipPlacement_isValid(shipCoords) {
    let result = true;
    for (let coords of shipCoords) {
      const row = coords[0];
      const col = coords[1];
      if (
        row > 9 ||
        col > 9 ||
        this.board[row][col].occupyingShipNode !== null
      ) {
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
      const ship = new Ship(
        shipCoords,
        shipType.name,
        this.parent.name,
        this.parent.pCode
      );
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

  randomizeShipArgs() {
    const values = [];
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    const axis = (() => {
      if (Math.floor(Math.random() * 2) < 1) {
        return "x-axis";
      }
    })();
    values.push(x, y, axis);
    return values;
  }

  placeShips_randomize(ships) {
    if (!ships.length) {
      pubSub.emit("shipsPlaced", this.parent);
      return;
    }
    let curr = ships.shift();
    let args = this.randomizeShipArgs();
    let newShip = this.placeShip(args[0], args[1], args[2], curr);
    while (newShip === undefined) {
      args = this.randomizeShipArgs();
      newShip = this.placeShip(args[0], args[1], args[2], curr);
    }
    this.placeShips_randomize(ships);
  }

  receiveAttack(row, col) {
    const square = this.board[row][col];
    if (square.recievedAttack) {
      pubSub.emit("newTurn", console.log("this square has already been hit"));
    } else {
      square.recievedAttack = true;
      if (square.occupyingShipNode !== null) {
        square.occupyingShipNode.parent.hit(row, col);
        // TODO: check the following functionality if on the shipNode already, double check and remove this line when finished
        console.log(square.occupyingShipNode);
        // square.occupyingShipNode.isHit;
      } else {
        square.recievedAttack;
        console.log(`attacked square ${square.row} ${square.col}`);
        console.log("missed!");
      }
      pubSub.emit("receivedAttack", square);
    }
  }

  reportSunk() {
    this.sunkCounter++;
    console.log("reportSunk called");
    console.log(this);
    console.log(`${this.sunkCounter} ship(s) sunk`);
    if (this.sunkCounter === 5) {
      pubSub.emit("endGame", this.parent.pCode);
    }
    return this.sunkCounter;
  }
}

class Square {
  constructor(row, col, pCode) {
    this.pCode = pCode;
    this.row = row;
    this.col = col;
    this.recievedAttack = false;
    this.occupyingShipNode = null;
  }
}

// console.log(board);

// Troubleshooting
// board.placeShip(1, 1, "x-axis", board.ships[0]);
// board.placeShip(0, 0, "y-axis", board.ships[1]);
// board.placeShip(4, 4, "x-axis", board.ships[2]);
// board.placeShip(6, 2, "y-axis", board.ships[3]);
// board.placeShip(7, 6, "x-axis", board.ships[4]);

// // carrier
// board.receiveAttack(1, 1);
// board.receiveAttack(1, 2);
// board.receiveAttack(1, 3);
// board.receiveAttack(1, 4);
// board.receiveAttack(1, 5);

// // battleship
// board.receiveAttack(0, 0);
// board.receiveAttack(1, 0);
// board.receiveAttack(2, 0);
// board.receiveAttack(3, 0);

// // destroyer
// board.receiveAttack(4, 4);
// board.receiveAttack(4, 5);
// board.receiveAttack(4, 6);

// // sub
// board.receiveAttack(6, 2);
// board.receiveAttack(7, 2);
// board.receiveAttack(8, 2);

// // patrol boat
// board.receiveAttack(7, 6);
// board.receiveAttack(7, 7);

// pubSub.on("shipSunk", board.reportAllSunk.count);
// board.placeShip([0, 0], "x-axis", board.carrier);
// board.placeShips_randomize(board.ships);

export { Gameboard };
