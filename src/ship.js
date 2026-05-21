// Ship types and lengths:

// Carrier: 5
// Battleship: 4
// Destroyer: 3
// Submarine: 3
// Patrol Boat: 2

class Ship {
  constructor(shipCoords) {
    this.shipCoords = shipCoords;
    this.area = this.buildShip(shipCoords);
    this.hits = 0;
    this.sunk = false;
  }

  buildShip(shipCoords) {
    const area = [];
    for (let coords of shipCoords) {
      area.push(new Node(coords[0], coords[1]));
    }
    return area;
  }

  hit(coords) {
    this.hits++;
    return (this.area[coords].isHit = true);
  }

  isSunk() {
    if (this.hits > this.len) {
      this.sunk = true;
    }
    return this.sunk;
  }
}

class Node {
  constructor(x, y) {
    this.coords = [x, y];
    this.isHit = false;
  }
}

export { Ship };
