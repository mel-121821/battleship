// Ship types and lengths:

// Carrier: 5
// Battleship: 4
// Destroyerr: 3
// Submarine: 3
// Patrol Boat: 2

class Ship {
  constructor(coords, dir, len) {
    this.coords = coords;
    this.dir = dir;
    this.len = len;
    this.area = this.buildShip(coords, dir, len);
    this.hits = 0;
    this.sunk = false;
  }

  buildShip(coords, dir, len) {
    const area = [];
    if (dir === "hor") {
      for (let i = 0; i < len; i++) {
        area.push(new Node(coords[0], coords[1]++));
      }
    } else {
      for (let i = 0; i < len; i++) {
        area.push(new Node(coords[0]++, coords[1]));
      }
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

const carrier = new Ship([0, 0], "hor", 5);

const battleship = new Ship([0, 0], "vert", 4);

export { carrier, battleship };
