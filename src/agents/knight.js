var BLOCK_SIZE = 50;
var INJURE_TIME = 2;
function Entity (x, y, width, height) {
    this.currentX_px = x * BLOCK_SIZE;
    this.currentY_px = y * BLOCK_SIZE;
    this.width = width;
    this.height = height;
}

Entity.prototype = {
    update : function () {},
    draw : function (ctx) {}
}

function Knight (x, y, game, level) {
    Entity.call(this, x, y, 50, 50);
    this.game = game;
    this.level = level;
    this.xVelocity = 0;
    this.yVelocity = 0;
    
    this.health = 10;
    this.maxHealth = 10;
    
    this.maxSpeed = 12;
    this.gravity = 0.5;
    
    this.injureTime = INJURE_TIME;
    
    //setting up gamestate bools
    this.removeFromWorld = false;
    this.isStanding = true;
    this.isRunning = false;
    this.isJumping = false;
    this.isFalling = true;
    this.isAttacking = false;
    this.isInjure = false;
    
    this.standing = new Animation(ASSET_MANAGER.getAsset("img/knight/knight standing.png"),
        0, 0, ASSET_MANAGER.getAsset("img/knight/knight standing flipped.png"),
        0, 0, 48, 54, 1, 0.05, false, true);
    this.jumping = new Animation(ASSET_MANAGER.getAsset("img/knight/knight jump.png"),
        0, 0, ASSET_MANAGER.getAsset("img/knight/knight jump flipped.png"),
        52, 0, 52, 61, 2, 0.05, false, true);
    this.running = new Animation(ASSET_MANAGER.getAsset("img/knight/knight run.png"),
        0, 0, ASSET_MANAGER.getAsset("img/knight/knight run flipped.png"),
        162, 0, 54, 54, 4, 0.05, false, true);
}
Knight.prototype = new Entity();
Knight.prototype.constructor = Knight;

Knight.prototype.moveX = function () {
    if (this.game.keyStatus["d"])  {
        this.standing.isFlipped = false;
        this.jumping.isFlipped = false;
        this.running.isFlipped = false;
        this.isRunning = true;
        this.isStanding = false;
        this.xVelocity = 4;
    } else if (this.game.keyStatus["a"]) {
        this.standing.isFlipped = true;
        this.jumping.isFlipped = true;
        this.running.isFlipped = true;
        this.isRunning = true;
        this.isStanding = false;
        this.xVelocity = -4;
    } else if (!this.game.keyStatus["d"] && !this.game.keyStatus["a"]) {
        this.xVelocity = 0;
        this.isRunning = false;
        this.isStanding = true;
    }
    var tempX = this.currentX_px + this.xVelocity;
    var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
    if (!obstacle) {
        this.currentX_px = tempX;
    } else if (obstacle.fieldType === "door") {
        // TODO activate the button.
        this.level.displayHidden(this.currentX_px, this.currentY_px, obstacle);
        this.currentX_px = tempX;
    }
};

Knight.prototype.moveY = function () {
    if (this.yVelocity < this.maxSpeed) {
        this.yVelocity += this.gravity;
    }
    var tempY = this.currentY_px + this.yVelocity;
    var obstacle = this.level.obstacleAt(this.currentX_px, tempY, this.width, this.height);
    if (!obstacle || obstacle.fieldType === "door") {
        this.currentY_px = tempY;
    } else {
        if (this.game.keyStatus["w"] && this.yVelocity > 0) {
            this.isJumping = true; this.isStanding = false;
            this.yVelocity = -15;
        } else {
            if (this.yVelocity > 0) { 
                this.isJumping = false;
            }
            this.yVelocity = 0;
        }
    }
    if (this.yVelocity > 0) {
        this.isFalling = true;
    } else if (this.yVelocity < 0) {
        this.isFalling = false;
    }
//    console.log(this.yVelocity);
//    console.log ("is Jumping " + this.isJumping + " is Falling " + this.isFalling);
};

Knight.prototype.dealWithMonster = function (monster) {
    if (this.isAttacking) {
        // TODO deal with the monster attacks at behind.
        monster.health -= 3;
        if (monster.health === 0) {
            monster.removeFromWorld = true;
        }
    } else {
        if (this.health > 0 && !this.isInjure) { 
            this.health -= 2;
            this.isInjure = true;
            // TODO make some effects when the knight touches the monster.
        }
    }
};

Knight.prototype.update = function () {
    var step = this.game.clockTick;
    if (this.game.keysDown) {
        this.running.elapsedTime += step;
    } else {
        if (!this.isJumping && !this.isFalling) {
            this.isStanding = true;
        }
    }
    this.moveX();
    this.moveY();
    
    var monster = this.level.enemyAt(this);
    if (monster) {
        // console.log(monster);
        this.dealWithMonster(monster);
    }
    if (this.isInjure) {
        this.injureTime -= step;
    }
    if (this.injureTime <= 0) {
        this.injureTime = INJURE_TIME;
        this.isInjure = false;
    }
    
    if (this.health === 0) {
        // TODO reset a map or go back to the check point
    }
    
    Entity.prototype.update.call(this);
};

Knight.prototype.draw = function (ctx, xView, yView) {
    if (this.isJumping) {
        this.jumping.drawFrame(ctx, this.currentX_px - xView, this.currentY_px - yView, this.isFalling);
    } else if (this.isRunning) {
        this.running.drawFrame(ctx, this.currentX_px - xView, this.currentY_px - yView);
    } else if (this.isStanding) {
        this.standing.drawFrame(ctx, this.currentX_px - xView, this.currentY_px - yView);
    } 
    var percent = this.health / this.maxHealth;
    ctx.fillStyle = "black";
    ctx.fillRect(this.currentX_px - xView, this.currentY_px - yView - 10, 
                    this.width, 5);
    if (percent > 0.4) {
        ctx.fillStyle = "green";
    } else {  
        ctx.fillStyle = "red";
    }
    ctx.fillRect(this.currentX_px - xView, this.currentY_px - yView - 10, 
                    this.width * percent, 5);
    Entity.prototype.draw.call(this);
};