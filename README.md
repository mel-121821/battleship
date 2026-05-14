# The ODIN Project

## [Battleship](https://www.theodinproject.com/lessons/node-path-javascript-battleship#project-solution)

### Instructions

**Use TDD for this project**

**Stage 1:**

- [] Begin your app by creating the `Ship` class/factory (your choice).

Your ‘ships’ will be objects that include their length, the number of times they’ve been hit and whether or not they’ve been sunk.

REMEMBER you only have to test your object’s public interface. Only methods or properties that are used outside of your ‘ship’ object need unit tests.

- [] Ships should have a `hit()` function that increases the number of ‘hits’ in your ship.

- [] `isSunk()` should be a function that calculates whether a ship is considered sunk based on its length and the number of hits it has received.

**Stage 2:**

- [] Create a `Gameboard` class/factory.

Note that we have not yet created any User Interface. We should know our code is coming together by running the tests. You shouldn’t be relying on `console.log` or DOM methods to make sure your code is doing what you expect it to.

- [] Gameboards should be able to place ships at specific coordinates by calling the ship factory or class.

- [] Gameboards should have a `receiveAttack` function that takes a pair of coordinates, determines whether or not the attack hit a ship and then sends the ‘hit’ function to the correct ship, or records the coordinates of the missed shot.

- [] Gameboards should keep track of missed attacks so they can display them properly.

- [] Gameboards should be able to report whether or not all of their ships have been sunk.

**Stage 3:**

- [] Create a Player class/factory.

There will be two types of players in the game, ‘real’ players and ‘computer’ players.

Each player object should contain its own gameboard.

**Stage 4:**

- [] Import your classes/factories into another file, and drive the game using event listeners to interact with your objects. Create a module that helps you manage actions that should happen in the DOM.

At this point it is appropriate to begin crafting your User Interface.

- [] Set up a new game by creating Players. For now just populate each player’s Gameboard with predetermined coordinates. You are going to implement a system for allowing players to place their ships later.

- [] We’ll leave the HTML implementation up to you for now, but you should display both the player’s boards and render them using information from the Gameboard class/factory.

- [] You’ll need methods to render each player’s Gameboard, so put them in an appropriate module.

- [] Your event listeners should step through the game turn by turn using only methods from other objects. If at any point you are tempted to write a new function, step back and figure out which class or module that function should belong to.

- [] For attacks, let the user click on a coordinate in the enemy Gameboard. Send the user input to methods on your objects, and re-render the boards to display the new information.

- [] Players should take turns playing the game by attacking the enemy Gameboard. If you feel the need to keep track of the current player’s turn, it’s appropriate to manage that in this module, instead of another mentioned object.

- [] The game is played against the computer, so make the ‘computer’ players capable of making random plays. The computer does not have to be smart, but it should know whether or not a given move is legal (i.e. it shouldn’t shoot the same coordinate twice).

- [] Create conditions so that the game ends once one player’s ships have all been sunk. This function is also appropriate for this module.

- [] Finish it up by implementing a system that allows players to place their ships. For example, you can let them type coordinates for each ship or have a button to cycle through random placements.

**Extra credit**

Make your battleship project more impressive by introducing any of these modifications.

- [] Implement drag and drop to allow players to place their ships.

- [] Create a 2-player option that lets users take turns by passing the laptop back and forth, or by spinning the monitor around on a desktop. Implement a ‘pass device’ screen so that players don’t see each other’s boards!

- [] Polish the intelligence of the computer player by having it try adjacent slots after getting a ‘hit’.

---

### Tools:

---

### Credits:

---

### Resources:

---

### Bugs and Resources:

**BUG:** npx webpack serve produced the following error:

```
Error: Cannot find module 'tslib'
Require stack:

- /home/megan/repos/portfolio/battleship/node_modules/@jsonjoy.com/fs-node/lib/index.js
```

[cont...]

**FIX:** Install the latest verion of Node and re-install npm

```

nvm install --lts
npm install

```

---

**BUG**: jest unable to parse `import "./style.css"` as it is not formatted in js syntax.

Resources:
https://stackoverflow.com/questions/54627028/jest-unexpected-token-when-importing-css

https://jestjs.io/docs/webpack

**FIX:** Create a mock that substitues css file with an empty obj using moduleNameMapper

**NOTE:** do NOT change file path in moduleNameMapper, it must be `"<rootDir>/__mocks__/styleMock",`

---

**BUG:** `exclude: ["node-modules"]` in webpack.common.js caused the following error:

```
Invalid configuration object. Webpack has been initialized using a configuration object that does not match the API schema....
```

[cont...]

```
* configuration.module.rules[0].exclude[0]: The provided value "node_modules" is not an absolute path!

```

**FIX:** Removed `exclude: ["node-modules"]` as it was added while troubleshooting webpack/jest and was not being used
