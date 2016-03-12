/**
 * Initializes, Encapsulates, and Calculates all configurations,
 * provides safe access methods for configs to app and game engine <br>
 * Stores data in private closure scope: {@link module:CONFIG~settings} <br>
 * Implements an adaptation of Crockford's "Revealing Module Pattern"
 * @module CONFIG
 */
var CONFIG = CONFIG || (function(){

    // Constant values refer to current tileset
    // will need to be updated if different sized tiles (images) are used

    /**
     * Private holder for game settings (not accessible outside closure scope) <br>
     * Values set by CONFIG.init() <br>
     * All 'getter' methods pull data from here
     * @alias module:CONFIG~settings
     */
    var  settings = {
        colWidth: 101,
        rowHeight: 83,
        tileBottom: 37,
        tileTop: 51,
        tileHeight: 171,
        dy: -26
    };

    /* Getters */

    function getColWidth() { return settings.colWidth; }

    function getRowHeight() { return settings.rowHeight; }

    function getDY() { return settings.dy; }

    function getNumLanes() { return settings.numLanes; }

    function getNumCols() { return settings.numCols; }

    function getNumEnemies() { return settings.numEnemies; }

    function getBaseEnemySpeed() { return settings.baseEnemySpeed; }

    function getGameDifficulty() { return settings.gameDifficulty; }

    function getNumRows() { return settings.numLanes + 3; }

    function getCanvasWidth() { return settings.numCols * settings.colWidth; }

    function getCanvasHeight() {
        return getNumRows() * settings.rowHeight + settings.tileTop + settings.tileBottom;
    }

    function getPlayerStartCol() { return Math.floor(settings.numCols / 2); }

    function getPlayerStartRow() { return getNumRows() - 1; }

    /* Setters */

    function incrementGameDifficulty() {
        if (settings.gameDifficulty < 9) { return ++settings.gameDifficulty; }
    }

    function decrementGameDifficulty() {
        if (settings.gameDifficulty > 2) { return --settings.gameDifficulty; }
    }

    function incrementNumEnemies() {
        if (settings.numEnemies < 20) { return ++settings.numEnemies; }
    }

    function decrementNumEnemies() {
        if (settings.numEnemies > 2) { return --settings.numEnemies; }
    }

    function incrementNumLanes() {
        if (settings.numLanes < 5) { return ++settings.numLanes; }
    }

    function decrementNumLanes() {
        if (settings.numLanes > 1) { return --settings.numLanes; }
    }

    function incrementNumCols() {
        if (settings.numCols < 11) { return ++settings.numCols; }
    }

    function decrementNumCols() {
        if (settings.numCols > 2) {return --settings.numCols; }
    }

    /** @lends module:CONFIG */
    var out = {

        /**
         * Initialize CONFIG object
         * @param {number} numLanes - Number of enemy 'traffic lanes' for game
         * (influences canvas height)
         * @param {number} numCols - Total number of columns for game (influences canvas width)
         * @param {number} numEnemies - Total number of enemies for game
         * @param {number} baseEnemySpeed - Lowest base enemy speed
         * @param {number} gameDifficulty - This controls the top
         * speed at which enemies can move as well as the range of possible speeds;
         * Set to any integer between 1 (easy, top speed slow, single-speed) and about 9
         * (very hard, top speed very fast, 9-speeds).
         * This value can be set higher than 9, but that will quickly make the game too
         * difficult to play.
         */
        init: function(numLanes, numCols, numEnemies, baseEnemySpeed, gameDifficulty) {
            settings.numLanes = numLanes;
            settings.numCols = numCols;
            settings.numEnemies = numEnemies;
            settings.baseEnemySpeed = baseEnemySpeed;
            settings.gameDifficulty = gameDifficulty;
        },

        /**
         * Get Column Width
         * @returns {number}
         */
        getColWidth: getColWidth,

        /**
         * Get Row Height
         * @returns {number}
         */
        getRowHeight: getRowHeight,

        /**
         * Get delta-y (y-offset to position player in center of cells)
         * @returns {number}
         */
        getDY: getDY,

        /**
         * Get Number of enemy 'traffic lanes'
         * @returns {number}
         */
        getNumLanes: getNumLanes,

        /**
         * Get Number of Columns
         * @returns {number}
         */
        getNumCols: getNumCols,

        /**
         * Get Number of Enemies
         * @returns {number}
         */
        getNumEnemies: getNumEnemies,

        /**
         * Get Base enemy speed
         * @returns {number}
         */
        getBaseEnemySpeed: getBaseEnemySpeed,

        /**
         * Get game difficulty
         * @returns {number}
         */
        getGameDifficulty: getGameDifficulty,

        /**
         * Get Number of Rows
         * @returns {number}
         */
        getNumRows: getNumRows,

        /**
         * Get Canvas Width (Note: This is the size the canvas SHOULD be;
         * this method can be used when setting new canvas sizes)
         * @returns {number}
         */
        getCanvasWidth: getCanvasWidth,

        /**
         * Get Canvas Height (Note: This is the size the canvas SHOULD be;
         * this method can be used when setting new canvas sizes)
         * @returns {number}
         */
        getCanvasHeight: getCanvasHeight,

         /**
         * Get the Column in which the player should start
         * @returns {number}
         */
        getPlayerStartCol: getPlayerStartCol,

        /**
         * Get the Row in which the player should start
         * @returns {number}
         */
        getPlayerStartRow: getPlayerStartRow,


        /**
         * Increase game difficulty by 1
         * @returns {number} Updated game difficulty
         */
        incrementGameDifficulty: incrementGameDifficulty,

        /**
         * Decrease game difficulty by 1
         * @returns {number} Updated game difficulty
         */
        decrementGameDifficulty: decrementGameDifficulty,

        /**
         * Increase number of enemies by 1
         * @returns {number} Updated number of enemies
         */
        incrementNumEnemies: incrementNumEnemies,

        /**
         * Decrease number of enemies by 1
         * @returns {number} Updated number of enemies
         */
        decrementNumEnemies: decrementNumEnemies,

        incrementNumLanes: incrementNumLanes,

        decrementNumLanes: decrementNumLanes,

        incrementNumCols: incrementNumCols,

        decrementNumCols: decrementNumCols

    };

    return out;
}());
