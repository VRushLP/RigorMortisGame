var SKELETON_ATTR = {
    STARTING_HEALTH: 3,
    INVULNERABILITY_FRAMES: 40,
}

var SKELETON_ANIM = {
    STANDING_RIGHT: 0,
    STANDING_LEFT: 1,
}

var ARCHER_ATTR = {
    STARTING_HEALTH : 3,
    SHOOTING_TIME : 2
}

/**
  * Create a new Normal Skeleton.
  */
function Skeleton(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 52, 60);

    this.health = SKELETON_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;
    this.yVelocity = 0;
    this.xVelocity = 1;

    var skeletonRight = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonRight.addFrame(52, 0);
    var skeletonLeft = new Animation(AM.getAsset("./img/enemy/skeletonChaser mockup.png"), 52, 60, 0.05, true);
    skeletonLeft.addFrame(0, 0);

    this.entity.addAnimation(skeletonRight);
    this.entity.addAnimation(skeletonLeft);
    this.entity.setAnimation(SKELETON_ANIM.STANDING_RIGHT);
}

Skeleton.prototype = {

    update: function() {
        if (this.invulnerableFrames > 0) {
            this.invulnerableFrames--;
        }
        if (this.health <= 0) {
            var index = this.entity.game.agents.indexOf(this);
            this.entity.game.agents.splice(index, 1);
        }


        if (this.xVelocity > 0) {
            this.entity.currentAnimation = SKELETON_ANIM.STANDING_RIGHT;
        } else {
            this.entity.currentAnimation = SKELETON_ANIM.STANDING_LEFT;
        }
    },

    draw: function() {
        this.entity.draw();
    },

    readInput: function(input, modifier) {
        if (input === "damage") {
            if (this.invulnerableFrames === 0) {
                this.invulnerableFrames = SKELETON_ATTR.INVULNERABILITY_FRAMES;
                this.health--;
            }
        }
    },

    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}


function Archer (x, y, game, stage) {
    Entity.call(this, game, x, y, 68, 60);
    this.game = game;
    this.stage = stage;
    this.yVelocity = 0;
    this.xVelocity = 0;
    this.timeDurationNextArrow = GAME_CONSTANT.SHOOTING_TIME;

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
    // FIXME
    if (this.game.camera.xView + this.game.ctx.canvas.width > this.x &&
        this.x > this.game.camera.xView) {
        if (this.timeDurationNextArrow === ARCHER_ATTR.SHOOTING_TIME) {
        var playerCenterX = player.entity.x + (player.entity.width / 2);
        var playerCenterY = player.entity.y + (player.entity.height / 2);

        var archerCenterX = this.x + Math.floor(this.width / 2);
        var archerCenterY = this.y + Math.floor(this.height / 2);

        var distanceX = playerCenterX - archerCenterX;
        var distanceY = playerCenterY - archerCenterY;
        var arrow = new Arrow(archerCenterX, archerCenterY, distanceX, distanceY, this.stage);
        this.stage.enemies.push(arrow);
        this.game.addEntity(arrow);
        }
        this.timeDurationNextArrow -= this.game.clockTick;
        if (this.timeDurationNextArrow <= 0) {
            this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;
        }
    }
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
        this.currentX_px = this.centerX;
        this.currentY_px = this.centerY;
    },

    draw : function (ctx, cameraRect, tick) {
        ctx.fillStyle = "White";
        ctx.fillRect(this.centerX - (this.width / 2) - cameraRect.left,
                     this.centerY - (this.height / 2) - cameraRect.top,
                     this.width, this.height);
    }
}

function Wisp (x, y, level) {
    Entity.call(this, x, y, 44, 50);
    this.level = level;

    var wispRight = new Animation(AM.getAsset("./img/enemy/wispChaser mockup.png"), 44, 50, 0.05, true);
    wispRight.addFrame(44, 0);
    var wispLeft = new Animation(AM.getAsset("./img/enemy/wispChaser mockup.png"), 44, 50, 0.05, true);
    wispLeft.addFrame(0, 0);

    this.animationList.push(wispRight);
    this.animationList.push(wispLeft);

    this.isFollowing = false;
    this.removeFromWorld = false;
}

Wisp.prototype = {
    update : function(x, y, width, height) {
        if (x > this.currentX_px) {
            this.currentAnimation = 0;
        } else {
            this.currentAnimation = 1;
        }
        if (this.isFollowing) {
            for (var i = 0; i < this.level.enemies.length; i += 1) {
                if (this.level.enemies[i] === this) {
                    this.level.enemies.splice(i, 1);
                    break;
                }
            }
        }
        Entity.prototype.update.call(this);
    },

    draw : function(ctx, cameraRect, tick) {
        Entity.prototype.draw.call(this, ctx, cameraRect, tick);
    }
}
