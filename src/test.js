import { carrier } from "./ship.js";

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
