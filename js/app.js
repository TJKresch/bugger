/* app.js */

/*
 * The game logic for "Bugger"
 * Handles setting initial conditions, handling user input,
 * and updating object values to be used by the rendering engine.
 */

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
    var eRight = e.x + CONFIG.getColWidth();
    var eTop = e.y + 65;
    var eBottom = e.y + CONFIG.getRowHeight() - 30;
    var pLeft = p.x + 30;
    var pRight = p.x + CONFIG.getColWidth() - 30;
    var pTop = p.y + 45;
    var pBottom = p.y + CONFIG.getRowHeight();
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
 * @abstract
 */
Entity.prototype.update = function() {};

/**
 * Render to Canvas
 * @method
 * @returns {undefined}
 * @abstract
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
    this.x = getRandomInt(1, CONFIG.getNumCols()) * -CONFIG.getColWidth();

    // Choose random lane
    this.y = getRandomInt(1, CONFIG.getNumLanes() + 1) * CONFIG.getRowHeight() + CONFIG.getDY();

    // Speed is randomized, but quantized so that players can get used
    // to the different possible speeds of enemies
    // Increasing Game Difficulty by 1 increases number of possible speeds by 1
    // and increases the highest possible speed by 50
    this.speed = CONFIG.getBaseEnemySpeed() + 50 * getRandomInt(1, CONFIG.getGameDifficulty() + 1);
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
    if (this.x < CONFIG.getColWidth() * CONFIG.getNumCols()) {
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
    this.x = CONFIG.getPlayerStartCol() * CONFIG.getColWidth();
    this.y = CONFIG.getPlayerStartRow() * CONFIG.getRowHeight() + CONFIG.getDY();
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
                this.x -= CONFIG.getColWidth();
            }
            break;
        case "right":
            if (this.getCurrentCol() < CONFIG.getNumCols() - 1) {
                this.x += CONFIG.getColWidth();
            }
            break;
        case "up":
            if (this.getCurrentRow() > 0) {
                this.y -= CONFIG.getRowHeight();
            }
            break;
        case "down":
            if (this.getCurrentRow() < CONFIG.getNumRows() - 1) {
                this.y += CONFIG.getRowHeight();
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
    return this.x / CONFIG.getColWidth();
};

/**
 * Helper - Calculate current player column from y value
 * @method
 * @returns {number}
 */
Player.prototype.getCurrentRow = function() {
    return (this.y - CONFIG.getDY()) / CONFIG.getRowHeight();
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
//   * An initialized CONFIG module
//   * All 'Enemy' instances in an 'allEnemies' array
//   * A single Player instance bound to a global vairable named 'player'
//   * A single Stats instance bound to a global vairable named 'stats'

/* Initialize Config Object */
CONFIG.init(5, 7, 10, 200, 4);

/**
 * Global player instance
 * @type {Player}
 * @global
 */
var player = new Player();

/**
 * Global {@link Enemy} array
 * @type {Enemy[]}
 * @global
 */
var allEnemies = [];
for (var i = 0; i < CONFIG.getNumEnemies(); i++) {
    allEnemies.push(new Enemy());
}

/**
 * Global Stats instance
 * @type {Stats}
 * @global
 */
var stats = new Stats(CONFIG.getCanvasWidth() - 70, CONFIG.getCanvasHeight() - 70);


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
