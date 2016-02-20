var SKELETON_ATTR = {
    STARTING_HEALTH: 3,
    SPEED : 3,
    INVULNERABILITY_FRAMES: 40,
    ATTENTION_DISTANCE : 400,
    VERTICAL_TOLERANCE : -250,
    Y_ACCELERATION : .5,
    TERMINAL_VELOCITY : 6
}

var SKELETON_ANIM = {
    STAND_RIGHT: 0,
    STAND_LEFT: 1,
    RUN_RIGHT: 2,
    RUN_LEFT: 3
}

var ARCHER_ATTR = {
    RANGE : 450,
    STARTING_HEALTH : 3,
    SHOOTING_TIME : 2
}

/**
  * Create a new Normal Skeleton.
  */
function Skeleton(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 52, 59);
    this.entity.moveable = true;

    this.health = SKELETON_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;
    this.yVelocity = 0;
    this.xDestination = x;
    this.yDestination = y;
    this.confused = false;

    var skeletonIdleRight = new Animation(AM.getAsset("./img/enemy/chaser.png"), 31, 59, 0.05, true);
    skeletonIdleRight.addFrame(31, 0);
    var skeletonIdleLeft = new Animation(AM.getAsset("./img/enemy/chaser.png"), 31, 59, 0.05, true);
    skeletonIdleLeft.addFrame(0, 0);
    var skeletonRunRight = new Animation(AM.getAsset("./img/enemy/chaser.png"), 52, 59, 0.1, true);
    skeletonRunRight.addFrame(0, 118, 3);
    var skeletonRunLeft = new Animation(AM.getAsset("./img/enemy/chaser.png"), 52, 59, 0.1, true);
    skeletonRunLeft.addFrame(0, 59, 3);

    this.entity.addAnimation(skeletonIdleRight);
    this.entity.addAnimation(skeletonIdleLeft);
    this.entity.addAnimation(skeletonRunRight);
    this.entity.addAnimation(skeletonRunLeft);
    this.entity.setAnimation(SKELETON_ANIM.STAND_RIGHT);
}

Skeleton.prototype = {

    update: function () {
        //compute updates that are independent of player distance
        if (this.invulnerableFrames > 0) {
            this.invulnerableFrames--;

            if (this.invulnerableFrames === 0) {
                this.confused = false;
            }
        }

        //Skeletons should always know if they're falling
        if (this.entity.game.getBottomCollisions(this.entity).length === 0) {
            //If there is no bottom collision, then the agent is in the air, and should accelerate downwards.
            this.yVelocity += SKELETON_ATTR.Y_ACCELERATION;
            if (this.yVelocity >= SKELETON_ATTR.TERMINAL_VELOCITY) this.yVelocity = SKELETON_ATTR.TERMINAL_VELOCITY;
        } else if (this.yVelocity > 0) {
            //If there is a bottom collision, then the agent is on the ground, and should have no downwards velocity.
            this.yVelocity = 0;
        }
        if (this.yVelocity !== 0) {
            this.entity.game.requestMove(this, 0, this.yVelocity);
        }

        //Skeletons should only do math if they are not confused
        if (!this.confused) {
            var player = this.entity.game.playerAgent.entity;
            if (this.entity.game.playerAgent.velocity === 0) {

                //We probably want to do this calculation once within Knight.
                //At the moment it looks like all enemies will want to know this point.
                var knightPoint = {
                    x: (player.x + (player.width) / 2),
                    y: (player.y + (player.height) / 2)
                };

                var skeletonPoint = {
                    x: (this.entity.x + (this.entity.width) / 2),
                    y: (this.entity.y + (this.entity.height) / 2)
                };

                var verticalDistance = skeletonPoint.y - knightPoint.y;

                if (verticalDistance > SKELETON_ATTR.VERTICAL_TOLERANCE
                    && verticalDistance < 0
                    && Math.abs(knightPoint.x - skeletonPoint.x) <= SKELETON_ATTR.ATTENTION_DISTANCE) {
                    this.xDestination = knightPoint.x; //The skeleton noticed you
                }
            }

            if (this.entity.x !== this.xDestination) {
                var distance = -(this.entity.x - this.xDestination);                     //Reassign so negative values are to your left, positive values are to your right

                if (distance < 0) {
                    this.entity.game.requestMove(this, Math.max(distance, -SKELETON_ATTR.SPEED), 0);
                    if (this.entity.x != this.xDestination) {
                        this.entity.currentAnimation = SKELETON_ANIM.RUN_LEFT;
                    } else {
                        this.entity.currentAnimation = SKELETON_ANIM.STAND_LEFT;
                    }
                } else { //distance >= 0
                    this.entity.game.requestMove(this, Math.min(distance, SKELETON_ATTR.SPEED), 0);
                    if (this.entity.x != this.xDestination) {
                        this.entity.currentAnimation = SKELETON_ANIM.RUN_RIGHT;
                    } else {
                        this.entity.currentAnimation = SKELETON_ANIM.STAND_RIGHT;
                    }
                }
            }
        } else {
            if (this.entity.currentAnimation === SKELETON_ANIM.RUN_LEFT) {
                this.entity.currentAnimation = SKELETON_ANIM.STAND_LEFT;
            } else if (this.entity.currentAnimation === SKELETON_ANIM.RUN_RIGHT) {
                this.entity.currentAnimation = SKELETON_ANIM.STAND_RIGHT;
            }
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
                if (this.health <= 0) {
                    var index = this.entity.game.agents.indexOf(this);
                    this.entity.game.agents.splice(index, 1);
                } else {
                    this.confused = true;
                }
            }
        }
    },

    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            this.entity.game.requestInputSend(agent, "damage", 1);
        }
    }
}


function Archer (game, x, y, stage) {
    this.entity = new Entity(game, x, y, 68, 60);
    // this.entity.moveable = false;

    this.stage = stage;
    this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;

    this.health = ARCHER_ATTR.STARTING_HEALTH;
    this.invulnerableFrames = 0;
    this.vision = ARCHER_ATTR.RANGE;

    var archerRight = new Animation(AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.05, true);
    archerRight.addFrame(73, 0);
    var archerLeft = new Animation(AM.getAsset("./img/enemy/archer.png"), 68, 60, 0.05, true);
    archerLeft.addFrame(0, 0);

    this.entity.animationList.push(archerRight);
    this.entity.animationList.push(archerLeft);

    this.removeFromWorld = false;
}

function distance(me, other) {
    return Math.sqrt(Math.pow((me.x - other.x), 2) + Math.pow((me.y - other.y), 2));
}

Archer.prototype.update = function () {
    if (this.invulnerableFrames > 0) {
        this.invulnerableFrames--;
    }

    if (this.health <= 0) {
        this.removeFromWorld = true;
        var index = this.stage.entityList.indexOf(this);
        this.stage.entityList.splice(index, 1);
        index = this.stage.enemies.indexOf(this);
        this.stage.enemies.splice(index, 1);
        return;
    }

    if (distance(this.entity.game.playerAgent.entity, this.entity) <= this.vision) {
        if (this.timeDurationNextArrow === ARCHER_ATTR.SHOOTING_TIME) {
        var playerCenterX = this.entity.game.playerAgent.entity.x + (this.entity.game.playerAgent.entity.width / 2);
        var playerCenterY = this.entity.game.playerAgent.entity.y + (this.entity.game.playerAgent.entity.height / 2);

        var archerCenterX = this.entity.x + Math.floor(this.width / 2);
        var archerCenterY = this.entity.y + Math.floor(this.height / 2);

        var distanceX = playerCenterX - archerCenterX;
        var distanceY = playerCenterY - archerCenterY;
        var arrow = new Arrow(archerCenterX, archerCenterY, distanceX, distanceY, this.entity.game);
        this.stage.enemies.push(arrow);
        this.stage.entityList.push(arrow);
        this.entity.game.addAgent(arrow);
        }
        this.timeDurationNextArrow -= this.entity.game.clockTick;
        if (this.timeDurationNextArrow <= 0) {
            this.timeDurationNextArrow = ARCHER_ATTR.SHOOTING_TIME;
        }
    }
};

Archer.prototype.draw = function (ctx, cameraRect, tick) {
    if (this.entity.game.playerAgent.x > this.x) {
        this.currentAnimation = 0;
    } else {
        this.currentAnimation = 1;
    }
    Entity.prototype.draw.call(this);
}

function Arrow (x, y, xVel, yVel, game) {
    this.entity = new Entity(game, x, y, 24, 5);
    this.centerX = x;
    this.centerY = y;
    this.maxVel = 7;
    var scale = this.maxVel / Math.sqrt(xVel * xVel + yVel * yVel)
    this.xVel = xVel * scale;
    this.yVel = yVel * scale;
    this.width = 6;
    this.height = 6;
    this.removeFromWorld = false;
}

Arrow.prototype = {
    update : function () {
        // var tempX = this.centerX + this.xVel;
        // var tempY = this.centerY + this.yVel;
        // if (this.game.getBottomCollisions(this).length > 0) {
        //
        // }
        // if (!this.level.obstacleAt(tempX - (this.width / 2), tempY - (this.height / 2),
        //         this.width, this.height)) {
        //     this.centerX = tempX;
        //     this.centerY = tempY;
        // } else {
        //     this.removeFromWorld = true;
        // }
        // this.currentX_px = this.centerX;
        // this.currentY_px = this.centerY;
    },

    draw : function (ctx, cameraRect, tick) {
        // ctx.fillStyle = "White";
        // ctx.fillRect(this.centerX - (this.width / 2) - cameraRect.left,
        //              this.centerY - (this.height / 2) - cameraRect.top,
        //              this.width, this.height);
    }
}
