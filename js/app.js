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
 * Loop through allEnemies, check for collisions with player, and
 * respond appropriately
 * @param {Array.<Enemy>} enemyArray - An array of Enemy objects
 * @param {Player} playerInstance - An instance of the Player class
 * @function
 * @returns {undefined}
 */
var checkCollisions = function(entityArray, entity) {
    entityArray.forEach(function(e) {
        if (checkCollision(e, entity)) {
            entity.handleCollision(e);
            e.handleCollision(entity);
            return e;
        }
        return false;
    });
};

/**
 * Check for collision between {@link Enemy} and {@link Player} instances
 * by calculating rectange intersection
 * @function
 * @param {Enemy} e - Enemy instance
 * @param {Player} p - Player instance
 * @returns {boolean} true if collision, false otherwise
 * @todo Differentiate collision detection between different entity types
 * @todo  Move offsets to visual pixels into entities
 */
var checkCollision = function(e, p) {
    /*
     * Integer value offsets are used to make rectangles more closely represent
     * the rectangle around the visible pixels
    */
    var eLeft = e.x;
    var eRight = e.x + CONFIG.getNativeColWidth();
    var eTop = e.y + 65;
    var eBottom = e.y + CONFIG.getNativeRowHeight() - 30;
    var pLeft = p.x + 30;
    var pRight = p.x + CONFIG.getNativeColWidth() - 30;
    var pTop = p.y + 45;
    var pBottom = p.y + CONFIG.getNativeRowHeight();
    return !(pLeft > eRight || pRight < eLeft || pTop > eBottom || pBottom < eTop);
};

/**
 * Helper function: Calculate the largest rectangle possible while maintaining
 * a fixed aspect ratio
 * @param  {number} maxWidth    The absolute max width allowed, irrespective of aspect ratio
 * @param  {number} maxHeight   The absolute max height allowed, irrespective of aspect ratio
 * @param  {number} aspectRatio The desired aspect ratio of the output rectangle: (width / height)
 * @return {{number: width, number: height}} Object with properties
 * <code>width</code> and <code>height</code>, representing dimensions of the output rectange
 */
var calculateMaxDimensions = function(maxWidth, maxHeight, aspectRatio) {
    var containerAR = maxWidth / maxHeight;
    var out = {};
    if (aspectRatio > containerAR) {
        // Can stretch game to width of screen and bottom will still be on screen
        out.width = maxWidth;
        out.height = out.width / aspectRatio;
    } else {
        // Can stretch game to height of screen and sides will still be on screen
        out.height = maxHeight;
        out.width = out.height * aspectRatio;
    }
    return out;
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
function Entity() {
    this.x = 0;
    this.y = 0;
}

/**
 * Get class name
 * @return {string} Name of entity's class as a string
 */
Entity.prototype.className = function() {
    return this.constructor.name;
};

/**
 * Update internal state
 * @method
 * @returns {undefined}
 * @abstract
 */
Entity.prototype.update = function() {
    console.log("Using Entity prototype update method");
};

/**
 * Render to Canvas
 * @method
 * @returns {undefined}
 * @abstract
 */
Entity.prototype.render = function() {
    console.log("Using Entity prototype render method");
};

/**
 * Handle collision with another entity
 * @param  {Entity} entity - The entity that this entity
 * collided with
 * @method
 * @returns {undefined}
 * @abstract
 */
Entity.prototype.handleCollision = function(entity) {
    console.log("Using Entity prototype handleCollision method");
};

/**
 * Get scaled x position
 * @return {number} Scaled x position
 */
Entity.prototype.scaledX = function() {
    var scale = CONFIG.getScalingFactor();
    return this.x * scale;
};

/**
 * Get scaled y position
 * @return {number} Scaled y position
 */
Entity.prototype.scaledY = function() {
    var scale = CONFIG.getScalingFactor();
    return this.y * scale;
};

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
function GraphicEntity(spritePath) {
    Entity.call(this);

    // The image/sprite for the entity
    // Uses a helper to easily load images
    this.sprite = spritePath;
}

// Set up prototype relation with Entity class
GraphicEntity.prototype = Object.create(Entity.prototype);
GraphicEntity.prototype.constructor = GraphicEntity;

/**
 * Render image to the screen based on x and y position
 * @returns {undefined}
 */
GraphicEntity.prototype.render = function() {
    ctx.drawImage(
        Resources.get(this.sprite),
        this.scaledX(),
        this.scaledY(),
        CONFIG.getColWidth(),
        CONFIG.getTileHeight()
    );
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
function Enemy() {

    // Inherit properties from GraphicEntity class
    GraphicEntity.call(this, 'images/enemy-bug.png');

    // Set to arbitrary nonzero value – will be overwritten
    this.speed = 100;

    // Set properties randomly: x, y, and speed
    this.setRandomValues();
}

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

    scale = CONFIG.getScalingFactor();

    // Set enemy starting x position a variable distance offscreen to the left
    // This makes enemy (re)spawn times less predictable
    this.x = getRandomInt(1, CONFIG.getNumCols()) * -CONFIG.getNativeColWidth();
    // this.x /= scale;
    // Choose random lane
    this.y = getRandomInt(1, CONFIG.getNumLanes() + 1) * CONFIG.getNativeRowHeight() + CONFIG.getNativeDY();
    // this.y /= scale;
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
    if (this.x < CONFIG.getNativeColWidth() * CONFIG.getNumCols()) {
        this.x += dt * this.speed;
    } else {
        this.setRandomValues();
    }
};

/**
 * [noop] Handle collision with another entity
 * @param  {Entity} entity - The entity that this entity
 * collided with
 * @method
 * @returns {undefined}
 */
Enemy.prototype.handleCollision = function(entity) {
    /* noop */
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
function Player() {
    GraphicEntity.call(this, 'images/char-boy.png');
    this.setInitialPosition();
}

// Set up prototype relation with GraphicEntity class
Player.prototype = Object.create(GraphicEntity.prototype);
Player.prototype.constructor = Player;

/**
 * (Re)set player to start position
 * @method
 * @returns {undefined}
 */
Player.prototype.setInitialPosition = function() {
    this.x = CONFIG.getPlayerStartCol() * CONFIG.getNativeColWidth();
    this.y = CONFIG.getPlayerStartRow() * CONFIG.getNativeRowHeight() + CONFIG.getNativeDY();
};

/**
 * Check for win condition
 * @returns {undefined}
 */
Player.prototype.update = function() {
    if (this.getCurrentRow() < 1) {
        this.win();
    }
};

/**
 * [noop] Handle collision with another entity
 * @param  {Entity} entity - The entity that this entity
 * collided with
 * @method
 * @returns {undefined}
 */
Player.prototype.handleCollision = function(entity) {
    var entityClass = entity.className();
    if (entityClass === 'Enemy') {
        this.die();
    }
};

/**
 * Player death handler
 * @method
 * @returns {undefined}
 */
Player.prototype.die = function() {
    streak.resetValue();
    deaths.incrementValue();
    this.setInitialPosition();
};

/**
 * Player win handler
 * @method
 * @returns {undefined}
 */
Player.prototype.win = function() {
    wins.incrementValue();
    streak.incrementValue();
    this.setInitialPosition();
};

/**
 * Input Handler - Allow player to move with keyboard arrow keys
 * and contain player within game boundaries <br>
 * All calculations are done with unscaled positions and sizes
 * @method
 * @param {string} direction - 'up', 'down', 'left', or 'right'
 * @returns {undefined}
 */
Player.prototype.handleInput = function(direction) {
    switch(direction) {
        case "left":
            if (this.getCurrentCol() > 0) {
                this.x -= CONFIG.getNativeColWidth();
            }
            break;
        case "right":
            if (this.getCurrentCol() < CONFIG.getNumCols() - 1) {
                this.x += CONFIG.getNativeColWidth();
            }
            break;
        case "up":
            if (this.getCurrentRow() > 0) {
                this.y -= CONFIG.getNativeRowHeight();
            }
            break;
        case "down":
            if (this.getCurrentRow() < CONFIG.getNumRows() - 1) {
                this.y += CONFIG.getNativeRowHeight();
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
    return this.x / CONFIG.getNativeColWidth();
};

/**
 * Helper - Calculate current player column from y value
 * @method
 * @returns {number}
 */
Player.prototype.getCurrentRow = function() {
    return (this.y - CONFIG.getNativeDY()) / CONFIG.getNativeRowHeight();
};

/**
 * Inherits from Entity and adds functionality for displaying text
 * @constructor
 * @classdesc Abstract class for all game entities with a text representation
 * @extends Entity
 * @param {number} x - Set <code>x</code> property
 * @param {number} y - Set <code>y</code> property
 * @param {string} label - Set <code>label</code> property
 * @param {number} value - Set initial <code>val</code> property
 * @param {object} displayOptions Optional properties object to set on canvas context
 * before rendering. Keys and values are copied into TextEntity instance and
 * should be valid properties and values of a 2d canvas context
 * @property {number} x - x-position on canvas
 * @property {number} y - y-position on canvas
 * @property {string} label - Static text to display
 * @property {number} value - Dynamic value to display
 * @property {object} displayOptions Optional properties to set on canvas context
 * before rendering
 * @returns {TextEntity}
 */
function TextEntity(x, y, label, value, displayOptions) {
    Entity.call(this);
    this.x = x;
    this.y = y;
    this.label = label;
    this.value = value;
    this.displayOptions = {};
    for (var key in displayOptions) {
        if (displayOptions.hasOwnProperty(key)) {
            this.displayOptions[key] = displayOptions[key];
        }
    }
}

// Set up prototype relation with Entity class
TextEntity.prototype = Object.create(Entity.prototype);
TextEntity.prototype.constructor = TextEntity;

/**
 * Increases the current value by one
 * @method
 * @returns {undefined}
 */
TextEntity.prototype.incrementValue = function() { this.value++; };

/**
 * Resets the current value to zero
 * @method
 * @returns {undefined}
 */
TextEntity.prototype.resetValue = function() { this.value = 0; };

/**
 * Renders label and current value to the screen as text
 * @returns {undefined}
 */
TextEntity.prototype.render = function() {
    var scale,
        fontSize,
        formattedString;

    scale = CONFIG.getScalingFactor();

    fontSize = Math.floor(18 * scale);
    fontSize = String(fontSize) + "pt";

    formattedString = this.label.replace("%value%", this.value);

    ctx.font = fontSize + " Impact";
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.lineWidth = 3;

    for (var key in this.displayOptions) {
        if (this.displayOptions.hasOwnProperty(key)) {
            ctx[key] = this.displayOptions[key];
        }
    }

    ctx.strokeText(formattedString, this.scaledX(), this.scaledY());
    ctx.fillText(formattedString, this.scaledX(), this.scaledY());
};

/**
 * Global Player instance
 * @type {Player}
 * @global
 */
var player;


/**
 * Global array to hold all Enemy instances
 * @type {Enemy[]}
 * @global
 */
var allEnemies;


/**
 * Global Streak object
 * @type {TextEntity}
 * @global
 */
var streak;

/**
 * Global Deaths object
 * @type {TextEntity}
 * @global
 */
var deaths;

/**
 * Global Wins object
 * @type {TextEntity}
 * @global
 */
var wins;

/**
 * Creates or re-initializes the following global variables, all of
 * which are expected to exist by game engine: <br>
 * <code>CONFIG</code>: An initialized {@link module:CONFIG} object <br>
 * {@link allEnemies}: All 'Enemy' instances <br>
 * {@link player}: Current Player instance <br>
 * {@link streak}: Current Streak UI element <br>
 * {@link deaths}: Current Deaths UI element
 * {@link wins}:  Current Wins UI element
 * (Note: Uses default values)
 * @function
 * @global
 */
var setOrResetGameObjects = function() {

    /* Initialize Config Object to default values if not yet initialized
     * CONFIG.getNumLanes() will return undefined if CONFIG hasn't been initialized
     */
    if (!CONFIG.getNumLanes()) { CONFIG.init(4, 7, 10, 200, 4); }

    /* If global 'player' variable exists, reset player to initial position
     * else, bind 'player' to a new Player instance
     */

    player = (player && player.setInitialPosition()) || new Player();

    /* Dump global allEnemies[] and repopulate it */

    allEnemies = [];
    for (var i = 0; i < CONFIG.getNumEnemies(); i++) {
        allEnemies.push(new Enemy());
    }

    /* Create or replace Stats instance in global 'stats' variable */

    streak = new TextEntity(
        CONFIG.getNativeCanvasWidth() - 20,
        CONFIG.getNativeCanvasHeight() - 75,
        "Current Streak: %value%",
        0,
        {
            textAlign: "right"
        }
    );

    wins = new TextEntity(
        CONFIG.getNativeCanvasWidth() - 20,
        CONFIG.getNativeCanvasHeight() - 50,
        "Total Wins: %value%",
        0,
        {
            textAlign: "right"
        }
    );

    deaths = new TextEntity(
        CONFIG.getNativeCanvasWidth() - 20,
        CONFIG.getNativeCanvasHeight() - 25,
        "Total Deaths: %value%",
        0,
        {
            textAlign: "right"
        }
    );

};

setOrResetGameObjects();

/* Create buttons */

var pendingReset;

arr = [
    "incrementNumEnemies", "decrementNumEnemies", "incrementGameDifficulty",
    "decrementGameDifficulty", "incrementNumLanes", "decrementNumLanes",
    "incrementNumCols", "decrementNumCols"
];

arr.forEach(function(e) {

    var cb = function() {
        console.log(CONFIG[e]());
        pendingReset = true;
    };
    var btn = document.createElement('button');
    btn.innerText = e;
    document.getElementById('container').appendChild(btn);
    btn.onclick = cb;
});

/********* Set Event Listeners and Handlers *********/


document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// Scale canvas to accommodate different viewport sizes
var scaleCanvas = function() {
    var canvas = ctx.canvas;
    var nativeWidth = CONFIG.getNativeCanvasWidth();
    var nativeHeight = CONFIG.getNativeCanvasHeight();
    //  - document.getElementById('container').clientHeight
    var gameAR = nativeWidth / nativeHeight;
    var viewportHeight = document.documentElement.clientHeight - canvas.offsetTop;
    var viewportWidth = document.documentElement.clientWidth;
    var scaled = calculateMaxDimensions(viewportWidth, viewportHeight, gameAR);
    var scalingFactor;
    if (scaled.width > nativeWidth) {
        // canvas.style.width = nativeWidth + "px";
        // canvas.style.height = nativeHeight + "px";
        scalingFactor = 1;
    } else {
        // canvas.style.width = scaled.width + "px";
        // canvas.style.height = scaled.height + "px";
        scalingFactor = scaled.width / nativeWidth;
    }
    CONFIG.setScalingFactor(scalingFactor);
    canvas.width = CONFIG.getCanvasWidth();
    canvas.height = CONFIG.getCanvasHeight();
};

window.onresize = scaleCanvas;

var onCanvasClick = function(evt) {
    var bound = evt.target.getBoundingClientRect();
    var localX = evt.clientX - bound.left;
    var localY = evt.clientY - bound.top;
    console.log('Click at:','x =', localX, 'y=', localY);
};
