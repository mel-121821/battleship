import { board } from "./gameboard.js";

// Placement tests
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

test("Destroyer placed at [4, 4] with horizontal direction should show the following coords: [4, 4], [4, 5], [4, 6]", () => {
  expect(
    board.placeShip(4, 4, "x-axis", board.ships[2]).shipCoords
  ).toMatchObject([
    [4, 4],
    [4, 5],
    [4, 6],
  ]);
});

// Hit/sunk tests
test("Carrier is hit 5 times and sunk.", () => {
  expect(board.receiveAttack(1, 1)).toBeTruthy();
  expect(board.receiveAttack(1, 2)).toBeTruthy();
  expect(board.receiveAttack(1, 3)).toBeTruthy();
  expect(board.receiveAttack(1, 4)).toBeTruthy();
  expect(board.receiveAttack(1, 5)).toBeTruthy();
});

test("reportSunk logs the num of ships sunk plus the num of times it is called in the tests (this is a side effect as we are calling reportSunk an extra time outside of its normal flow", () => {
  expect(board.reportSunk()).toBe(2);
});

test("Battleship is hit 4 times and sunk.", () => {
  expect(board.receiveAttack(0, 0)).toBeTruthy();
  expect(board.receiveAttack(1, 0)).toBeTruthy();
  expect(board.receiveAttack(2, 0)).toBeTruthy();
  expect(board.receiveAttack(3, 0)).toBeTruthy();
});

test("reportSunk logs the num of ships sunk plus the num of times it is called in the tests (this is a side effect as we are calling reportSunk an extra time outside of its normal flow", () => {
  expect(board.reportSunk()).toBe(4);
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
  expect(board.receiveAttack(4, 4)).toBe(true);
});
