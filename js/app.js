/* app.js */

/*
 * The game logic for "Bugger"
 * Handles setting initial conditions, handling user input,
 * and updating object values to be used by the rendering engine.
 */

/********* Constants and Global Variables *********/

// Constant values refer to current tileset
// will need to be updated if different sized tiles (images) are used

/**
 * Height of the bottom part of the tile image that should be covered
 * by overlapping tiles in all except the bottom row
 * @type {Number}
 * @const
 * @global
 */
var TILEBOTTOM = 37;

/**
 * Height of the top part of the tile image, most of which is
 * transparent
 * @type {Number}
 * @const
 * @global
 */
var TILETOP = 51;

/**
 * Height of the full tile image
 * @type {Number}
 * @const
 * @global
 */
var TILEHEIGHT = 171;

/**
 * Height of a column (Note: NOT the same as the height of the tile
 * image. Takes into account the overlapping of tiles.)
 * @type {Number}
 * @const
 * @global
 */
var ROWHEIGHT = TILEHEIGHT - TILETOP - TILEBOTTOM;

/**
 * Width of column (should be equal to width of tile image)
 * @type {Number}
 * @const
 * @global
 */
var COLWIDTH = 101;

/**
 * Number of lanes to be used in the game. Changing this value will
 * adjust the height of the game (and the canvas)
 * @type {Number}
 * @global
 */
var numLanes = 4;

/**
 * Number of Columns to be used in the game. Changing this value
 * will adjust the width of the game (and the canvas)
 * @type {Number}
 * @global
 */
var numCols = 7;


// Always 1 top row (goal) and two bottom rows (player spawn / safe)

/**
 * Number of rows to render, 3 fixed rows + the number of lanes
 * (modify {@link numLanes} to adjust game size)
 * @type {Number}
 * @global
 */
var numRows = numLanes + 3;

/**
 * Holds the width of the canvas, calculated from the number of
 * columns {@link numCols} and the width of each column
 * {@link colWidth} <br>
 * Used by the Game Engine and {@link stats}
 * @type {Number}
 * @global
 */
var canvasWidth = numCols * COLWIDTH;

/**
 * Holds the width of the canvas, calculated from the number of
 * columns {@link numCols} and the width of each column
 * {@link colWidth}
 * @type {Number}
 * @global
 */
var canvasHeight = (numRows * ROWHEIGHT) + TILETOP + TILEBOTTOM;

// Player should start on the bottom row, middle column

/**
 * Calculates the column in which the player should (re)spawn
 * (the middle or middle-right column)
 * @type {Number}
 * @global
 */
var playerStartCol = Math.floor(numCols / 2);

/**
 * Calculates the row in which the player should (re)spawn
 * (the bottom row)
 * @type {Number}
 * @global
 */
var PlayerStartRow = numRows - 1;

/**
 * Vertical adjustment to center sprites in tiles
 * (dependant on current tile set)
 * @type {Number}
 * @global
 */
var dy = -26;

// Set the number of enemies and the base enemy speed

/**
 * Set the total number of enemies to spawn here
 * @type {Number}
 * @global
 */
var numEnemies = 10;

/**
 * Set the base enemy speed here
 * @type {Number}
 * @global
 */
var baseEnemySpeed = 200;

// Set the game difficulty
// This influences the top speed of the enemies, as well as the range of possible speeds
// Set to any integer between 1 (easy, single-speed) and 9(very hard, 8-speeds)

/**
 * Set the game difficulty here <br>
 * This influences the top speed of the enemies, the number of
 * discreet possible speeds, and the maximum possible speed.
 * Set to any integer between: <br>
 * 1 (easy, single-speed, low max speed) and
 * 9(very hard, 9-speeds, high max speed)
 * @type {Number}
 * @global
 */
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
 * Loop through an array of enemies, check for collisions with player, and
 * respond appropriately
 * @param {Array.<Enemy>} enemyArray - An array of Enemy objects
 * @param {Player} playerInstance - An instance of the Player class
 * @function
 * @returns {undefined}
 */
var checkCollisions = function(enemyArray, playerInstance) {
    enemyArray.forEach(function(enemy) {
        if (checkCollision(enemy, playerInstance)) {
            playerInstance.die();
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
        this.win();
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
 * Helper - Calculate current player column from x value
 * @method
 * @returns {number}
 */
Player.prototype.getCurrentCol = function() {
    return this.x / COLWIDTH;
};

/**
 * Helper - Calculate current player column from y value
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

/**
 * Player win handler
 * @method
 * @returns {undefined}
 */
Player.prototype.win = function() {
    stats.incrementStreak();
    this.setInitialPosition();
};

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
    ctx.strokeText(this.streak, this.streakX, this.streakY);
    ctx.fillText(this.streak, this.streakX, this.streakY);
};

/********* Instantiate Game Objects *********/

// Game Engine Expects:
//   * All 'Enemy' objects in an 'allEnemies' array
//   * A single Player object in 'player' variable
//   * A single Stats object in 'stats' variable

/**
 * Current Player instance
 * @type {Player}
 * @global
 */
var player = new Player();

/**
 * Global {@link Enemy} array
 * @type {Array.<Enemy>}
 * @global
 */
var allEnemies = [];
for (var i = 0; i < numEnemies; i++) {
    allEnemies.push(new Enemy());
}

/**
 * Global Stats instance
 * @type {Stats}
 * @global
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
