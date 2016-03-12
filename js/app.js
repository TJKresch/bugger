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
var numLanes = 5;
var numCols = 7;

// Do not modify
// Always 1 top row (goal) and two bottom rows (player spawn / safe)
var numRows = numLanes + 3;

// Set canvas height and width for Game Engine and Stats to use
var canvasWidth = numCols * COLWIDTH;
var canvasHeight = (numRows * ROWHEIGHT) + TILETOP + TILEBOTTOM;

// Player should start on the bottom row, middle column
var playerStartCol = Math.floor(numCols / 2);
var PlayerStartRow = numRows - 1;

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

/**
 * Helper function: Get random integer in [min, max)
 * @function
 * @param {number} min - Minimum integer in range (inclusive)
 * @param {number} max - Maximum integer in range (exclusive)
 * @returns {number} Integer in [min, max)
 */
var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

/**
 * Global win function, call when a win condition is reached
 * @function
 * @param {Player} currentPlayer - Current player object
 * @returns {undefined}
 */
var win = function(currentPlayer) {
    stats.incrementStreak();
    currentPlayer.setInitialPosition();
};

/**
 * Loop through allEnemies, check for collisions with player, and
 * respond appropriately
 * @function
 * @returns {undefined}
 */
var checkCollisions = function() {
    allEnemies.forEach(function(enemy) {
        if (checkCollision(enemy, player)) {
            player.die();
        }
    });
};

/**
 * Check for collision between {@link Enemy} and {@link Player} instances
 * by calculating rectange intersection
 * @function
 * @param {Enemy} e - Enemy instance
 * @param {Player} p - Player instance
 * @returns {boolean} true if collision, false otherwise
 */
var checkCollision = function(e, p) {
    /*
     * Integer value offsets are used to make rectangles more closely represent
     * the rectangle around the visible pixels
    */
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

/**
 * Create blank properties and prototype methods to represent
 * shared properties and methods of all Entity instances
 * @constructor
 * @property {number} x - x-position on canvas
 * @property {number} y - y-position on canvas
 * @classdesc Abstract class for all game entities
 * @returns {Entity}
 */
var Entity = function() {
    this.x = 0;
    this.y = 0;
};

/**
 * Update internal state
 * @method
 * @returns {undefined}
 */
Entity.prototype.update = function() {};

/**
 * Render to Canvas
 * @method
 * @returns {undefined}
 */
Entity.prototype.render = function() {};


/**
 * Inherits from Entity and adds functionality for displaying a sprite
 * @constructor
 * @classdesc Abstract class for all game entities with an image representation
 * @extends Entity
 * @property {number} x - x-position on canvas
 * @property {number} y - y-position on canvas
 * @property {string} sprite Relative path or URL to sprite
 * @returns {GraphicEntity}
 */
var GraphicEntity = function(spritePath) {
    Entity.call(this);

    // The image/sprite for the entity
    // Uses a helper to easily load images
    this.sprite = spritePath;
};

// Set up prototype relation with Entity class
GraphicEntity.prototype = Object.create(Entity.prototype);
GraphicEntity.prototype.constructor = GraphicEntity;

/**
 * Render image to the screen based on x and y position
 * @returns {undefined}
 */
GraphicEntity.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Creates Enemy entity with enemy sprite, randomizes initial
 * position and speed
 * @constructor
 * @extends GraphicEntity
 * @classdesc Represents the enemies that the player must avoid
 * @property {number} x - x-position on canvas
 * @property {number} y - y-position on canvas
 * @property {string} sprite Relative path or URL to sprite
 * @returns {Enemy}
 */
var Enemy = function() {

    // Inherit properties from GraphicEntity class
    GraphicEntity.call(this, 'images/enemy-bug.png');

    // Set to arbitrary nonzero value – will be overwritten
    this.speed = 100;

    // Set properties randomly: x, y, and speed
    this.setRandomValues();
};

// Set up prototype relation with GraphicEntity class
Enemy.prototype = Object.create(GraphicEntity.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * Prepares an enemy to move across the screen by randomizing
 * internal position and speed.
 * @method
 * @returns {undefined}
 */
Enemy.prototype.setRandomValues = function() {

    // Set enemy starting x position a variable distance offscreen to the left
    // This makes enemy (re)spawn times less predictable
    this.x = getRandomInt(1, numCols) * -COLWIDTH;

    // Choose random lane
    this.y = getRandomInt(1, numLanes + 1) * ROWHEIGHT + dy;

    // Speed is randomized, but quantized so that players can get used
    // to the different possible speeds of enemies
    // Increasing gameDifficulty by 1 increases number of possible speeds by 1
    // and increases the highest possible speed by 50
    this.speed = baseEnemySpeed + 50 * getRandomInt(1, gameDifficulty + 1);
};

/**
 * Update the enemy's position, required method for game
 * @param {number} dt - A time delta between ticks, ensures enemies move at
 * the same speed on all computers
 * @returns {undefined}
 */
Enemy.prototype.update = function(dt) {

    // Advance enemy position based on speed
    // If off the map, loop back around and roll new values
    if (this.x < COLWIDTH * numCols) {
        this.x += dt * this.speed;
    } else {
        this.setRandomValues();
    }
};

/**
 * Creates a {@link GraphicEntity} with player sprite and sets initial position
 * @constructor
 * @extends GraphicEntity
 * @classdesc Represents the user-controlled player
 * @property {number} x - x-position on canvas
 * @property {number} y - y-position on canvas
 * @property {string} sprite Relative path or URL to sprite
 * @returns {Player}
 */
var Player = function() {
    GraphicEntity.call(this, 'images/char-boy.png');
    this.setInitialPosition();
};

// Set up prototype relation with GraphicEntity class
Player.prototype = Object.create(GraphicEntity.prototype);
Player.prototype.constructor = Player;

/**
 * (Re)set player to start position
 * @method
 * @returns {undefined}
 */
Player.prototype.setInitialPosition = function() {
    this.x = playerStartCol * COLWIDTH;
    this.y = PlayerStartRow * ROWHEIGHT + dy;
};

/**
 * Check for win condition and call win() appropriately
 * @returns {undefined}
 */
Player.prototype.update = function() {
    if (this.getCurrentRow() < 1) {
        win(this);
    }
};

/**
 * Input Handler - Allow player to move with keyboard arrow keys
 * and contain player within game boundaries
 * @method
 * @param {string} direction - 'up', 'down', 'left', or 'right'
 * @returns {undefined}
 */
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

/**
 * Helper - Calculate current player column from this.x value
 * @method
 * @returns {number}
 */
Player.prototype.getCurrentCol = function() {
    return this.x / COLWIDTH;
};

/**
 * Helper - Calculate current player column from this.y value
 * @method
 * @returns {number}
 */
Player.prototype.getCurrentRow = function() {
    return (this.y - dy) / ROWHEIGHT;
};

/**
 * Player death handler
 * @method
 * @returns {undefined}
 */
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

/**
 * Game Stats constructor function
 * @constructor
 * @extends Entity
 * @param {number} x - Text x position
 * @param {number} y - Text y position
 * @property {number} streakX - x-value of render location
 * @property {number} streakY - y-value of render location
 * @property {number} streak - Current streak value
 * @returns {Stats}
 */
var Stats = function(x, y) {
    // Where to display current streak
    this.streakX = x;
    this.streakY = y;

    // Initialize current streak to 0
    this.streak = 0;
};

/**
 * Increases the current streak by one
 * @method
 * @returns {undefined}
 */
Stats.prototype.incrementStreak = function() { this.streak++; };

/**
 * Resets the current streak to zero
 * @method
 * @returns {undefined}
 */
Stats.prototype.resetStreak = function() { this.streak = 0; };

/**
 * Renders current streak text to the screen
 * @returns {undefined}
 */
Stats.prototype.render = function() {
    ctx.font = "36pt Impact";
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeText(stats.streak, stats.streakX, stats.streakY);
    ctx.fillText(stats.streak, stats.streakX, stats.streakY);
};

/**
 * Initialize stats object
 * @type {Stats}
 */
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
