import { carrier } from "./ship.js";
import { battleship } from "./ship.js";
import { board } from "./gameboard.js";

test("generateShipCoords with the args: ([0, 0], 'hor', 4) should return the following coords: [0, 0], [0, 1], [0, 2], [0, 3] ", () => {
  expect(board.generateShipCoords([0, 0], "hor", 4)).toMatchObject([
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ]);
});

test("Carrier placed at [1, 1] with horizontal direction should show the following coords as occupied: [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]", () => {
  expect(
    board.placeShip([1, 1], "hor", board.carrier).shipCoords
  ).toMatchObject([
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
  ]);
});

test("Battleship placed at [0, 0] with vertical direction should show the following coords: [0, 0], [1, 0], [2, 0], [3, 0]", () => {
  expect(
    board.placeShip([0, 0], "vert", board.battleship).shipCoords
  ).toMatchObject([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
});

test("Patrol boat placed at [0, 0] with horizontal direction should return undefined as a boat cannot be placed there. That square is occupied by the battleship", () => {
  expect(board.placeShip([0, 0], "hor", board.patrolBoat)).toBeUndefined();
});
