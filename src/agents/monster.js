var SHOOTING_TIME = 2;

function Skeleton (x, y, level) {
    Entity.call(this, x, y, 52, 60);
    this.level = level;
    
    this.health = 6;
    this.yVelocity = 0;
    this.xVelocity = 1;
    
    var skeletonRight = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonRight.addFrame(52, 0);
    var skeletonLeft = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonLeft.addFrame(0, 0);
    
    this.animationList.push(skeletonRight);
    this.animationList.push(skeletonLeft);
    
    this.removeFromWorld = false;
}

Skeleton.prototype.update = function () {
    var tempX = this.currentX_px + this.xVelocity;
    var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
    if (!obstacle) {
        this.xVelocity *= -1;
        this.currentX_px += this.xVelocity;
    } else {
        this.currentX_px = tempX;
    }
    Entity.prototype.update.call(this);
};

Skeleton.prototype.draw = function (ctx, cameraRect, tick) {
    if (this.xVelocity > 0) {
        this.currentAnimation = 0;
    } else {
        this.currentAnimation = 1;
    }
    Entity.prototype.draw.call(this, ctx, cameraRect, tick);
    var percent = this.health / 6;
    if (percent > 0.4) {
        ctx.fillStyle = "green";
    } else {  
        ctx.fillStyle = "red";
    }
    ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 10, 
                    this.width * percent, 5);
};

function Archer (x, y, game, level) {
    Entity.call(this, x, y, 68, 60);
    this.game = game;
    this.level = level;
    this.yVelocity = 0;
    this.xVelocity = 0;
    this.timeDurationNextArrow = SHOOTING_TIME;
    
    this.health = 4;
    
    var archerRight = new Animation(AM.getAsset("./img/enemy/skeletonArcher mockup.png"), 68, 60, 0.05, true);
    archerRight.addFrame(68, 0);
    var archerLeft = new Animation(AM.getAsset("./img/enemy/skeletonArcher mockup.png"), 68, 60, 0.05, true);
    archerLeft.addFrame(0, 0);
    
    this.animationList.push(archerRight);
    this.animationList.push(archerLeft);
    
    this.removeFromWorld = false;
}

Archer.prototype.update = function (x, y, width, height) {
    // Check if the archer is in the canvas
    if (this.game.camera.xView + this.game.ctx.canvas.width > this.currentX_px &&
        this.currentX_px > this.game.camera.xView) {
        if (this.timeDurationNextArrow === SHOOTING_TIME) {
        var playerCenterX = x + (width / 2);
        var playerCenterY = y + (height / 2);
        
        var archerCenterX = this.currentX_px + Math.floor(this.width / 2);
        var archerCenterY = this.currentY_px + Math.floor(this.height / 2);
        
        var distanceX = playerCenterX - archerCenterX;
        var distanceY = playerCenterY - archerCenterY;
        var arrow = new Arrow(archerCenterX, archerCenterY, distanceX, distanceY, this.level);
        this.level.enemies.push(arrow);
        this.game.addEntity(arrow);
        }
        this.timeDurationNextArrow -= this.game.clockTick;
        if (this.timeDurationNextArrow <= 0) {
            this.timeDurationNextArrow = SHOOTING_TIME;
        }
    }
    Entity.prototype.update.call(this);
};

Archer.prototype.draw = function (ctx, cameraRect, tick) {
    if (this.game.player.currentX_px > this.currentX_px) {
        this.currentAnimation = 0;
    } else {
        this.currentAnimation = 1;
    }
    Entity.prototype.draw.call(this, ctx, cameraRect, tick);
    var percent = this.health / 4;
    if (percent > 0.4) {
        ctx.fillStyle = "green";
    } else {  
        ctx.fillStyle = "red";
    }
    ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top - 10, 
                    this.width * percent, 5);
}

function Arrow (x, y, xVel, yVel, level) {
    this.centerX = x;
    this.centerY = y;
    this.maxVel = 7;
    var scale = this.maxVel / Math.sqrt(xVel * xVel + yVel * yVel)
    this.xVel = xVel * scale;
    this.yVel = yVel * scale;
    this.level = level;
    this.width = 6;
    this.height = 6;
    this.removeFromWorld = false;
}

Arrow.prototype = {
    update : function () {
        var tempX = this.centerX + this.xVel;
        var tempY = this.centerY + this.yVel;
        if (!this.level.obstacleAt(tempX - (this.width / 2), tempY - (this.height / 2), 
                this.width, this.height)) {
            this.centerX = tempX;
            this.centerY = tempY;
        } else {
            this.removeFromWorld = true;
        }
    },
    
    draw : function (ctx, cameraRect, tick) {
        ctx.fillStyle = "White";
        ctx.fillRect(this.centerX - (this.width / 2) - cameraRect.left,
                     this.centerY - (this.height / 2) - cameraRect.top,
                     this.width, this.height);
    }
}