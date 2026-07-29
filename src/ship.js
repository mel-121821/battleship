// Imports
import { pubSub } from "./pubsub.js";

// Ship types and lengths:

// Carrier: 5
// Battleship: 4
// Destroyer: 3
// Submarine: 3
// Patrol Boat: 2

class Ship {
  constructor(shipCoords, name, pCode) {
    this.name = name;
    this.pCode = pCode;
    this.shipCoords = shipCoords;
    this.area = this.buildShip(shipCoords);
    this.hits = 0;
    this.sunk = false;

    pubSub.on(`${this.pCode}${this.name}isHit`, this.isSunk);
  }

  buildShip(shipCoords) {
    const area = [];
    for (let coords of shipCoords) {
      const shipNode = new Node(coords[0], coords[1]);
      shipNode.parent = this;
      area.push(shipNode);
    }
    return area;
  }

  hit(row, col) {
    this.hits++;
    console.log(`${this.pCode}'s ship was hit`);
    const shipArr = this.area;
    for (let node of shipArr) {
      if (node.row === row && node.col === col) {
        node.isHit = true;
        pubSub.emit(`${this.pCode}${this.name}isHit`, this);
        break;
      }
    }
  }

  isSunk(ship) {
    if (ship.hits === ship.area.length) {
      ship.sunk = true;
      console.log(`${ship.pCode}'s ship was sunk`);
      pubSub.emit(`${ship.pCode}shipIsSunk`);
    }
  }
}

class Node {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isHit = false;
    this.parent = null;
  }
}

export { Ship };
