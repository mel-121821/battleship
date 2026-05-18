import { carrier } from "./ship.js";
import { battleship } from "./ship.js";
import { board } from "./gameboard.js";

test("Carrier is hit at coord 5", () => {
  expect(carrier.hit(4)).toBe(true);
});

test("Carrier is hit but not sunk until after 5 hits", () => {
  carrier.hit(0);
  carrier.hit(1);
  carrier.hit(2);
  carrier.hit(3);
  // carrier.hit(4);
  expect(carrier.isSunk()).toBe(false);
});

test("Carrier sunk after 5 hits", () => {
  carrier.hit(0);
  carrier.hit(1);
  carrier.hit(2);
  carrier.hit(3);
  carrier.hit(4);
  expect(carrier.isSunk()).toBe(true);
});

test("Carrier placed at [0, 0] with horizontal direction should show the following coords: [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]", () => {
  expect(carrier.area[0].coords).toMatchObject([0, 0]);
  expect(carrier.area[1].coords).toMatchObject([0, 1]);
  expect(carrier.area[2].coords).toMatchObject([0, 2]);
  expect(carrier.area[3].coords).toMatchObject([0, 3]);
  expect(carrier.area[4].coords).toMatchObject([0, 4]);
});

test("Battleship placed at [0, 0] with vertical direction should show the following coords: [0, 0], [1, 0], [2, 0], [3, 0]", () => {
  expect(battleship.area[0].coords).toMatchObject([0, 0]);
  expect(battleship.area[1].coords).toMatchObject([1, 0]);
});
