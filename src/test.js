import { board } from "./gameboard.js";

test("generateShipCoords with the args: ([0, 0], 'hor', 4) should return the following coords: [0, 0], [0, 1], [0, 2], [0, 3] ", () => {
  expect(board.generateShipCoords(0, 0, "x-axis", 4)).toMatchObject([
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ]);
});

test("Carrier placed at [1, 1] with horizontal direction should show the following coords as occupied: [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]", () => {
  expect(
    board.placeShip(1, 1, "x-axis", board.ships[0]).shipCoords
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
    board.placeShip(0, 0, "y-axis", board.ships[1]).shipCoords
  ).toMatchObject([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
});

test("Patrol boat placed at [0, 0] with horizontal direction should return undefined as a boat cannot be placed there. That square is occupied by the battleship", () => {
  expect(board.placeShip(0, 0, "x-axis", board.ships[4])).toBeUndefined();
});

test("Sub placed at [9, 9] with horizontal direction should return undefined as it will be off the board", () => {
  expect(board.placeShip(9, 9, "x-axis", board.ships[3])).toBeUndefined();
});

test("Test shipPlacement_isValid", () => {
  expect(
    board.shipPlacement_isValid([
      [9, 9],
      [9, 10],
      [9, 11],
    ])
  ).toBeFalsy();
});

test("Test shipPlacement_isValid", () => {
  expect(
    board.shipPlacement_isValid([
      [9, 6],
      [9, 7],
      [9, 8],
    ])
  ).toBeTruthy();
});

test("receiveAttack should show affected square (no boat) as received attack", () => {
  expect(board.receiveAttack(8, 2)).toBe(true);
});

test("receiveAttack should show affected square (boat exists) as received attack", () => {
  expect(board.receiveAttack(0, 0)).toBe(true);
});
