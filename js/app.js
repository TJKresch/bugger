/* app.js */

/*
 * The game logic for "Bugger"
 * Handles setting initial conditions, handling user input,
 * and updating object values to be used by the rendering engine.
 */

/********* Constants and Global Variables *********/

// Constant values refer to current tileset
// will need to be updated if different sized tiles (images) are used
var COLWIDTH = 101;
var ROWHEIGHT = 83;
var TILEBOTTOM = 37;
var TILETOP = 51;
var TILEHEIGHT = 171;

// Change these values to adjust the size of the game
// Note: This will also increase the canvas size
var numLanes = 4;
var numCols = 9;

// Do not modify
// Always 1 top row (goal) and two bottom rows (player spawn / safe)
var numRows = numLanes + 3;

// Set canvas height and width for Game Engine and Stats to use
var canvasWidth = numCols * COLWIDTH;
var canvasHeight = (numRows * ROWHEIGHT) + TILETOP + TILEBOTTOM;

// Player should start on the bottom row, middle column
var PLAYER_START_COL = Math.floor(numCols / 2);
var PLAYER_START_ROW = numRows - 1;

// Vertical adjustment to center sprites in tiles
var dy = -26;

// Set the number of enemies and the base enemy speed
var numEnemies = 10;
var baseEnemySpeed = 200;

// Set the game difficulty
// This influences the top speed of the enemies, as well as the range of possible speeds
// Set to any integer between 1 (easy, single-speed) and 9(very hard, 8-speeds)
var gameDifficulty = 4;

/********* Global Functions and Helpers *********/

// Helper function: Get random integer in [min, max)
var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

// Global win function, call when a win condition is reached
var win = function(currentPlayer) {
    stats.incrementStreak();
    currentPlayer.setInitialPosition();
};

// Loop through allEnemies and check for collisions with player
// If any collision, player dies
var checkCollisions = function() {
    allEnemies.forEach(function(enemy) {
        if (checkCollision(enemy, player)) {
            player.die();
        }
    });
};

// Check for collision by calculating rectange intersection
// Integer value offsets are used to make rectangles more closely represent
// the rectangle around the visible pixels
var checkCollision = function(e, p) {
    var eLeft = e.x;
    var eRight = e.x + COLWIDTH;
    var eTop = e.y + 65;
    var eBottom = e.y + ROWHEIGHT - 30;
    var pLeft = p.x + 30;
    var pRight = p.x + COLWIDTH - 30;
    var pTop = p.y + 45;
    var pBottom = p.y + ROWHEIGHT;
    return !(pLeft > eRight || pRight < eLeft || pTop > eBottom || pBottom < eTop);

};

/********* Game Object Class Definitions *********/

// Enemies our player must avoid
var Enemy = function() {

    // The image/sprite for our enemies,
    // Uses a helper to easily load images
    this.sprite = 'images/enemy-bug.png';

    // Initialize properties
    this.x = 0;
    this.y = 0;
    this.speed = 100;

    // Set properties randomly: x, y, and speed
    this.setRandomValues();
};

// Call upon initialization and when enemies loop back to start
Enemy.prototype.setRandomValues = function() {

    // Set enemy starting x position 1 to 3 columns offscreen to the left
    // This makes enemy "respawn times" less predictable
    this.x = getRandomInt(1, 4) * -COLWIDTH;

    // Choose random lane
    this.y = getRandomInt(1, numLanes + 1) * ROWHEIGHT + dy;

    // Speed is randomized, but quantized so that players can get used
    // to the different possible speeds of enemies
    // Increasing gameDifficulty by 1 increases number of possible speeds by 1
    // and increases the highest possible speed by 50
    this.speed = baseEnemySpeed + 50 * getRandomInt(1, gameDifficulty + 1);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // Advance enemy position based on speed
    // If off the map, loop back around and roll new values
    if (this.x < COLWIDTH * numCols) {
        this.x += dt * this.speed;
    } else {
        this.setRandomValues();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The user-controlled player
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.setInitialPosition();
};

// (Re)set player to start position
// Call upon initialization and when a player dies or wins
Player.prototype.setInitialPosition = function() {
    this.x = PLAYER_START_COL * COLWIDTH;
    this.y = PLAYER_START_ROW * ROWHEIGHT + dy;
};

// Check for win condition and call win() appropriately
Player.prototype.update = function() {
    if (this.getCurrentRow() < 1) {
        win(this);
    }
};

// Draw player sprite to canvas
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Input handler
// Allow player to move with keyboard arrow keys
// and contain player within game boundaries
Player.prototype.handleInput = function(direction) {
    switch(direction) {
        case "left":
            if (this.getCurrentCol() > 0) {
                this.x -= COLWIDTH;
            }
            break;
        case "right":
            if (this.getCurrentCol() < numCols - 1) {
                this.x += COLWIDTH;
            }
            break;
        case "up":
            if (this.getCurrentRow() > 0) {
                this.y -= ROWHEIGHT;
            }
            break;
        case "down":
            if (this.getCurrentRow() < numRows - 1) {
                this.y += ROWHEIGHT;
            }
            break;
    }
};

// Calculate current player column from x value
Player.prototype.getCurrentCol = function() {
    return this.x / COLWIDTH;
};

// Calculate current player row from y value
Player.prototype.getCurrentRow = function() {
    return (this.y - dy) / ROWHEIGHT;
};

// Player death handler
Player.prototype.die = function() {
    stats.resetStreak();
    this.setInitialPosition();
};

/********* Instantiate Game Objects *********/

// Game Engine Expects:
//   * All 'Enemy' objects in an 'allEnemies' array
//   * A single Player object in 'player' variable

var player = new Player();

var allEnemies = [];
for (var i = 0; i < numEnemies; i++) {
    allEnemies.push(new Enemy());
}

/********* Define and Initialize Game Stat Display Objects *********/

// Game Stats constructor function
var Stats = function(streakDisplayPositionX, streakDisplayPositionY) {
    // Where to display current streak
    this.streakX = streakDisplayPositionX;
    this.streakY = streakDisplayPositionY;

    // Initialize current streak to 0
    this.streak = 0;
};

Stats.prototype.incrementStreak = function() { this.streak++; };
Stats.prototype.resetStreak = function() { this.streak = 0; };
Stats.prototype.render = function() {
    ctx.font = "36pt Impact";
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeText(stats.streak, stats.streakX, stats.streakY);
    ctx.fillText(stats.streak, stats.streakX, stats.streakY);
};

// Initialize stats object
// Integer offsets ensure streak is positioned on game screen
var stats = new Stats(canvasWidth - 70, canvasHeight - 70);

/********* Set Event Listeners *********/

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
