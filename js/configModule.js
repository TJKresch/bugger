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
     * Private holder for game settings (not directly accessible outside
     * of closure scope) <br>
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
        dy: -26,
        scale: 1
    };

    /* Getters */

    function getNativeCanvasWidth() { return settings.numCols * settings.colWidth; }

    function getNativeCanvasHeight() { return getNumRows() * settings.rowHeight +
                                              settings.tileTop + settings.tileBottom; }

    function getTileHeight() { return settings.scale * settings.tileHeight; }

    function getScalingFactor() { return settings.scale; }

    function getNativeColWidth() { return settings.colWidth; }

    function getColWidth() { return settings.scale * settings.colWidth; }

    function getNativeRowHeight() { return settings.rowHeight; }

    function getRowHeight() { return settings.scale * settings.rowHeight; }

    function getNativeDY() { return settings.dy; }

    function getDY() { return settings.scale * settings.dy; }

    function getNumLanes() { return settings.numLanes; }

    function getNumCols() { return settings.numCols; }

    function getNumEnemies() { return settings.numEnemies; }

    function getBaseEnemySpeed() { return settings.baseEnemySpeed; }

    function getGameDifficulty() { return settings.gameDifficulty; }

    function getNumRows() { return settings.numLanes + 3; }

    function getCanvasWidth() { return settings.scale * getNativeCanvasWidth(); }

    function getCanvasHeight() { return settings.scale * getNativeCanvasHeight(); }

    function getPlayerStartCol() { return Math.floor(settings.numCols / 2); }

    function getPlayerStartRow() { return getNumRows() - 1; }

    /* Setters */

    function setScalingFactor(scale) { settings.scale = scale; return settings.scale; }

    function incrementGameDifficulty() {
        if (settings.gameDifficulty < 20) { return ++settings.gameDifficulty; }
    }

    function decrementGameDifficulty() {
        if (settings.gameDifficulty > 1) { return --settings.gameDifficulty; }
    }

    function incrementNumEnemies() {
        if (settings.numEnemies < 20) { return ++settings.numEnemies; }
    }

    function decrementNumEnemies() {
        if (settings.numEnemies > 0) { return --settings.numEnemies; }
    }

    function incrementNumLanes() {
        if (settings.numLanes < 10) { return ++settings.numLanes; }
    }

    function decrementNumLanes() {
        if (settings.numLanes > 1) { return --settings.numLanes; }
    }

    function incrementNumCols() {
        if (settings.numCols < 20) { return ++settings.numCols; }
    }

    function decrementNumCols() {
        if (settings.numCols > 1) {return --settings.numCols; }
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
         * Calculate what the unscaled canvas width should be
         * @type {number}
         */
        getNativeCanvasWidth: getNativeCanvasWidth,

        /**
         * Calculate what the unscaled canvas height should be
         * @type {number}
         */
        getNativeCanvasHeight: getNativeCanvasHeight,

        /**
         * Get height of full image file used for tiles
         * @returns {number}
         */
        getTileHeight: getTileHeight,

        /**
         * Get Scaling Factor
         * @returns {number}
         */
        getScalingFactor: getScalingFactor,

        /**
         * Get Unscaled Column Width
         * @returns {number}
         */
        getNativeColWidth: getNativeColWidth,

        /**
         * Get Column Width
         * @returns {number}
         */
        getColWidth: getColWidth,

        /**
         * Get Unscaled Row Height
         * @returns {number}
         */
        getNativeRowHeight: getNativeRowHeight,

        /**
         * Get Row Height
         * @returns {number}
         */
        getRowHeight: getRowHeight,

        /**
         * Get Unscaled delta
         * @returns {number}
         */
        getNativeDY: getNativeDY,

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
         * Set new Scaling Factor
         * @return {number} New Scaling Factor
         */
        setScalingFactor: setScalingFactor,

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
