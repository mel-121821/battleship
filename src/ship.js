// Ship types and lengths:

// Carrier: 5
// Battleship: 4
// Cruiser: 3
// Submarine: 3
// Destroyer: 2

class Ship {
  constructor(len) {
    this.len = len;
    this.area = this.buildShip(len);
    this.hits = 0;
    this.sunk = false;
  }

  buildShip(len) {
    const area = [];
    for (let i = 0; i < len; i++) {
      area.push(new Node());
    }
    return area;
  }

  hit(coord) {
    this.hits++;
    return (this.area[coord].isHit = true);
  }

  isSunk() {
    if (this.hits > this.len) {
      this.sunk = true;
    }
    return this.sunk;
  }
}

class Node {
  constructor(coord) {
    this.coord = coord;
    this.isHit = false;
  }
}

const carrier = new Ship(5);

export { carrier };
