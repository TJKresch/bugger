Bugger
======
### A simple variation on the classic arcade game "Frogger"
#### Implemented in Javascript using the HTML5 Canvas API

### Starting the Game

The code for the game in this repository is fully self-contained; it does not rely on any external files or libraries, so it can be played locally offline or in a hosted environment. All you need is a modern web browser.\*

To start the game locally:

1. Download or `clone` this repository
2. Open `index.html` with a web browser

The game should start immediately. If it does not, ensure that Javascript is not disabled in your browser and that the directory structure has not been modified.

\* Internet Eplorer versions <9 do not support the HTML5 `canvas` element around which Bugger is built, so it will most likely not work on those browsers. If you need to modify Bugger to run in these legacy versions of IE, I recommend using the [ExplorerCanvas](https://github.com/arv/explorercanvas) library.

### Gameplay:

Bugger is played using only the keyboard arrow keys: `up`, `down`, `left`, and `right`. Each key press will move your character one square in the appropriate direction. The objective of the game is to reach the water while avoiding the bugs.

Once you reach the water, your character will be reset to the start location and your `streak` (shown in the lower-righthand corner of the game window) will increase by `1`. If your character touches or is touched by the bugs, the game will start over and your streak is reset to `0`.

Enjoy!

---

### Docs

Bugger uses [JSDoc](https://github.com/jsdoc3/jsdoc) to generate a documentation site. The pre-generated documentation can be found in the `docs/` directory. To view, simply open `docs/index.html` with a web browser.

To generate the docs yourself:

1. If you don't already have JSDoc installed, follow the instructions on the [JSDoc README](https://github.com/jsdoc3/jsdoc) to install JSDoc. (Note: You will need [npm](https://npmjs.org), which comes packaged with [node.js](https://nodejs.org/en/download/).)
2. From the Bugger root directory on the command line, run `jsdoc -c config/conf.js`
