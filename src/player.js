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
  nearMisses = [];
  adjMoveVariations = [
    [0, -1],
    [0, +1],
    [-1, 0],
    [+1, 0],
  ];
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
      if (this.hitLog.length > 1 && this.nearMisses.length < 2) {
        let newTarget = this.calcHitPattern();
        console.log("new target =", newTarget);
        if (newTarget.length) {
          this.opponent.receiveAttack(newTarget[0], newTarget[1]);
          return;
        }
      }
      if (this.hitLog.length > 1 && this.nearMisses.length >= 2) {
        this.splitHitLog();
      }
      if (this.hitLog.length === 1) {
        const newTarget = this.calcAdjacentSquare();
        this.opponent.receiveAttack(newTarget[0], newTarget[1]);
      }
    }
  }

  splitHitLog() {
    console.log("called splitHitLog");
    this.nearMisses = [];
    this.splitTracker = this.hitLog.slice(1);
    this.hitLog = this.hitLog.slice(0, 1);
    console.log("hitlog = ", this.hitLog);
    console.log("splitTracker = ", this.splitTracker);
  }

  calcHitPattern() {
    // takes an array of length=2+ (ex. arr = [[1, 1], [1, 2]])
    const firstSetCoords = this.hitLog[0];
    const secondSetCoords = this.hitLog[1];
    console.log("firstSetCoords = ", firstSetCoords);
    console.log("secondSetCoords = ", secondSetCoords);
    let newTarget = [];
    if (firstSetCoords[0] === secondSetCoords[0]) {
      // direction = row
      newTarget = this.getPostArrValue(
        this.hitLog[this.hitLog.length - 1],
        "row"
      );
      if (!newTarget.length) {
        newTarget = this.getPreArrValue(this.hitLog[0], "row");
      }
    }
    if (firstSetCoords[1] === secondSetCoords[1]) {
      // direction = col
      newTarget = this.getPostArrValue(
        this.hitLog[this.hitLog.length - 1],
        "col"
      );
      if (!newTarget.length) {
        newTarget = this.getPreArrValue(this.hitLog[0], "col");
      }
    }
    return newTarget;
  }

  getPreArrValue(firstArrValue, dir) {
    let preArrVal;
    if (dir === "row") {
      preArrVal = [firstArrValue[0], firstArrValue[1] - 1];
    } else {
      preArrVal = [firstArrValue[0] - 1, firstArrValue[1]];
    }
    if (!this.isValid(preArrVal)) {
      console.log("calculated preArrVal is invalid =", preArrVal);
      this.updateNearMisses(preArrVal);
      console.log(this.nearMisses);
      preArrVal = [];
    }
    return preArrVal;
  }

  getPostArrValue(lastArrValue, dir) {
    let postArrVal;
    if (dir === "row") {
      postArrVal = [lastArrValue[0], lastArrValue[1] + 1];
    } else {
      postArrVal = [lastArrValue[0] + 1, lastArrValue[1]];
    }
    if (!this.isValid(postArrVal)) {
      console.log("calculated postArrVal is invalid =", postArrVal);
      this.updateNearMisses(postArrVal);
      console.log(this.nearMisses);
      postArrVal = [];
    }
    return postArrVal;
  }

  updateNearMisses(coords) {
    let match = false;
    for (let missedCoords of this.nearMisses) {
      if (coords[0] === missedCoords[0] && coords[1] === missedCoords[1]) {
        match = true;
      }
    }
    console.log("missedCoord duplicated = ", match);
    if (!match) {
      this.nearMisses.push(coords);
    }
  }

  calcAdjacentSquare() {
    let newTarget;
    const odds = Math.floor(Math.random() * 4);
    newTarget = [
      this.hitLog[0][0] + this.adjMoveVariations[odds][0],
      this.hitLog[0][1] + this.adjMoveVariations[odds][1],
    ];
    while (this.isValid(newTarget) === false) {
      console.log(
        "recalculate adjSquare:",
        newTarget,
        "validity = ",
        this.isValid(newTarget)
      );
      newTarget = this.calcAdjacentSquare();
    }
    console.log("newAdgTarget = ", newTarget);
    return newTarget;
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
    this.nearMisses = [];
    for (const node of ship.area) {
      this.hitLog = this.hitLog.filter((element) => {
        if (element[0] === node.row && element[1] === node.col) {
          return false;
        } else {
          return true;
        }
      });
    }
    if (!this.hitLog.length && this.splitTracker.length > 0) {
      const firstVal = this.splitTracker.shift();
      this.hitLog.push(firstVal);
    }
    console.log(this.hitLog);
  }
}

export { Player, Computer };

// BUG LOG:

// BUG: if hitLog is tracking hits from more than one ship, when 1st ship is sunk, cascade continues and Computer will hit seeveral times in a row before turn ends.
// REASON: when hitLog is split, next block in calculateAttack becomes true (hitLog.length === 1) and receiveAttack is called again
// FIX: add return statement in calculateAttack - caLcPattern block after calling receiveAttack to exit fn so that remaining blocks are prevented from running

// BUG: splitHitLog called inapropriately when attacking carrier
// - may have been causing hitlog to be updated and comp to attempt to attack adj squares even when saturated, causing an endless loop
// BUG UPD: splitHitLog was called because nearMisses was increasing 1-2 times per calcHitPattern (recording the same invalid coords multiple times)
// FIX: instead of creating a nearMiss count, track the coords of the misses in an arr instead, without counting duplicates
