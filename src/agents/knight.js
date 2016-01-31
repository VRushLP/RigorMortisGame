var BLOCK_SIZE = 50;

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
    Entity.call(this, x, y, 54, 54);
    this.game = game;
    this.level = level;
    this.xVelocity = 0;
    this.yVelocity = 0;
    
    this.maxSpeed = 12;
    this.gravity = 0.5;
    
    //setting up gamestate bools
    this.removeFromWorld = false;
    this.isStanding = true;
    this.isRunning = false;
    this.isJumping = false;
    this.isFalling = true;
    
    this.standing = new Animation(ASSET_MANAGER.getAsset("img/knight/knight standing.png"),
        0, 0, ASSET_MANAGER.getAsset("img/knight/knight standing flipped.png"),
        0, 0, 48, 54, 1, 1, false, true);
    this.jumping = new Animation(ASSET_MANAGER.getAsset("img/knight/knight jump.png"),
        0, 0, ASSET_MANAGER.getAsset("img/knight/knight jump flipped.png"),
        52, 0, 52, 61, 2, 1, false, true);
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
}

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
//    if (this.isJumping) {
//        this.jumping.elapsedTime += step;
//        if (this.jumping.isDone()) {
//            this.jumping.elapsedTime = 0;
//            this.isJumping = false;
//            this.isStanding = true;
//        }
//    }
//    console.log("isJumping " + this.isJumping + ", isStanding " + this.isFalling);
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
    Entity.prototype.draw.call(this);
};