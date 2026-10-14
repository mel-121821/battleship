import { Gameboard } from "./gameboard.js";
import { pubSub } from "./pubsub.js";

class Player {
  type = "player";
  constructor(pCode, name) {
    this.name = name;
    this.pCode = pCode;
    this.data = new Gameboard(this);
  }
}

class Computer extends Player {
  type = "computer";
  opponent = null;
  hitLog = [];
  splitTracker = [];
  nearMisses = 0;
  newTarget = [];

  constructor(pCode) {
    super(pCode);
    this.name = "Computer";

    this.attackOpponent_bound = this.attackOpponent.bind(this);

    this.logCompHit_bound = this.logCompHit.bind(this);
    this.initCalcAttacks_bound = this.initCalcAttacks.bind(this);
    this.calculateAttack_bound = this.calculateAttack.bind(this);
    this.updateLogs_bound = this.updateLogs.bind(this);

    pubSub.on("initComplete", this.initCalcAttacks_bound);

    console.log(pubSub.events);
  }

  setOpponent(board) {
    this.opponent = board;
  }

  logCompHit(arr) {
    this.hitLog.push(arr);
    if (this.hitLog.length > 1) {
      this.hitLog.sort(this.sortLog);
    }
    console.log(`Computer logged the following hit ${arr}`);
    console.log(this.hitLog);
  }

  // A negative value indicates that a should come before b.
  // A positive value indicates that a should come after b.
  // Zero or NaN indicates that a and b are considered equal.

  sortLog(arr1, arr2) {
    // samples [6, 7] [5, 7]
    if (arr1[0] === arr2[0]) {
      return arr1[1] - arr2[1];
    } else {
      return arr1[0] - arr2[0];
    }
  }

  attackOpponent() {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    this.opponent.receiveAttack(x, y);
  }

  initCalcAttacks() {
    console.log("initCalcAttacks");
    pubSub.on(`${this.opponent.parent.pCode}ShipIsHit`, this.logCompHit_bound);
    pubSub.on(`${this.opponent.parent.pCode}shipIsSunk`, this.updateLogs_bound);
  }

  calculateAttack() {
    console.log(this.hitLog);
    if (!this.hitLog.length) {
      this.attackOpponent();
    } else {
      if (this.hitLog.length > 1 && this.nearMisses < 2) {
        this.calcHitPattern();
        // if calcPattern finds a miss on either side of arr, change newTartet to empty arr
        // only call this.opponent.receiveAttack if there is a valid newTarget
        console.log("new target =", this.newTarget);
        if (this.newTarget.length) {
          this.opponent.receiveAttack(this.newTarget[0], this.newTarget[1]);
          return;
        }
      }
      if (this.hitLog.length > 1 && this.nearMisses >= 2) {
        this.splitHitLog();
      }
      if (this.hitLog.length === 1) {
        this.calcAdjacentSquare();
        this.opponent.receiveAttack(this.newTarget[0], this.newTarget[1]);
      }
    }
  }

  splitHitLog() {
    console.log("called splitHitLog");
    this.nearMisses = 0;
    for (let i = 1; i < this.hitLog.length - 1; i++) {
      console.log[i];
      const next = this.hitLog.pop();
      this.splitTracker.push(next);
    }
    console.log(this.hitLog);
    console.log(this.splitTracker);
  }

  calcHitPattern() {
    // takes an array of length=2+ (ex. arr = [[1, 1], [1, 2]])
    if (this.hitLog[0][0] === this.hitLog[1][0]) {
      // direction = row
      const lastVal = this.hitLog[this.hitLog.length - 1];
      const nextVal = [lastVal[0], lastVal[1] + 1];
      if (this.isValid(nextVal)) {
        this.newTarget = nextVal;
        console.log(nextVal);
      } else {
        this.nearMisses++;
        const firstVal = this.hitLog[0];
        const prevVal = [firstVal[0], firstVal[1] - 1];
        console.log(firstVal);
        if (this.isValid(prevVal)) {
          this.newTarget = prevVal;
          console.log(prevVal);
        } else {
          this.nearMisses++;
          this.newTarget = [];
        }
      }
    }
    if (this.hitLog[0][1] === this.hitLog[1][1]) {
      // direction = col
      const lastVal = this.hitLog[this.hitLog.length - 1];
      const nextVal = [lastVal[0] + 1, lastVal[1]];
      if (this.isValid(nextVal)) {
        this.newTarget = nextVal;
        console.log(nextVal);
      } else {
        this.nearMisses++;
        const firstVal = this.hitLog[0];
        const prevVal = [firstVal[0] - 1, firstVal[1]];
        if (this.isValid(prevVal)) {
          this.newTarget = prevVal;
          console.log(prevVal);
        } else {
          this.nearMisses++;
          this.newTarget = [];
        }
      }
    }
  }

  calcAdjacentSquare() {
    const variations = [
      [0, -1],
      [0, +1],
      [-1, 0],
      [+1, 0],
    ];
    const odds = Math.floor(Math.random() * 4);
    this.newTarget = [
      this.hitLog[0][0] + variations[odds][0],
      this.hitLog[0][1] + variations[odds][1],
    ];
    while (this.isValid(this.newTarget) === false) {
      const odds = Math.floor(Math.random() * 4);
      this.newTarget = [
        this.hitLog[0][0] + variations[odds][0],
        this.hitLog[0][1] + variations[odds][1],
      ];
    }
  }

  isValid(newTarget) {
    let valid = false;
    if (newTarget[0] >= 0 && newTarget[0] < 10) {
      if (newTarget[1] >= 0 && newTarget[1] < 10) {
        if (!this.opponent.board[newTarget[0]][newTarget[1]].receivedAttack) {
          valid = true;
        }
      }
    }
    return valid;
  }

  updateLogs(ship) {
    this.nearMisses = 0;
    for (const node of ship.area) {
      this.hitLog = this.hitLog.filter((element) => {
        if (element[0] === node.row && element[1] === node.col) {
          return false;
        } else {
          return true;
        }
      });
    }
    console.log(this.hitLog);
  }
}

export { Player, Computer };

// BUG LOG:

// BUG: if hitLog is tracking hits from more than one ship, when 1st ship is sunk, cascade continues and Computer will hit seeveral times in a row before turn ends.
// REASON: when hitLog is split, next block in calculateAttack becomes true (hitLog.length === 1) and receiveAttack is called again
// FIX: add return statement in calculateAttack - caLcPattern block after calling receiveAttack to exit fn so that remaining blocks are prevented from running
