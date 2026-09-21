import { Ship } from "./ship.js";
import { pubSub } from "./pubsub.js";

class Gameboard {
  constructor(parent) {
    this.parent = parent;
    this.ships = [
      { name: "carrier", len: 5, axis: "x" },
      { name: "battleship", len: 4, axis: "x" },
      { name: "destroyer", len: 3, axis: "x" },
      { name: "submarine", len: 3, axis: "x" },
      { name: "patrol-boat", len: 2, axis: "x" },
    ];

    // this.ships = {
    //   carrier: {
    //     length: 5,
    //     axis: "x",
    //   },
    //   battleship: {
    //     length: 4,
    //     axis: "x",
    //   },
    //   destroyer: {
    //     length: 3,
    //     axis: "x",
    //   },
    //   submarine: {
    //     length: 3,
    //     axis: "x",
    //   },
    //   ["patrol-boat"]: {
    //     length: 2,
    //     axis: "x",
    //   },
    // };

    // board
    this.rows = 10;
    this.cols = 10;
    this.board = this.createBoard();

    // reporting
    this.shipPlacedCounter = 0;
    this.sunkCounter = 0;
    // this.placeShip_bound = this.placeShip.bind(this)
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

  changeShipDirection(shipName) {
    for (const ship of this.ships) {
      if (ship.name === shipName) {
        ship.axis = ship.axis === "x" ? "y" : "x";
        console.log(`${ship.name}'s axis was changed to ${ship.axis}`);
      }
    }
    // const ship = this.ships[shipName];
    // ship.axis = ship.axis === "x" ? "y" : "x";
    // console.log(
    //   `${Object.entries(this.ships[shipName])}'s axis was changed to ${
    //     this.ships[shipName].axis
    //   }`
    // );
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

  generateShipCoords(row, col, shipName) {
    const shipCoords = [];
    const shipObj = this.getShipObjFromName(shipName);
    if (shipObj.axis === "x") {
      for (let i = 0; i < shipObj.len; i++) {
        shipCoords.push([row, col++]);
      }
    } else {
      for (let i = 0; i < shipObj.len; i++) {
        shipCoords.push([row++, col]);
      }
    }
    return shipCoords;
  }

  getShipObjFromName(shipName) {
    let shipObj;
    for (const ship of this.ships) {
      if (ship.name === `${shipName}`) {
        shipObj = ship;
      }
    }
    return shipObj;
  }

  placeShip(row, col, shipName) {
    const shipCoords = this.generateShipCoords(row, col, shipName);
    if (this.shipPlacement_isValid(shipCoords)) {
      const ship = new Ship(
        shipCoords,
        shipName,
        this.parent.name,
        this.parent.pCode
      );
      this.setBoard(ship);
      this.shipPlacedCounter++;
      pubSub.emit(`shipPlaced`, [
        this.parent,
        this.shipPlacedCounter,
        shipName,
      ]);
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

  randomizeCoords() {
    const values = [];
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    values.push(x, y);
    return values;
  }

  randomizeAxis(curr) {
    curr.axis = (() => {
      if (Math.floor(Math.random() * 2) < 1) {
        return "x";
      } else {
        return "y";
      }
    })();
  }

  placeShips_randomize(ships) {
    if (!ships.length) {
      console.log(ships);
      // pubSub.emit("allShipsPlaced", [this.parent]);
      return;
    }
    // create a shallow copy
    const shipsArr = ships.slice();
    let curr = shipsArr.shift();
    let coords = this.randomizeCoords();
    this.randomizeAxis(curr);
    console.log(curr.name);
    let newShip = this.placeShip(coords[0], coords[1], curr.name);
    console.log(newShip);
    while (newShip === undefined) {
      coords = this.randomizeCoords();
      this.randomizeAxis(curr);
      newShip = this.placeShip(coords[0], coords[1], curr.name);
    }
    this.placeShips_randomize(shipsArr);
  }

  receiveAttack(row, col) {
    const square = this.board[row][col];
    if (square.recievedAttack) {
      pubSub.emit("newTurn", console.log("this square has already been hit"));
    } else {
      square.recievedAttack = true;
      if (square.occupyingShipNode !== null) {
        square.occupyingShipNode.parent.hit(row, col);
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
    console.log(`${this.sunkCounter} ship(s) sunk`);
    if (this.sunkCounter === 5) {
      pubSub.emit("endGame", this.parent.pCode);
    }
  }
}

class Square {
  recievedAttack = false;
  occupyingShipNode = null;
  constructor(row, col, pCode) {
    this.pCode = pCode;
    this.row = row;
    this.col = col;
  }
}

export { Gameboard };
