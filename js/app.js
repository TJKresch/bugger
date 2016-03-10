var tileWidth = 101;
var tileHeight = 83;
var trueTileHeight = 171;
var playerStartCol = 2; // (0 to 4)
var playerStartRow = 5; // (0 to 5)
var dy = -26; // Vertical adjustment to center sprites in tiles

var numEnemies = 5;
var baseEnemySpeed = 200;
var gameDifficulty = 2; // Set to any integer between 1 (easy) and 9(very hard)


var win = function() {
    stats.incrementStreak();
    player = new Player();
};

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = 0;
    this.y = 0;
    this.speed = 100;

    this.setRandomValues();
};

// Get random integer in [min, max)
var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    if (this.x < tileWidth * 5) {
        this.x += dt * this.speed;
    } else {
        this.setRandomValues();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.setRandomValues = function() {
    this.x = getRandomInt(1,4) * -tileWidth;
    this.y = getRandomInt(1,4) * tileHeight + dy;
    this.speed = baseEnemySpeed + 50 * getRandomInt(1, gameDifficulty + 1);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.x = playerStartCol * tileWidth;
    this.y = playerStartRow * tileHeight + dy;
};

Player.prototype.update = function() {
    if (this.getCurrentRow() < 1) {
        win();
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(direction) {
    switch(direction) {
        case "left":
            if (this.getCurrentColumn() > 0) {
                this.x -= tileWidth;
            }
            break;
        case "right":
            if (this.getCurrentColumn() < 4) {
                this.x += tileWidth;
            }
            break;
        case "up":
            if (this.getCurrentRow() > 0) {
                this.y -= tileHeight;
            }
            break;
        case "down":
            if (this.getCurrentRow() < 5) {
                this.y += tileHeight;
            }
            break;
    }
};

Player.prototype.getCurrentColumn = function() {
    return this.x / tileWidth;
};

Player.prototype.getCurrentRow = function() {
    return (this.y - dy) / tileHeight;
};

Player.prototype.die = function() {
    stats.resetStreak();
    player = new Player();
};

var checkCollisions = function() {
    allEnemies.forEach(function(enemy) {
        checkCollision(enemy, player) ? player.die() : 1;
    })
};

var checkCollision = function(e, p) {
    var eLeft = e.x;
    var eRight = e.x + tileWidth;
    var eTop = e.y + 65;
    var eBottom = e.y + tileHeight - 30;
    var pLeft = p.x + 30;
    var pRight = p.x + tileWidth - 30;
    var pTop = p.y + 45;
    var pBottom = p.y + tileHeight;
    return !(pLeft > eRight || pRight < eLeft || pTop > eBottom || pBottom < eTop);

};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var player = new Player();

var allEnemies = [];
for (var i = 0; i < numEnemies; i++) {
    allEnemies.push(new Enemy());
}

var stats = {
    streakX: 505 - 35,
    streakY: 606 - 80,
    streak: 0
};
stats.incrementStreak = function() { this.streak++; };
stats.resetStreak = function() { this.streak = 0; };
stats.render = function() {
    ctx.font = "36pt Impact";
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeText(stats.streak, stats.streakX, stats.streakY);
    ctx.fillText(stats.streak, stats.streakX, stats.streakY);
};

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
