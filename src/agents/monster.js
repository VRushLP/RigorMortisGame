var DURATION_ARROW = 2;

function Monster (x, y, level) {
    Entity.call(this, x, y, 50, 50);
    this.level = level;
    
    this.health = 6;
    this.yVelocity = 0;
    this.xVelocity = 1;
    
    this.removeFromWorld = false;
}

Monster.prototype = new Entity();
Monster.prototype.constructor = Monster;

Monster.prototype.update = function () {
    var tempX = this.currentX_px + this.xVelocity;
    var obstacle = this.level.obstacleAt(tempX, this.currentY_px, this.width, this.height);
    if (!obstacle) {
        this.xVelocity *= -1;
        this.currentX_px += this.xVelocity;
    } else {
        this.currentX_px = tempX;
    }
};

Monster.prototype.draw = function (ctx, xView, yView) {
    ctx.fillStyle = "Purple";
    ctx.fillRect(this.currentX_px - xView, this.currentY_px - yView,
                    this.width, this.height);
};

function Archer (x, y, game, level) {
    Entity.call(this, x, y, 50, 50);
    this.level = level;
    this.game = game;
    this.yVelocity = 0;
    this.xVelocity = 0;
    this.timeDurationNextArrow = DURATION_ARROW;
    
    this.health = 4;
    
    this.removeFromWorld = false;
}

Archer.prototype = new Entity();
Archer.prototype.constructor = Archer();

Archer.prototype.update = function (x, y, width, height) {
    // if the archer is in the canvas, shoot the arrow to the player.
    if (this.timeDurationNextArrow === DURATION_ARROW) {
        var playerCenterX = x + Math.floor(width / 2);
        var playerCenterY = x + Math.floor(height / 2);
        
        var archerCenterX = this.currentX_px + Math.floor(this.width / 2);
        var archerCenterY = this.currentY_px + Math.floor(this.height / 2);
        
        var distanceX = archerCenterX - playerCenterX;
        var distanceY = archerCenterY - playerCenterY;
        
        this.game.addEntity(new Arrow(archerCenterX, archerCenterY, 
                Math.floor(distanceX / this.timeDurationNextArrow),
                Math.floor(distanceY / this.timeDurationNextArrow)));
    } else {
        this.timeDurationNextArrow -= this.game.clockTick;
        if (this.timeDurationNextArrow <= 0) {
            this.timeDurationNextArrow === DURATION_ARROW;
        }
    }
};

Archer.prototype.draw = function (ctx, xView, yView) {
    ctx.fillStyle = "Purple";
    ctx.fillRect(this.currentX_px - xView, this.currentY_px - yView,
                    this.width, this.height);
}

function Arrow (x, y, xVel, yVel, level) {
    this.centerX = x;
    this.centerY = y;
    this.xVel = xVel;
    this.yVel = yVel;
    this.level = level;
    this.width = 6;
    this.height = 6;
}

Arrow.prototype = {
    update : function () {
        var tempX = this.centerX + this.xVel;
        var tempY = this.centerY + this.yVel;
        if (!this.level.obstacleAt(tempX - (this.width / 2), tempY - (this.height / 2), 
                this.width, this.height)) {
            this.centerX = tempX;
            this.centerY = tempY;
        }
    },
    
    draw : function (ctx, xView, yView) {
        ctx.fillStyle = "Purple";
        ctx.fillRect(this.centerX - (this.width / 2) - xView,
                     this.centerY - (this.height / 2) - yView,
                     this.width, this.height);
    }
}